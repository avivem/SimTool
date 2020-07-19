import simpy
import sys
import io
import uuid
import json
import random
import math
import pprint
import scipy.stats as stats

#Supported Path Traversals: RAND, ALPHA_SEQ

""" if __name__ is not "__main__":
    old_stdout = sys.stdout
    new_stdout = io.StringIO()
    sys.stdout = new_stdout """

node_logic = {
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
        self.node_logic= node_logic
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

    def set_node_logic_policy(self,node_logic):
        self.node_logic = node_logic


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

    #TODO: look into limitation regarding container names. Different classes of entities must have the same container names.
    def act(self):
        if self.currentLoc.node_logic['act'] == None:
            return None

        res = self.currentLoc.node_logic['resource']
        conname = self.currentLoc.node_logic['entity_container_name']
        if not res in self.containers or not conname in self.containers[res]:
            ##Return a log entry saying entity lacked container.
            return None
        if self.currentLoc.node_logic['act'] == 'SUB':
            encon = self.containers[res][conname].con
            yield encon.get(self.currentLoc.node_logic['act_amount'])
            yield self.currentLoc.container.con.put(self.currentLoc.node_logic['act_amount'])
        elif self.currentLoc.node_logic['act'] == 'ADD':
            encon = self.containers[res][conname].con
            yield encon.put(self.currentLoc.node_logic['act_amount'])
            yield self.currentLoc.container.con.get(self.currentLoc.node_logic['act_amount'])

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
    def __init__(self,env,name, entity_name,generation, limit=float('inf'),uid=None):
        super().__init__(env=env, name=name, uid=uid)
        self.entity_name = entity_name
        self.generation = generation
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
            if self.node_logic['policy'] == "RAND":
                next_ind = random.randint(0,len(self.directed_to)-1)
            elif self.node_logic['policy'] == "ALPHA_SEQ":
                next_ind = self.count % len(path_list)
                #No need for increasing count in starting since already do so.
                #self.count += 1
                
        else:
            next_ind = 0
        return path_list[next_ind]

    def run(self):
        print(f'[{self.env.now}]:: {self} starting entity generation')
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

            entity = BasicFlowEntity(self.env,f'{self.entity_name} {self.count}',self,self.next_dir())
            if len(self.container_specs) > 0:

                for resource,specs in self.container_specs.items():
                    for spec_name, spec in specs.items():
                        #Containers cannot have negative value, so round to 0
                        inputs = dict(spec)
                        inputs['owner'] = entity
                        inputs = {
                            'owner' : entity,
                            'init' : spec['init'],
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
            if self.node_logic['policy'] == "RAND":
                next_ind = random.randint(0,len(self.directed_to)-1)
            elif self.node_logic['policy'] == "ALPHA_SEQ":
                next_ind = self.count % len(path_list)
                self.count += 1
            elif self.node_logic['policy'] == "BOOL":
                res = self.node_logic['resource']
                conname = self.node_logic['entity_container_name']
                passlist = [x for x in self.directed_to if x.uid in self.node_logic['pass']]
                faillist = [x for x in self.directed_to if x.uid in self.node_logic['fail']]

                #Check if the container exists in entity, if not fail immediately:
                if not res in entity.containers or not conname in entity.containers[res]:
                    next_ind = random.randint(0,len(faillist)-1)
                    return faillist[next_ind]
                else:
                    encon = entity.containers[res][conname].con
                    passed = False
                    
                    #When this works, use infix operators to reduce the copied code.
                    #https://stackoverflow.com/questions/932328/python-defining-my-own-operators

                    #Check condition based on a container
                    if self.node_logic['cond'] == "el>" and encon.level > self.node_logic['cond_amount']:
                        passed = True
                    elif self.node_logic['cond'] == "el>=" and encon.level >= self.node_logic['cond_amount']:
                        passed = True
                    elif self.node_logic['cond'] == "el<" and encon.level < self.node_logic['cond_amount']:
                        passed = True
                    elif self.node_logic['cond'] == "el<=" and encon.level <= self.node_logic['cond_amount']:
                        passed = True
                    elif self.node_logic['cond'] == "el==" and encon.level == self.node_logic['cond_amount']:
                        passed = True

                    #Check condition based on a name

                    if self.node_logic['cond'] == "en>" and entity.name > self.node_logic['cond_amount']:
                        passed = True
                    if self.node_logic['cond'] == "en>=" and entity.name >= self.node_logic['cond_amount']:
                        passed = True
                    elif self.node_logic['cond'] == "en<" and entity.name < self.node_logic['cond_amount']:
                        passed = True
                    elif self.node_logic['cond'] == "en<=" and entity.name <= self.node_logic['cond_amount']:
                        passed = True   
                    elif self.node_logic['cond'] == "en==" and entity.name == self.node_logic['cond_amount']:
                        passed = True

                
                if passed:
                    next_ind = random.randint(0,len(passlist)-1)
                    return passlist[next_ind]
                else:
                    next_ind = random.randint(0,len(faillist)-1)
                    return faillist[next_ind]
        else:
            next_ind = 0
        
        try:
            return path_list[next_ind]
        except:
            raise ValueError(f'self is {self}, path_list is {path_list}, index is {next_ind}')
    
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
    def __init__(self, env, name, owner, resource,init = {'init' : 0}, capacity = float('inf'),uid=None):
        if uid is None:
            self.uid = uuid.uuid4().hex
        else:
            self.uid = uid

        if not 'dist' in init:
            if init['init'] == 'inf':
                init = math.inf
            else:
                init = init['init']
        elif init['dist'] == 'UNIFORM':
            init = stats.uniform.rvs(loc=init['loc'],scale=init['scale'])
        elif init['dist'] == 'NORMAL':
            init = stats.norm.rvs(loc=init['loc'],scale=init['scale'])
        elif init['dist'] == 'RANDINT':
            init = stats.randint.rvs(low=init['low'], high=init['high'])
        init = max(0,init)
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
st = StartingPoint(env, "Starting Point 1","Person", 2, 100)
b1 = BasicComponent(env,"Basic Component #1", 3, 7) 
ed = EndingPoint(env,"Ending Point 1")
st.set_directed_to(b1)
b1.set_directed_to(ed)
env.process(st.run())
env.run(until=5000) """

