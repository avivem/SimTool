""" Services are functions for interacting with the models without resorting to
HTTP requests. DataStore pulls all the pieces together and lets you have a running
"instance" of SimTool.

Written by Aviv Elazar-Mittelman. October 2020.
"""

import simpy
import collections
import numpy as np
import io
import math
import sys
import logging
import pprint
from simtool_engine.util.simtool_logging import SimToolLogging

from simtool_engine.services.container_service import DSContainerServiceMixin as Containers
from simtool_engine.services.nodes_service import DSNodesServiceMixin as Nodes
from simtool_engine.services.logic_service import DSLogicServiceMixin as Logic


class DataStore(Containers, Nodes, Logic):
    """ DataStore is a simulation manager that can handle a single simulation per
    DataStore object. The methods take String inputs to be functionally equivalent
    to the HTTP requests made by the GUI. DataStore lets you create, run, and view
    results of simulations without touching any of the inner classes.

    Many of the functions take a parameter <inputs>. **inputs in a function call
    means that Python is expecting a dict, and will attempt to unpack it to use
    as parameters. Please refer to the appropriate files to find the correct
    parameters (e.g. simtool_nodes_model for functions dealing with nodes.)

    It is reccomended to attempt an example using the internal classes directly
    before playing with DataStore to gain an understanding of the different concepts.
    """

    # enums representing node types. Values are arbitrary.
    START = 1000
    STATION = 2000
    END = 3000
    GLOBAL = 4000

    def __init__(self, start=0):
        self.nodes = {}
        self.starts = {}
        self.stations = {}
        self.ends = {}
        self.globals = {}
        self.blueprints = {}
        self.last_run = None
        self.runs = []
        self.start_time = 0
        self.end_time = None
        # Create env with given start time.
        self.env = simpy.Environment(start)

        # Set up logging.

        # NOTE: at the moment, loggers are hardcoded, so attempts to run multiple
        # simulations at the same time will lead to mixed output. To resolve this,
        # will need to dynamically create loggers and pass logger names to inner
        # classes.

        self.data_logger = SimToolLogging.getDataLog()
        self.evnt_logger = SimToolLogging.getEventLog()
        self.strStream = SimToolLogging.getStrStream()

    # Replace environment with a new one in all objects.

    def new_env(self, start=0):
        self.env = simpy.Environment(start)
        self.end_time = None
        self.start_time = None
        for _, node in self.nodes.items():
            node.update({'env': self.env})
            node.reset()

    # Get Summary info about the last run. Finds most common path traversed, in general, and by end node.
    def summary(self):
        """ if self.end_time == None:
                raise ValueError("Please run the simulation at least once.") """

        start_nodes = {k: v.summary() for k, v in self.starts.items()}
        station_nodes = {k: v.summary() for k, v in self.stations.items()}
        end_nodes = {k: v.summary() for k, v in self.ends.items()}
        # Need to make a check for when the list is empty
        run_times = {k: [e.end_time-e.start_time for e in v.entities if e.end_time != None]
                     for k, v in self.starts.items()}
        #avgbystart = {k:np.mean([e.end_time-e.start_time for e in v.entities if e.end_time != None]) for k,v in self.starts.items()}
        avgbystart = {k: (np.mean(v) if len(v) > 0 else None)
                      for k, v in run_times.items()}

        most_common_path_to_end = collections.Counter(tuple(e.summary(
        )['travelled path']) for name, start in self.starts.items() for e in start.entities).most_common(1)

        if len(most_common_path_to_end) == 0:
            most_common_path_to_end = None
        else:
            most_common_path_to_end = most_common_path_to_end[0]
        to_ret = {
            "run_info": {
                "sim_start_time": self.start_time,
                "sim_end_time": self.end_time,
                "num_spawned_entities": sum([1 for name, start in self.starts.items() for e in start.entities]),
                "num_completed_entities": sum([1 for name, end in self.ends.items() for e in end.entities]),
                "avg_entity_duration_by_start": avgbystart,
                "most_common_path_to_end": most_common_path_to_end
            },
            "Starting Nodes": start_nodes,
            "Station Nodes": station_nodes,
            "End Nodes": end_nodes
        }
        return to_ret

    # The serialize method returns a JSON object with info about nodes, containers, blueprints, and logic
    # In order to allow for saving a process to a file.
    def serialize(self):
        return {
            "starts": {x.uid: x.serialize() for _, x in self.starts.items()},
            "stations": {x.uid: x.serialize() for _, x in self.stations.items()},
            "ends": {x.uid: x.serialize() for _, x in self.ends.items()},
            "blueprints": {uid: blueprint.serialize() for uid, blueprint in self.blueprints.items()}
        }

    def deserialize(self, save):
        # First, clean the system.
        self.clean()
        starts = save["starts"]
        stations = save["stations"]
        ends = save["ends"]
        nodes = dict(starts)
        nodes.update(stations)
        nodes.update(ends)
        blueprints = save["blueprints"]

        # Create the base nodes.
        for uid, node in starts.items():
            inputs = {
                "name": node["name"],
                "entity_name": node["entity_name"],
                "limit": node["limit"],
                "generation": node["generation"],
                "uid": node["uid"]
            }
            self.create_node(DataStore.START, inputs)

        for uid, node in stations.items():
            inputs = {
                "name": node["name"],
                "capacity": node["capacity"],
                "interaction_time": node["interaction_time"],
                "uid": node["uid"]
            }
            self.create_node(DataStore.STATION, inputs)

        for uid, node in ends.items():
            inputs = {
                "name": node["name"],
                "uid": node["uid"]
            }
            self.create_node(DataStore.END, inputs)

        # Now, direct nodes to proper places.

        for uid, node in nodes.items():
            if "dirto" in node:
                for to in node["dirto"]:
                    self.set_directed_to(uid, to)

        # Create blueprints:

        for uid, bp in blueprints.items():
            inputs = {
                "capacity": bp["capacity"],
                "init": bp["init"],
                "name": bp["name"],
                "resource": bp["resource"],
                "uid": bp["uid"]
            }
            self.create_blueprint(inputs)

        # Create containers based on blueprints.

        for uid, node in starts.items():
            for bp in node["blueprints"]:
                self.add_blueprint(uid, bp)

        for uid, node in stations.items():
            for bp in node["blueprints"]:
                self.create_container_bp(uid, bp)

        # Create containers

        for uid, node in stations.items():
            for con in node["containers"]:
                self.create_container(uid, con)

        # Now load logic.

        for uid, node in starts.items():
            self.create_logic(uid, node["logic"]["split_policy"])

        for uid, node in stations.items():
            self.create_logic(uid, node["logic"]["split_policy"])

        for uid, node in stations.items():
            if len(node["logic"]["cond_groups"]) > 0:
                for name, group in node["logic"]["cond_groups"].items():
                    pp = group["pass_paths"]
                    fp = group["fail_paths"]
                    AND = group["AND"]
                    action_order_random = group["action_order_random"]
                    self.create_condition_group(uid, name, pp, fp, AND, action_order_random)

                    for cond_name, condition in group["conditions"].items():
                        self.add_condition(uid, name, condition)

                    if not group["actions"] == {}:
                        for act_name, action in group["actions"].items():
                            self.add_action(uid, name, action)

    # The run method is what starts the simulation. It takes an optional until parameter that tells when
    # to stop the simulation. If all events finish before the given time, the simulation will end
    # immediately.

    def run(self, until=math.inf):
        if len(self.starts) == 0:
            raise ValueError("Please create at least one starting node.")
        elif len(self.ends) == 0:
            raise ValueError("Please create at least one ending node.")
        else:
            #[self.env.process(self.nodes[x]) for x in self.starts]
            self.data_logger.info(f"Running simulation until {until}")
            self.start_time = self.env.now
            self.env.run(until)
            self.end_time = self.env.now
            if (self.env.peek() != math.inf):
                self.data_logger.info(
                    f"Simulation stopped at {self.end_time}. Further events have not been processed.")
            else:
                self.data_logger.info(
                    f"Simulation stopped at {self.end_time}. All scheduled events been processed.")
            self.last_run = self.strStream.getvalue().split('\n')
            self.runs.append(self.last_run)
            return (self.last_run, self.summary())

    # Step through n events and return summaries after each step.
    def _step(self, summary, amount=1):
        output = []
        for _ in range(amount):
            do = True
            while do:
                if self.env.peek() == math.inf:
                    return ""
                else:
                    loc = self.strStream.tell()
                    self.env.step()
                    self.strStream.seek(loc)
                    curr = self.strStream.read().split('\n')[:-1]
                    if not all('' == s for s in curr):
                        do = False
            output.append(curr[0])
        if summary: output.append(self.summary())
        return output

    #Step through events without summary
    def step(self, amount=1):
        return self._step(False, amount)

    #Step through events with summary.
    def stepSum(self, amount=1):
        return self._step(True, amount)

    def reset(self, start=0):
        self.new_env(start)
        return f"Simulation reset. Time is now {self.env.now}"

    def clean(self):
        self.__init__()
        return f"Process has been deleted. Time is now {self.env.now}"
