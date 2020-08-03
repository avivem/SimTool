import uuid
import simpy
import collections
import logging
from .simtool_entities import BasicFlowEntity
from .simtool_logic import Logic
from .simtool_containers import BasicContainer, BasicContainerBlueprint
import random
import scipy.stats as stats
import numpy as np

evnt_logger = logging.getLogger('evnt_logger')

class Node(object):
    def __init__(self, env, name, uid = None):
        if uid is None:
            self.uid = uuid.uuid4().hex
        else:
            self.uid = uid
        self.env = env
        self.name = name
        self.logic= Logic("RAND")
        self.entities = set()
        #Achieve an ordered set using a dict and .keys
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

    #each node type should define their own reset steps.
    def reset(self):
        pass

    def create_logic(self, split_policy):
        self.logic = Logic(split_policy)

    def summary(self):
        pass


#Node that generates flowing entities.
class StartingPoint(Node):
    def __init__(self,env,name, entity_name,generation, limit=float('inf'),uid=None):
        super().__init__(env=env, name=name, uid=uid)
        self.entity_name = entity_name
        self.generation = generation
        self.directed_to = None
        # Convert limit to 0-based.
        self.limit = limit -1
        self.count = 0
        self.blueprints = {}
        self.action = env.process(self.run())
        
    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    def reset(self):
        self.count = 0

    #In order to build a container for each resource for each entity,
    #Need to know design of the container.

    ##TODO: find way to enforce entities posessing containers for all existing
    ## resources. (If they shouldn't have any, then set their capacity to 0)
    def add_blueprint(self, blueprint):
        name = blueprint.name
        self.blueprints[name] = blueprint


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

    def run(self):
        evnt_logger.info(f'\t {self} starting entity generation',extra={'sim_time':self.env.now})

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

            entity = BasicFlowEntity(self.env,self.env.now,f'{self.entity_name} {self.count}',self,self.next_dir())
            self.entities.add(entity)
            if len(self.blueprints) > 0:

                for name, blueprint in self.blueprints.items():
                    con = blueprint.build(self.env, entity)
                    entity.add_container(con)

            self.env.process(entity.run())
            evnt_logger.info(f'\t {entity} has left {self}',extra={'sim_time':self.env.now})
            self.count += 1
        evnt_logger.info(f'\t {self} ending entity generation',extra={'sim_time':self.env.now})

    def summary(self):
        return {
            "name" : self.name,
            "number of entities created" : self.count
        }
            
            
#A Node that represents a "cog in a machine" such as bank tellers in a bank, or
#a dishwasher in a kitchen.

#TODO: add probability based time_func
class BasicComponent(Node):
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
            evnt_logger.info(f'\t {entity} Going to {pathlist[next_ind]}', extra = {"sim_time":self.env.now})
            return (pathlist[next_ind], action_groups)          
        
        try:
            return (path_list[next_ind], True)
        except:
            raise ValueError(f'self is {self}, path_list is {path_list}, index is {next_ind}')
    
    #Returns a timeout event which represents the amount of time a component
    #needs to do it's thing.
    def interact(self, entity):
        evnt_logger.info(f'\t {entity} is now interacting with {self}',extra={'sim_time':self.env.now})
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
            for con in self.containers:
                con.update({"env":self.env})


#Collection point for entities that have travelled through the system.
class EndingPoint(Node):
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
