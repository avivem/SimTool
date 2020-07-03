import simpy



#Basic building block of a system. It knows where an entity should go next.
class Node(object):
    def __init__(self, env):
        self.env = env
    def set_directed_to(self,obj):
        self.directed_to = obj

"""
Class that represents the basic object that flows through the system. This
could represent a person walking through a bank, an animal going through a
food production facility, a primary ingredient flowing through a production
line, etc. 

"""
class BasicFlowEntity(object):
    def __init__(self, id:str, env:simpy.Environment, nextLoc:Node, currentLoc:Node):
        self.env = env
        self.id = id
        self.nextLoc = nextLoc
        self.currentLoc = currentLoc
        
    def __str__(self):
        return f'{self.id}'

    def run(self):
        while not isinstance(self.currentLoc,EndingPoint):
            #For simple demo, components only take time to work.
            with self.currentLoc.resource.request() as req:
                yield req
                yield self.currentLoc.get_timer()
        self.currentLoc.entities.append(self)

#Node that generates flowing entities.
class StartingPoint(Node):
    def __init__(self,env,gen_func):
        super().__init__(env)
        self.gen_func = gen_func
        self.directed_to = None
        self.entities = []
        self.count = 0
    
    def run(self):
        while True:
            yield self.env.timeout(self.gen_func)
            currEntity = BasicFlowEntity(self.env,f'Flow Entity {self.count}',self.directed_to.directed_to, self.directed_to)
            self.count += 1
            self.env.process(currEntity)
            
            
#A Node that represents a "cog in a machine" such as a bank teller in a bank, or
#a dishwasher in a kitchen.
class BasicComponent(Node):
    def __init__(self,env, name, capacity, time):
        super().__init__(env)
        self.name = name
        self.capacity = capacity
        self.resource = simpy.Resource(env,capacity)
        self.time = time

    def __str__(self):
        return f'{self.name}'
        
    #Returns a timeout event which represents the amount of time a component
    #needs to do it's thing.
    def get_timer(self, entity):
        print(f'[{self.env.now}]:: {entity} is now interacting with {self}')
        return self.env.timeout(self.time)

#Collection point for entities that have travelled through the system.
class EndingPoint(Node):
    def __init__(self,env):
        super().__init__(env)
        self.entities = []

env = simpy.Environment()
st = StartingPoint(env, 2)
b1 = BasicComponent(env,"Basic Component #1", 3, 7)
ed = EndingPoint(env)
st.set_directed_to(b1)
b1.set_directed_to(ed)
env.process(st)
env.run(until=100)