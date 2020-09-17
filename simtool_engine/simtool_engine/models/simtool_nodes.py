""" simtool_nodes.py contains classes that represent points in a process graph.
The Node class is "abstract" and should be used to create usable child classes.

StartingPoint represents points in the graph where entities with specific
charictaristics are generated and entered into the system.

BasicComponent represents "stations" in a system, such as a bank teller, atm,
robotic arm in a production line, a security checkpoint, etc...

EndingPoint is a collection point where entities terminate.

Entities progress through the system by visiting nodes and interacting with them
through the interact method.

Written by Aviv Elazar-Mittelman, July 2020.
"""

import uuid
import simpy
import collections
import logging
from simtool_engine.models.simtool_entities import BasicFlowEntity
from simtool_engine.models.simtool_logic import Logic
from simtool_engine.models.simtool_containers import BasicContainer, BasicContainerBlueprint
from simtool_engine.models.simtool_logging import SimToolLogging
from simtool_engine.models.simtool_events import SimtoolEvent
import random
import scipy.stats as stats
import numpy as np

# Get reference to the loggers so that nodes can output correct logs.
evnt_logger = SimToolLogging.getEventLog()
evnt_logger_machine = SimToolLogging.getEventLogMachine()
data_logger = SimToolLogging.getDataLog()
data_logger_machine = SimToolLogging.getDataLogMachine()



class Node(object):
    """ The Node class is an abtract representation of the basic functionality of
    all nodes in SimTool. Each node has a name, a unique identifier, and a list
    of nodes they are directed to. 
    
    All nodes in a graph should point to the same
    SimPy Environment. Resetting the simulation requires replacing environment
    references in all nodes. This can be done with the update function.

    All nodes have a serialize method, which outputs a JSON object that can be
    read back later in the deserialize method of DataStore to recreate a node.
    """
    def __init__(self, env, name, uid = None):
        if uid is None:
            self.uid = uuid.uuid4().hex
        else:
            self.uid = uid
        self.env = env
        self.name = name
        self.logic= Logic("RAND")
        self.entities = set()
        self.action = env.process(self.run())

        # Achieve an ordered set using a dict and .keys, may not be needed
        # Could possibly switch to just using set() and sorting when needed.
        self.directed_to = {}

    def get_directed_to(self):
        return self.directed_to.keys()

    def set_directed_to(self,obj):
        if self.directed_to == None:
            self.directed_to = {}

        if isinstance(obj, list):
            for x in obj:
                self.directed_to[x] = True

        else:
            self.directed_to[obj] = True

        return None
        
    
    def remove_directed_to(self,obj):
        if self.directed_to == None:
           pass

        if isinstance(obj, list):
            for x in obj:
                del self.directed_to[x]

        else:
            del self.directed_to[obj]

        return None

    def update(self, args):
        for k,v in args.items():
            setattr(self, k, v)
        if 'env' in args:
            self.env.process(self.run())

    # Each Node should implement this.
    def serialize(self):
        raise ValueError(f"{self} has not implemented serialize.")
 
    # each node type should define their own reset steps.
    def reset(self):
        raise ValueError(f"{self} has not implemented reset.")
 
    # Replaces the default Logic object with a new one with the desired
    # split policy. Supported split policies include:
    # 
    # RAND: randomly choose the next node from the directed_to dict.
    # 
    # ALPHA_SEQ: loop through the nodes in directed_to in alphabetical order 
    # (by name).
    # 
    # BOOL: allows for utilization of conditions and actions (Look at 
    # simtool_logic.py)
    def create_logic(self, split_policy):
        self.logic = Logic(split_policy)

    def summary(self):
        pass

    def run(self):
        yield self.env.timeout(0)


