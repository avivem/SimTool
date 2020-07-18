import simpy
import sys
import io
import uuid
import json
import random
import math
import pprint
import scipy.stats as stats

""" if __name__ is not "__main__":
    old_stdout = sys.stdout
    new_stdout = io.StringIO()
    sys.stdout = new_stdout """

split = {
    'policy' : "RAND",
    'cond' : None,
    'cond_amount' : None,   
    'act' : None,
    'act_amount' : None,
    'entity_container_name' : None,
    'resource' : None,
    'pass' : [],
    'fail' : []
}

#Basic building block of a system. It knows where an entity should go next.
class Node(object):
    def __init__(self, env, name, uid = None):
        if uid is None:
            self.uid = uuid.uuid4().hex
        else:
            self.uid = uid
        self.env = env
        self.name = name
        self.split= split
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

    def update(self, args):
        for k,v in args.items():
            setattr(self, k, v)

    #each node type should define their own reset steps.
    def reset(self):
        pass

    def p(self):
        pp = pprint.PrettyPrinter(indent=4)
        pp.pprint(self.__dict__)

    def set_split_policy(self,split):
        self.split = split


"""
Class that represents the basic object that flows through the system. This
could represent a person walking through a bank, an animal going through a
food production facility, a primary ingredient flowing through a production
line, etc. 

"""
class BasicFlowEntity(object):
    def __init__(self, env:simpy.Environment,name:str, start,currentLoc:Node, resource_behaviors:dict={}):
        self.env = env
        self.start = start
        self.name = name
        self.currentLoc = currentLoc
        self.containers = {}
        self.resource_behaviors = resource_behaviors
        
    def __str__(self):
        return f'{self.name}'

    def add_container(self, container):
        if not container.resource in self.containers:
            self.containers[container.resource] = {}
        self.containers[container.resource][container.name] = container

    def act(self):
        if self.currentLoc.split['act'] == None:
            return None
        if self.currentLoc.split['act'] == 'SUB':
            encon = self.containers[self.currentLoc.split['resource']][self.currentLoc.split['entity_container_name']].con
            yield encon.get(self.currentLoc.split['act_amount'])
            yield self.currentLoc.container.con.put(self.currentLoc.split['act_amount'])
        elif self.currentLoc.split['act'] == 'ADD':
            encon = self.containers[self.currentLoc.split['resource']][self.currentLoc.split['entity_container_name']].con
            yield encon.put(self.currentLoc.split['act_amount'])
            yield self.currentLoc.container.con.get(self.currentLoc.split['act_amount'])

    #Down the road, add interact methods to components to allow for resource consumption.
    def run(self):
        while not isinstance(self.currentLoc,EndingPoint):
            
            #Wait in line until the component is available.
            with self.currentLoc.resource.request() as req:
                #Tell environment I'm waiting.
                yield req
                (evnt, next_dir) = self.currentLoc.interact(self)
                self.env.process(self.act())
                yield evnt
                self.currentLoc = next_dir

        if not self.start.name in self.currentLoc.entities:
            self.currentLoc.entities[self.start.name] = []
        self.currentLoc.entities[self.start.name].append(self)
        print(f'[{self.env.now}]:: {self} has reached endpoint {self.currentLoc}')

#Node that generates flowing entities.
class StartingPoint(Node):
    def __init__(self,env,name, entity_name,gen_fun, limit=float('inf'),uid=None):
        super().__init__(env=env, name=name, uid=uid)
        self.entity_name = entity_name
        self.gen_fun = gen_fun
        self.directed_to = None
        # Convert limit to 0-based.
        self.limit = limit -1
        self.entities = []
        self.count = 0
        self.container_specs = {}
        self.action = env.process(self.run())
    def __str__(self):
        return self.name

    def reset(self):
        self.count = 0

    #In order to build a container for each resource for each entity,
    #Need to know design of the container.

    ##TODO: find way to enforce entities posessing containers for all existing
    ## resources. (If they shouldn't have any, then set their capacity to 0)
    def add_container_spec(self, container_spec):
        resource = container_spec['resource']
        if not resource in self.container_specs:
            self.container_specs[resource] = {}
        self.container_specs[resource][container_spec['name']] = container_spec


    def next_dir(self):
        path_list = sorted(self.directed_to.keys(), key=lambda x: x.name)
        if len(self.directed_to) > 1:
            if self.split['policy'] == "RAND":
                next_ind = random.randint(0,len(self.directed_to)-1)
            elif self.split['policy'] == "ALPHA_SEQ":
                next_ind = self.count % len(path_list)
                #No need for increasing count in starting since already do so.
                #self.count += 1
                
        else:
            next_ind = 0
        return path_list[next_ind]

    def run(self):
        print(f'[{self.env.now}]:: {self} starting entity generation')
        while self.count < self.limit:
            yield self.env.timeout(self.gen_fun)
            entity = BasicFlowEntity(self.env,f'{self.entity_name} {self.count}',self,self.next_dir())
            if len(self.container_specs) > 0:
                
       
                for resource,specs in self.container_specs.items():
                    for spec_name, spec in specs.items():
                        if not 'dist' in spec:
                            init = spec['init']
                        elif spec['dist'] == 'UNIFORM':
                            init = stats.uniform.rvs(loc=spec['loc'],scale=spec['scale'])
                        elif spec['dist'] == 'NORMAL':
                            init = stats.norm.rvs(loc=spec['loc'],scale=spec['scale'])
                        elif spec['dist'] == 'RANDINT':
                            init = stats.randint.rvs(low=spec['low'], high=spec['high'])

                        #Containers cannot have negative value, so round to 0
                        init = max(0,init)
                        inputs = {
                            'owner' : entity,
                            'init' : init,
                            'name'     : spec['name'],
                            'resource' : spec['resource'],
                            'capacity' : spec['capacity'],
                            'uid'      :  spec['uid']
                        }
                        con = BasicContainer(self.env, **inputs)
                        entity.add_container(con)
            self.env.process(entity.run())
            print(f'[{self.env.now}]:: {entity} has left {self}')
            self.count += 1
        print(f'[{self.env.now}]:: {self} ending entity generation')
            
            
