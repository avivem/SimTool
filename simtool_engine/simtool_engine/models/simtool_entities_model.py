""" simtool_entities_model.py contains the BasicFlowEntity class represents the
entities that flow through the system. 

Written by Aviv Elazar-Mittelman, July 2020
"""

import simpy
import pprint
import sys
import logging
import contextlib
from simtool_engine.util.simtool_logging import SimToolLogging
from simtool_engine.util.simtool_events import SimtoolEvent

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
            pprint.pprint(action_groups)
            for ag in action_groups:
                for action in ag:
                    try:
                        encon = self.containers[action.con1_name]
                        print(str(self.name) + ":" + str(self.currentLoc))
                        print(str(self.name) + ":" + str(self.currentLoc.containers))
                        print(str(self.name) + ":" + str(action))
                        nodecon = self.currentLoc.containers[action.con2_name]
                    except KeyError as e:
                        raise KeyError("Invalid container name: " + str(e))

                    #TODO: create wrapper functions for simpy to log at correct time.
                    SimtoolEvent.EntityContainerAction(self.env,self,action.op,self.currentLoc,action.val,encon,nodecon)
                    if action.op == "TAKE":
                        acts = encon.giveTo(nodecon, action.val)
                        #print(acts)
                        for act in acts:
                            yield act
                        
                    elif action.op == "GIVE":
                        acts = encon.takeFrom(nodecon, action.val)
                        #print(acts)
                        for act in acts:
                            yield act
                        
                    elif action.op == "ADD":
                        acts = encon.add(action.val)
                        #print(acts)
                        for act in acts:
                            yield act
                        
                    elif action.op == "SUB":
                        acts = encon.remove(action.val)
                        #print(acts)
                        for act in acts:
                            yield act
                        
                

    def resources_snapshot(self):
        return {k:v.summary() for (k,v) in self.containers.items()}


    def run(self):
        self.travel_path.append(str(self.start))
        #If more ending point types added, may need to modify check.
        while not self.currentLoc.__class__.__name__ == "EndingPoint":
            
            #Wait in line until the component is available.
            with self.currentLoc.resource.request() as req:
                #Acquire locks for each resource of the container.
                with contextlib.ExitStack() as stack:
                    locks = self.currentLoc.get_con_locks()
                    lock_requests = [stack.enter_context(lock.request()) for lock in locks]
                    
                    #Comment this line to disable locking.
                    yield from lock_requests
                    
                    self.count += 1
                    self.travel_path.append(str(self.currentLoc))
                    #Tell environment I'm waiting.
                    yield req
                    (tymeout, (next_dir, action_groups)) = self.currentLoc.interact(self)
                    yield self.env.process(self.act(action_groups))
                    yield tymeout
                    self.currentLoc.entities.add(self)
                    SimtoolEvent.EntityNextPathDecided(self.env,self,next_dir)
                    self.currentLoc = next_dir

        self.currentLoc.entities.add(self)
        self.travel_path.append(str(self.currentLoc))
        self.end_time = self.env.now
        #evnt_logger.info(f'\t {self} has reached endpoint {self.currentLoc}.',extra={'sim_time':self.env.now})
        SimtoolEvent.EntityEnded(self.env,self,self.currentLoc)

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
 