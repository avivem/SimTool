import simpy
import sys
import io
import uuid
import json
import random
import math

""" if __name__ is not "__main__":
    old_stdout = sys.stdout
    new_stdout = io.StringIO()
    sys.stdout = new_stdout """

#Basic building block of a system. It knows where an entity should go next.
class Node(object):
    def __init__(self, env, name, split_policy = "RAND",uid = None):
        if uid is None:
            self.uid = uuid.uuid4().hex
        else:
            self.uid = uid
        self.env = env
        self.name = name
        self.split_policy = split_policy
        #Achieve an ordered set using a dict and .keys
        self.directed_to = {}

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

"""
Class that represents the basic object that flows through the system. This
could represent a person walking through a bank, an animal going through a
food production facility, a primary ingredient flowing through a production
line, etc. 

"""
class BasicFlowEntity(object):
    def __init__(self, env:simpy.Environment,name:str, currentLoc:Node, resource_behaviors:dict={}, resources:dict={}):
        self.env = env
        self.name = name
        self.currentLoc = currentLoc
        self.resources = resources
        self.resource_behaviors = resource_behaviors
        
    def __str__(self):
        return f'{self.name}'


    #Down the road, add interact methods to components to allow for resource consumption.
    def run(self):
        while not isinstance(self.currentLoc,EndingPoint):
            
            #Wait in line until the component is available.
            with self.currentLoc.resource.request() as req:
                #Tell environment I'm waiting.
                yield req
                (evnt, next_dir) = self.currentLoc.interact(self)
                yield evnt
                self.currentLoc = next_dir

        self.currentLoc.entities.append(self)
        print(f'[{self.env.now}]:: {self} has reached endpoint {self.currentLoc}')

#Node that generates flowing entities.
class StartingPoint(Node):
    def __init__(self,env,name, entity_name,gen_fun, limit=math.inf, split_policy = "RAND",uid=None):
        super().__init__(env,name, split_policy, uid)
        self.entity_name = entity_name
        self.gen_fun = gen_fun
        self.directed_to = None
        self.limit = limit
        self.entities = []
        self.count = 0
        self.action = env.process(self.run())
    def __str__(self):
        return self.name

    
    def run(self):
        while self.count < self.limit:
            yield self.env.timeout(self.gen_fun)
            next_ind = random.randint(0,len(self.directed_to)-1)
            next_dir = list(self.directed_to.keys())[next_ind]
            entity = BasicFlowEntity(self.env,f'{self.entity_name} {self.count}',next_dir)
            self.env.process(entity.run())
            print(f'[{self.env.now}]:: {entity} has left {self}')
            self.count += 1
            
            
#A Node that represents a "cog in a machine" such as bank tellers in a bank, or
#a dishwasher in a kitchen.
class BasicComponent(Node):
    def __init__(self,env, name, capacity, time_func, split_policy = "RAND", uid=None):
        super().__init__(env,name, split_policy, uid)
        self.name = name
        self.capacity = capacity
        self.resource = simpy.Resource(env,capacity)
        self.time_func = time_func
        self.containers = []

    def __str__(self):
        return self.name

    def add_container(self, container):
        self.containers.append(container)
        
    #Returns a timeout event which represents the amount of time a component
    #needs to do it's thing.
    def interact(self, entity):
        print(f'[{self.env.now}]:: {entity} is now interacting with {self}')
        next_ind = random.randint(0,len(self.directed_to)-1)
        next_dir = list(self.directed_to.keys())[next_ind]
        return (self.env.timeout(self.time_func),next_dir)

#Collection point for entities that have travelled through the system.
class EndingPoint(Node):
    def __init__(self,env,name, split_policy = "RAND", uid=None):
        super().__init__(env,name, split_policy, uid)
        self.entities = []
    def __str__(self):
        return self.name

#Possible Splitter node that handles path choosing logic.
#For now, paths chosen randomly.
#class Splitter(Node):
    
""" env = simpy.Environment()
st = StartingPoint(env, "Starting Point 1",2)
b1 = BasicComponent(env,"Basic Component #1", 3, 7) 
ed = EndingPoint(env,"Ending Point 1")
st.set_directed_to(b1)
b1.set_directed_to(ed)
env.process(st.run())
env.run(until=300) """

env = simpy.Environment()
st = StartingPoint(env, "Hotel", "Attendee", 10, 200)
line1 = BasicComponent(env, "Convention Line 1", 50, 1000)
security1 = BasicComponent(env, "Security 1", 10, 100)
line2 = BasicComponent(env, "Convention Line 2", 50, 1000)
security2 = BasicComponent(env, "Security 2", 10, 100)
end = EndingPoint(env, "Convention")
st.set_directed_to(line1)
st.set_directed_to(line2)
line1.set_directed_to(security1)
security1.set_directed_to(end)
line2.set_directed_to(security2)
security2.set_directed_to(end)
env.process(st.run())
env.run(until=20000)