#A Node that represents a "cog in a machine" such as bank tellers in a bank, or
#a dishwasher in a kitchen.
class BasicComponent(Node):
    def __init__(self,env, name, capacity, time_func, uid=None):
        super().__init__(env = env, name = name, uid = uid)
        self.name = name
        self.capacity = capacity
        self.resource = simpy.Resource(env,capacity)
        self.time_func = time_func
        self.container = None
        self.count = 0

    def __str__(self):
        return self.name

    def add_container(self, container):
        self.container = container

    
        
    def next_dir(self, entity):
        path_list = sorted(self.directed_to.keys(), key=lambda x: x.name)
        if len(self.directed_to) > 1:
            if self.split['policy'] == "RAND":
                next_ind = random.randint(0,len(self.directed_to)-1)
            elif self.split['policy'] == "ALPHA_SEQ":
                next_ind = self.count % len(path_list)
                self.count += 1
            elif self.split['policy'] == "BOOL":
                encon = entity.containers[self.split['resource']][self.split['entity_container_name']].con
                
                passed = False
                
                #When this works, use infix operators to reduce the copied code.
                #https://stackoverflow.com/questions/932328/python-defining-my-own-operators

                #Check condition based on a container
                if self.split['cond'] == "el>" and encon.level > self.split['cond_amount']:
                    passed = True
                elif self.split['cond'] == "el>=" and encon.level >= self.split['cond_amount']:
                    passed = True
                elif self.split['cond'] == "el<" and encon.level < self.split['cond_amount']:
                    passed = True
                elif self.split['cond'] == "el<=" and encon.level <= self.split['cond_amount']:
                    passed = True
                elif self.split['cond'] == "el==" and encon.level == self.split['cond_amount']:
                    passed = True

                #Check condition based on a name

                if self.split['cond'] == "en>" and entity.name > self.split['cond_amount']:
                    passed = True
                if self.split['cond'] == "en>=" and entity.name >= self.split['cond_amount']:
                    passed = True
                elif self.split['cond'] == "en<" and entity.name < self.split['cond_amount']:
                    passed = True
                elif self.split['cond'] == "en<=" and entity.name <= self.split['cond_amount']:
                    passed = True   
                elif self.split['cond'] == "en==" and entity.name == self.split['cond_amount']:
                    passed = True

                passlist = [x for x in self.directed_to if x.uid in self.split['pass']]
                faillist = [x for x in self.directed_to if x.uid in self.split['fail']]
                if passed:
                    next_ind = random.randint(0,len(passlist)-1)
                    return passlist[next_ind]
                else:
                    next_ind = random.randint(0,len(faillist)-1)
                    return faillist[next_ind]
        else:
            next_ind = 0
        return path_list[next_ind]
    
    #Returns a timeout event which represents the amount of time a component
    #needs to do it's thing.
    def interact(self, entity):
        print(f'[{self.env.now}]:: {entity} is now interacting with {self}')
        return (self.env.timeout(self.time_func),self.next_dir(entity))

    

    def reset(self):
        self.count = 0

#Wrapper for SimPy containers that allow us to differentiate between types of resources and
#identifies the owner for a container.
class BasicContainer(object):
    def __init__(self, env, name, owner, resource,init = 0, capacity = float('inf'),uid=None):
        if uid is None:
            self.uid = uuid.uuid4().hex
        else:
            self.uid = uid
        self.env = env
        self.name = name
        self.owner = owner
        self.init = init
        self.resource = resource
        self.capacity = capacity
        self.con = simpy.Container(env, float(capacity), float(init))

    def update(self, args):
        for k,v in args.items():
            setattr(self, k, v)


#Collection point for entities that have travelled through the system.
class EndingPoint(Node):
    def __init__(self,env,name, uid=None):
        super().__init__(env=env,name=name, uid=uid)
        self.entities = {}
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

