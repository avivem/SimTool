import simpy
import sys
import io
import uuid
import json
import random
import math
import pprint
import scipy
import scipy.stats as stats
import logging
import numpy as np

strStream = io.StringIO()

#Create logger for event messages.
evnt_logger = logging.getLogger('evnt_logger')
#Set level to INFO (lowest level)
evnt_logger.setLevel(logging.INFO)
#Format for all messages. (can set special message formats per handler.)
formatter = logging.Formatter('[%(sim_time)s]:: %(message)s')
#Create handler for stdout
outputHandler = logging.StreamHandler(sys.stdout)
#Create handler to put results into custom Stream
strHandler = logging.StreamHandler(strStream)
outputHandler.setLevel(logging.INFO)
strHandler.setLevel(logging.INFO)

outputHandler.setFormatter(formatter)
strHandler.setFormatter(formatter)
evnt_logger.addHandler(outputHandler)
evnt_logger.addHandler(strHandler)


#Supported Path Traversals: RAND, ALPHA_SEQ, BOOL
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
        #evnt_logger.info(self.__dict__,extra={'sim_time':self.env.now})

    def set_node_logic_policy(self,node_logic):
        self.node_logic = node_logic

    def summary(self):
        pass


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
    
    def __repr__(self):
        return f'{self.name}: {self.containers}'

    def add_container(self, container):
        if not container.resource in self.containers:
            self.containers[container.resource] = {}
        self.containers[container.resource][container.name] = container

    #TODO: look into limitation regarding container names. Different classes of entities must have the same container names.
    def act(self, passed):
        if self.currentLoc.node_logic['act'] == None:
            return None

        res = self.currentLoc.node_logic['resource']
        conname = self.currentLoc.node_logic['entity_container_name']
        act_amount = self.currentLoc.node_logic['act_amount']
        #if not res in self.containers or not conname in self.containers[res]:
        #    ##Return a log entry saying entity lacked container.
        #    return None
        if self.currentLoc.node_logic['act'] == 'SUB' and passed:
            
            encon = self.containers[res][conname]
            evnt_logger.info(f'\t{self.currentLoc} is subtracting {act_amount} of {res} from {self}\'s {encon}. Old bal: {encon.con.level}. New bal: {encon.con.level - act_amount}', extra={'sim_time':self.env.now})
            yield encon.con.get(act_amount)
            yield self.currentLoc.container.con.put(act_amount)
        elif self.currentLoc.node_logic['act'] == 'ADD' and passed:
           
            encon = self.containers[res][conname]
            evnt_logger.info(f'\t{self.currentLoc} is adding {act_amount} of {res} to {self}\'s {encon}. Old bal: {encon.con.level}. New bal: {encon.con.level + act_amount}',extra={'sim_time':self.env.now})
            yield encon.con.put(act_amount)
            yield self.currentLoc.container.con.get(act_amount)

    def resources_snapshot(self):
        return {k:v.summary() for (k,v) in self.containers}

    #Down the road, add interact methods to components to allow for resource consumption.
    def run(self):
        while not isinstance(self.currentLoc,EndingPoint):
            
            #Wait in line until the component is available.
            with self.currentLoc.resource.request() as req:
                #Tell environment I'm waiting.
                yield req
                self.currentLoc.entity_resources_before[self] = self.resources_snapshot()
                (evnt, (next_dir, passed)) = self.currentLoc.interact(self)
                self.env.process(self.act(passed))
                yield evnt
                self.currentLoc.entity_resources_after[self] = self.resources_snapshot()
                self.currentLoc = next_dir

        #if not self.start.name in self.currentLoc.entities:
        #    self.currentLoc.entities[self.start.name] = []
        #self.currentLoc.entities[self.start.name].append(self)
        self.currentLoc.entities.append(self)
        evnt_logger.info(f'\t{self} has reached endpoint {self.currentLoc}',extra={'sim_time':self.env.now})
        #evnt_logger.info(f"{self.containers['Ticket']['Tickets'].con.level}",file=sys.stderr,extra={'sim_time':self.env.now})

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
        evnt_logger.info(f'\t{self} starting entity generation',extra={'sim_time':self.env.now})
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
            self.entities.append(entity)
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
            evnt_logger.info(f'\t{entity} has left {self}',extra={'sim_time':self.env.now})
            self.count += 1
        evnt_logger.info(f'\t{self} ending entity generation',extra={'sim_time':self.env.now})

    def summary(self):
        return {
            "num_entities_encountered" : self.count
        }
            
            
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
        self.entity_resources_before = {}
        self.entity_resources_after = {}

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"{self.name}"

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
                passlist = [x for x in self.directed_to if x in self.node_logic['pass']]
                faillist = [x for x in self.directed_to if x in self.node_logic['fail']]

                #pprint.pevnt_logger.info(f"self: {self}, entity: {entity} faillist: {faillist}, passlist: {passlist}, directed_to: {self.directed_to}",sys.stderr,extra={'sim_time':self.env.now})
                #Check if the container exists in entity, if not fail immediately:
                #if not res in entity.containers or not conname in entity.containers[res]:
                #    next_ind = random.randint(0,len(faillist)-1)
                #    return faillist[next_ind]
                if False:
                    evnt_logger.info("test",extra={'sim_time':self.env.now})
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

                """ evnt_logger.info(f"",file=sys.stderr,extra={'sim_time':self.env.now})
                evnt_logger.info(f"{entity}",file=sys.stderr,extra={'sim_time':self.env.now})
                evnt_logger.info(f"{entity.containers['Dollar']['Wallet'].con.level}",file=sys.stderr,extra={'sim_time':self.env.now})
                evnt_logger.info(f"passlist: {passlist}",file=sys.stderr,extra={'sim_time':self.env.now})
                evnt_logger.info(f"faillist: {faillist}",file=sys.stderr,extra={'sim_time':self.env.now})
                pprint.pevnt_logger.info(self.directed_to, sys.stderr,extra={'sim_time':self.env.now})
                evnt_logger.info(f"Passed or failed?: {passed}",file=sys.stderr,extra={'sim_time':self.env.now}) """
                
                
                if passed:
                    next_ind = random.randint(0,len(passlist)-1)
                    evnt_logger.info(f'\t{entity} Going to {passlist[next_ind]}',extra={'sim_time':self.env.now})
                    return (passlist[next_ind], True)
                else:

                    try:
                        next_ind = random.randint(0,len(faillist)-1)
                        evnt_logger.info(f'\t{entity} Going to {faillist[next_ind]}',extra={'sim_time':self.env.now})
                    except:
                        raise ValueError(f"self: {self}, faillist: {faillist}, passlist: {passlist}, directed_to: {self.directed_to}, node logic: {self.node_logic}")
                    return (faillist[next_ind], False)
        else:
            next_ind = 0
        
        try:
            return (path_list[next_ind], True)
        except:
            raise ValueError(f'self is {self}, path_list is {path_list}, index is {next_ind}')
    
    #Returns a timeout event which represents the amount of time a component
    #needs to do it's thing.
    def interact(self, entity):
        evnt_logger.info(f'\t{entity} is now interacting with {self}',extra={'sim_time':self.env.now})
        return (self.env.timeout(self.time_func),self.next_dir(entity))

    def reset(self):
        self.count = 0

    def summary_resource(self, before:bool,resource):
        if before:
            resources = self.entity_resources_before
        else:
            resources = self.entity_resources_after
        
        res = resources["resource"]
        return {
            "resource" : resource,
            "capacity"  :np.mean([y["capacity"] for (x,y) in res]),
            "avg_init" : np.mean([y["init"] for (x,y) in res]),
            "avg_level" : np.mean([y["level"] for (x,y) in res])
        }
        

    def summary(self):
        return {
            "num_entities_encountered" : self.count,
            "entity_resources_before" : {},
            "entity_resources_after"
        }

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

    def __repr__(self):
        return f"{self.name}"

    def update(self, args):
        for k,v in args.items():
            setattr(self, k, v)

    def summary(self):
        return {
            "owner" : self.owner,
            "resource" : self.resource,
            "init" : self.init,
            "capacity" : self.capacity,
            "level" : self.con.level
        }


#Collection point for entities that have travelled through the system.
class EndingPoint(Node):
    def __init__(self,env,name, uid=None):
        super().__init__(env=env,name=name, uid=uid)
        #self.entities = {}
        self.entities = []
    def __str__(self):
        return self.name
    def __repr__(self):
        return f"{self.name}"

def run(env,until=math.inf):
    env.run(until)
    return strStream.getvalue()