class StartingPoint(Node):
    """ StartingPoint represents points in the graph where entities enter the
    system. A StartingPoint object will generate entities of the same type based
    on inputted settings. To have different "classes" of entities (e.g. rich and
    poor), use multiple StartingPoints. 
    
    To control how often entities should be generated, settings should be passed
    in as a dict. with the following options:

    To generate an entity every x time units, generation should be of the form:
        {
            "init" : x 
        }
    
    To generate an entity based on a probability distribution:
        {
            "dist" : <NORMAL or UNIFORM currently supported>,
            "loc" : x,
            "scale: y
        }

        - loc is the location of the distribution.

    To generate an entity based on a random integer:
        {
            "dist" : RANDINT,
            "low" : <smallest possible value>
            "high : <highest possible value>
        }
        
    These are based on the rvs function of probability distributions in
    scipy.stats
    """
    def __init__(self,env,name, entity_name,generation, limit=float('inf'),uid=None):
        super().__init__(env=env, name=name, uid=uid)
        self.entity_name = entity_name
        self.generation = generation
        self.directed_to = None
        # Convert limit to 0-based.
        self.limit = limit
        self.count = 0
        self.blueprints = {}
        

    def update(self, args):
        for k,v in args.items():
            setattr(self, k, v)
        #If new env passed in, reprocess.
        
    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    def reset(self):
        self.count = 0

    #In order to build a container for each resource for each entity,
    #Need to know design of the container.
    def add_blueprint(self, blueprint):
        name = blueprint.name
        self.blueprints[name] = blueprint
        return f"Blueprint {blueprint.name}:{blueprint.uid} has been added to {self}"

    #Determines the next node the entity should go to. StartingNodes only support,
    #RAND, and ALPHA_SEQ at the moment, but this can be expanded in the same way
    #as for stations.
    def next_dir(self):
        path_list = sorted(self.directed_to.keys(), key=lambda x: x.name)
        if len(self.directed_to) > 1:
            if self.logic.split_policy == "RAND":
                next_ind = random.randint(0,len(self.directed_to)-1)
            elif self.logic.split_policy == "ALPHA_SEQ":
                next_ind = self.count % len(path_list)
                #No need for increasing count in starting since already do so.
                #self.count += 1
                
        else:
            next_ind = 0
        return path_list[next_ind]

    #Return a JSON object that can be used to rebuild this node.
    def serialize(self):
        return {
            "name" : self.name,
            "uid" : self.uid,
            "entity_name" : self.entity_name,
            "generation" : self.generation,
            "limit" : self.limit,
            "dirto" : list({x.uid for x,_ in self.directed_to.items()}),
            "blueprints" : list([x.uid for name,x in self.blueprints.items()]),
            "logic" : self.logic.serialize()
        }

    #The run function is a generator function that signals to the SimPy
    #environment that new entities have been created and processes them.
    #run handles entity creation and sets them up to continue running
    #independently.
    def run(self):
        #evnt_logger.info(f'\t {self} starting entity generation',extra={'sim_time':self.env.now})

        yield SimtoolEvent.EventStartEntityGeneration(self.env,self)
        #Optimize later using class references.
        while self.count < self.limit:

            #TODO: Add more distributions.
            if not 'dist' in self.generation:
                tymeout = self.generation['init']
            elif self.generation['dist'] == 'UNIFORM':
                tymeout = stats.uniform.rvs(loc=self.generation['loc'],scale=self.generation['scale'])
            elif self.generation['dist'] == 'NORMAL':
                tymeout = stats.norm.rvs(loc=self.generation['loc'],scale=self.generation['scale'])
            elif self.generation['dist'] == 'RANDINT':
                tymeout = stats.randint.rvs(low=self.generation['low'], high=self.generation['high'])

            yield self.env.timeout(tymeout)

            ndir = self.next_dir()
            entity = BasicFlowEntity(self.env,self.env.now,f'{self.entity_name} {self.count}',self,ndir)
            self.entities.add(entity)
            if len(self.blueprints) > 0:

                for name, blueprint in self.blueprints.items():
                    con = blueprint.build(self.env, entity)
                    entity.add_container(con)

            self.env.process(entity.run())
            yield SimtoolEvent.EventEntityCreated(self.env,self,entity)
            self.count += 1
        yield SimtoolEvent.EventEndEntityGeneration(self.env, self)

    def summary(self):
        return {
            "name" : self.name,
            "number of entities created" : self.count
        }
            
            
#A Node that represents a "cog in a machine" such as bank tellers in a bank, or
#a dishwasher in a kitchen.

