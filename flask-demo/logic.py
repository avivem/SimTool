import simpy
import sys
import io
import uuid
import json

""" if __name__ is not "__main__":
    old_stdout = sys.stdout
    new_stdout = io.StringIO()
    sys.stdout = new_stdout """

#Basic building block of a system. It knows where an entity should go next.
class Node(object):
    def __init__(self, env, name, uid = None):
        if uid is None:
            self.uid = uuid.uuid4().hex
        else:
            self.uid = uid
        self.env = env
        self.name = name
    def set_directed_to(self,obj):
        self.directed_to = obj
    def remove_directed_to(self,obj):
        self.directed_to = None

"""
Class that represents the basic object that flows through the system. This
could represent a person walking through a bank, an animal going through a
food production facility, a primary ingredient flowing through a production
line, etc. 

"""
class BasicFlowEntity(object):
    def __init__(self, env:simpy.Environment,name:str, currentLoc:Node, resources:dict={}):
        self.env = env
        self.name = name
        self.currentLoc = currentLoc
        self.resources = resources
        
    def __str__(self):
        return f'{self.name}'


    #Down the road, add interact methods to components to allow for resource consumption.
    def run(self):
        while not isinstance(self.currentLoc,EndingPoint):
            #For simple demo, components only take time to work.
            with self.currentLoc.resource.request() as req:
                yield req
                yield self.currentLoc.get_timer(self)
                self.currentLoc = self.currentLoc.directed_to

        self.currentLoc.entities.append(self)
        print(f'[{self.env.now}]:: {self} has reached endpoint {self.currentLoc}')

#Node that generates flowing entities.
class StartingPoint(Node):
    def __init__(self,env,name,entity_name,gen_fun, limit,uid=None):
        super().__init__(env,name,uid)
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
            entity = BasicFlowEntity(self.env,f'{self.entity_name} {self.count}',self.directed_to)
            self.env.process(entity.run())
            print(f'[{self.env.now}]:: {entity} has left {self}')
            self.count += 1
            
            
#A Node that represents a "cog in a machine" such as bank tellers in a bank, or
#a dishwasher in a kitchen.
class BasicComponent(Node):
    def __init__(self,env, name,capacity, time_func, uid=None):
        super().__init__(env,name,uid)
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
    def get_timer(self, entity):
        print(f'[{self.env.now}]:: {entity} is now interacting with {self}')
        return self.env.timeout(self.time_func)

class BasicContainer(Node):
    def __init__(self, env,name,init,capacity,uid=None):
        super().__init__(env,name,uid)
        self.init = init
        self.capacity = capacity
        self.c = simpy.Container(env, capacity, init)

#Collection point for entities that have travelled through the system.
class EndingPoint(Node):
    def __init__(self,env,name,uid=None):
        super().__init__(env,name,uid)
        self.entities = []
    def __str__(self):
        return self.name

""" env = simpy.Environment()
st = StartingPoint(env, "Starting Point 1",2)
b1 = BasicComponent(env,"Basic Component #1", 3, 7) 
ed = EndingPoint(env,"Ending Point 1")
st.set_directed_to(b1)
b1.set_directed_to(ed)
env.process(st.run())
env.run(until=300) """

""" env = simpy.Environment()
st = StartingPoint(env, "Hotel", 10, 200)
line = BasicComponent(env, "Convention Line", 50, 1000)
security = BasicComponent(env, "Security", 10, 100)
end = EndingPoint(env, "Convention")
st.set_directed_to(line)
line.set_directed_to(security)
security.set_directed_to(end)
env.process(st.run())
env.run(until=20000) """

