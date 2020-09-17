""" simtool_entities.py contains the BasicFlowEntity class represents the
entities that flow through the system. 

Written by Aviv Elazar-Mittelman, July 2020
"""

import simpy
import logging
from simtool_engine.models.simtool_logging import SimToolLogging
from simtool_engine.models.simtool_events import SimtoolEvent

evnt_logger = SimToolLogging.getEventLog()

class BasicFlowEntity(object):
    """ BasicFlowEntity represents a thing (e.g. a person, a material) going
    through a process (e.g. going to the bank, food production line, etc...).
    Entities behave like people in a library: They enter the graph, talk to each
    node they visit, and follow the instructions given in response.
    """

    #The currently supported operations.
    op_map = {
        "GIVE" : "Given",
        "TAKE" : "Taken",
        "ADD" : "Added",
        "SUB" : "Subtracted",
        "MULT" : "Multiplied"
    }
    
    def __init__(self, env:simpy.Environment,start_time,name:str, start,currentLoc, resource_behaviors:dict={}):
        self.env = env
        self.start = start
        self.name = name
        self.currentLoc = currentLoc
        self.containers = {}
        self.resource_behaviors = resource_behaviors #not currently used.
        self.travel_path = []
        self.start_time = start_time
        self.end_time = None
        self.count = 0
        
    def __str__(self):
        return f'{self.name}'
    
    def __repr__(self):
        return f'{self.name}: {self.containers}'

    #Add a container to the entity, currently used during entity creation.
    #Could possibly be used to give entities containers at nodes.
    def add_container(self, container):
        self.containers[container.name] = container

    def act(self, action_groups):
        if self.currentLoc.logic.noconds():
            return None
        else:
            for ag in action_groups:
                for name, ac in ag.actions.items():
                    try:
                        encon = self.containers[ac.encon_name]
                        nodecon = self.currentLoc.containers[ac.nodecon_name]
                    except KeyError as e:
                        print("")
                        print("KEY ERROR BLARG")
                        print(e)
                        print("")
                        continue

                    SimtoolEvent.EventEntityContainerAction(self.env,self,ac.op,self.currentLoc,ac.val,encon,nodecon)
                    if ac.op == "GIVE":
                        yield encon.con.put(ac.val)
                        yield nodecon.con.get(ac.val)
                    elif ac.op == "TAKE":
                        yield encon.con.get(ac.val)
                        yield nodecon.con.put(ac.val)
                    elif ac.op == "ADD":
                        yield encon.con.put(ac.val)
                    elif ac.op == "SUB":
                        yield encon.con.get(ac.val)
                

    def resources_snapshot(self):
        return {k:v.summary() for (k,v) in self.containers.items()}


    def run(self):
        self.travel_path.append(str(self.start))
        #If more ending point types added, may need to modify check.
        while not self.currentLoc.__class__.__name__ == "EndingPoint":
            
            #Wait in line until the component is available.
            with self.currentLoc.resource.request() as req:
                self.count += 1
                self.travel_path.append(str(self.currentLoc))
                #Tell environment I'm waiting.
                yield req
                (evnt, (next_dir, passed)) = self.currentLoc.interact(self)
                self.env.process(self.act(passed))
                yield evnt
                self.currentLoc.entities.add(self)
                self.currentLoc = next_dir

        self.currentLoc.entities.add(self)
        self.travel_path.append(str(self.currentLoc))
        self.end_time = self.env.now
        #evnt_logger.info(f'\t {self} has reached endpoint {self.currentLoc}.',extra={'sim_time':self.env.now})
        SimtoolEvent.EventEntityEnded(self.env,self,self.currentLoc)

    def summary(self):
        containers = {}
        for name,con in self.containers.items():
            containers[con.name] = con.summary()
        return {
            "name" : self.name,
            "number of nodes visited" : self.count,
            "containers" : containers,
            "travelled path" : self.travel_path
        }
 