#TODO: add probability based time_func
class BasicComponent(Node):
    """ BasicComponent represents "stations" in our simulation. Entities are
    able to visit stations and request to interact with them. stattions can
    interact with a specific number of entities at a time. Decisions about
    interactions are stored in the Logic reference.
    """
    def __init__(self,env, name, capacity, time_func, uid=None):
        super().__init__(env = env, name = name, uid = uid)
        self.name = name
        self.capacity = capacity
        self.resource = simpy.Resource(env,capacity)
        self.time_func = time_func
        self.containers = {}
        self.count = 0
        self.entity_resources_before = {}
        self.entity_resources_after = {}

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"{self.name}"

    def add_container_bp(self, blueprint):
        self.containers[blueprint.name] = blueprint.build(self.env, self)
        return self.containers[blueprint.name]

    def add_container(self, inputs):
        self.containers[inputs["name"]] = BasicContainer(self.env, **inputs)
        return self.containers[inputs["name"]]
    def get_con(self, name):
        return self.containers[name]

    def next_dir(self, entity):
        path_list = sorted(self.directed_to.keys(), key=lambda x: x.name)
        
        if self.logic.split_policy == "RAND":
            next_ind = random.randint(0,len(self.directed_to)-1)
            self.count += 1
        elif self.logic.split_policy == "ALPHA_SEQ":
            next_ind = self.count % len(path_list)
            self.count += 1
        elif self.logic.split_policy == "BOOL":
            """ passlist = [x for x in self.directed_to if x in self.logic['pass']]
            faillist = [x for x in self.directed_to if x in self.logic['fail']] """

            #pprint.pevnt_logger.info(f"self: {self}, entity: {entity} faillist: {faillist}, passlist: {passlist}, directed_to: {self.directed_to}",sys.stderr,extra={'sim_time':self.env.now})
            #Check if the container exists in entity, if not fail immediately:
            #if not res in entity.containers or not conname in entity.containers[res]:
            #    next_ind = random.randint(0,len(faillist)-1)
            #    return faillist[next_ind]

            
            (action_groups, paths) = self.logic.eval(entity, self)
            passed = len(action_groups) > 0
            #pprint.pprint(self.directed_to, sys.stderr)
            #pprint.pprint(paths, sys.stderr)
            pathlist = [x for x in self.directed_to if x in paths]
            #pprint.pprint(pathlist, sys.stderr)
            next_ind = random.randint(0, len(pathlist)-1)
            #evnt_logger.info(f'\t {entity} Going to {pathlist[next_ind]}', extra = {"sim_time":self.env.now})
            SimtoolEvent.EventEntityNextPathDecided(self.env,entity,pathlist[next_ind])
            return (pathlist[next_ind], action_groups)          
        
        try:
            return (path_list[next_ind], True)
        except:
            raise ValueError(f'self is {self}, path_list is {path_list}, index is {next_ind}')
    
    #Returns a timeout event which represents the amount of time a component
    #needs to do it's thing.
    def interact(self, entity):
        SimtoolEvent.EventEntityNodeInteraction(self.env,entity,self)
        return (self.env.timeout(self.time_func),self.next_dir(entity))

    def reset(self):
        self.count = 0

    def summary(self):
        containers = {}
        for name, con in self.containers.items():
            containers[con.name] = con.summary()
        return {
            "name" : self.name,
            "capacity" : self.capacity,
            "number of entity interactions" : self.count,
            "container summaries" : containers
            
        }

    def update(self, args):
        for k,v in args.items():
            setattr(self, k, v)
        #If environment is changed, update containers.
        if "env" in args:
            for _,con in self.containers.items():
                con.update({"env":self.env})

    def serialize(self):
        return {
            "name" : self.name,
            "uid" : self.uid,
            "capacity" : self.capacity,
            "time_func" : self.time_func,
            "dirto" : list({x.uid for x,_ in self.directed_to.items()}),
            "blueprints" : list([x.uid for _,x in self.containers.items() if x.blueprint != None]),
            "containers" : list([x.serialize() for _,x in self.containers.items() if x.blueprint == None]),
            "logic" : self.logic.serialize()
        }


#Collection point for entities that have travelled through the system.
class EndingPoint(Node):
    """ EndingPoint represents a single collection point where entities finish 
    their trip through the system.
    """
    def __init__(self,env,name, uid=None):
        super().__init__(env=env,name=name, uid=uid)
    def __str__(self):
        return f"{self.name}"
    def __repr__(self):
        return f"{self.name}"
    
    def summary(self):
        encountered = {}
        for entity in self.entities:
            if not entity.start.name in encountered:
                encountered[entity.start.name] = 0
            encountered[entity.start.name] += 1

        return {
            "name" : self.name,
            "number of caught entities" : len(self.entities),
            "number of entities by start node" : encountered,
            "most common travel path" : collections.Counter(tuple(x.summary()['travelled path']) for x in self.entities).most_common(1)[0] if len(self.entities) > 0 else None,
            "average entity duration." : np.mean([x.end_time-x.start_time for x in self.entities])
        }

    def serialize(self):
        return {
            "name" : self.name,
            "uid" : self.uid
        }