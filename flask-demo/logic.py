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
import operator
import collections

strStream = io.StringIO()

#Supported Path Traversals: RAND, ALPHA_SEQ

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


#Basic building block of a system. It knows where an entity should go next.
class Node(object):
    def __init__(self, env, name, uid = None):
        if uid is None:
            self.uid = uuid.uuid4().hex
        else:
            self.uid = uid
        self.env = env
        self.name = name
        self.logic= Logic("RAND")
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

    def create_logic(self, split_policy):
        self.logic = Logic(split_policy)

    def summary(self):
        pass

class Logic(object):
    ResultTuple = collections.namedtuple('Result', ['action_groups','paths'])
    def __init__(self, split_policy, pass_paths = [], fail_paths = []):
        self.condition_groups = {}
        self.split_policy = split_policy
        self.pass_paths = pass_paths
        self.fail_paths = fail_paths

    def noconds(self):
        return len(self.condition_groups) == 0

    class ActionGroup(object):
        def __init__(self,name):
            self.name = name
            self.actions = {}
        
        class Action(object):
            def __init__(self, name, encon_name, nodecon_name, op, val):
                self.name = name
                self.encon_name = encon_name
                self.nodecon_name = nodecon_name
                self.op = op
                self.val = val
        
        def add_action(self, name, encon_name, nodecon_name, op, val):
            self.actions[name] = self.Action(name, encon_name, nodecon_name, op, val)
        
        def remove_action(self, name):
            del self.actions[name]

    class ConditionGroup(object):
        def __init__(self, name, pass_paths, fail_paths):
            self.name = name
            self.pass_paths = set(pass_paths)
            self.fail_paths = set(fail_paths)
            self.AND = True
            self.conditions = {}
            self.action_group = None
        class Condition(object):
            op_map = {
                "e>=n" : operator.ge,
                "e>n"  : operator.gt,
                "e<=n" : operator.le,
                "e<n"  : operator.lt,
                "e==n" : operator.eq,
            }
            def __init__(self, name, encon_name, nodecon_name, op, val, names=False):
                self.name = name
                self.encon_name = encon_name
                self.nodecon_name = nodecon_name
                self.op = op
                self.val = val
                self.names = names
                

            def eval(self, entity, node):
                op = self.op_map[self.op]
                try:
                    encon = entity.containers[self.encon_name]
                    nodecon = node.containers[self.nodecon_name]
                except KeyError:
                    return False
                if not self.names:
                    return op(encon.con.level,self.val)
                else:
                    return op(encon.name, nodecon.name)

        def add_condition(self, name, encon_name, nodecon_name, op, val, names=False):
            self.conditions[name] = self.Condition(name, encon_name, nodecon_name, op, val, names)
            return None

        def remove_condition(self,name):
            del self.conditions[name]
            return None

        def create_action_group(self, name):
            self.action_group = Logic.ActionGroup(name)
            return self.action_group
        
        def delete_action_group(self,name):
            del self.action_group
            return None

        def eval(self, entity, node):
            results = []
            for name,cond in self.conditions.items():
                results.append(cond.eval(entity, node))
            
            if self.AND:
                return all(results)
            else:
                return any(results)
        #Default to AND so flip once for or.
        def flip_type(self):
            self.AND = not self.AND 
    
    def create_condition_group(self, name, pass_paths, fail_paths):
        self.condition_groups[name] = Logic.ConditionGroup(name, pass_paths, fail_paths)
        return self.condition_groups[name]
    
    def delete_condition_group(self,name):
        del self.condition_groups[name]
        return None

    def eval(self, entity, node):
        action_groups = []
        pass_paths = set()
        fail_paths = set()
        for name,cond_group in self.condition_groups.items():
            if cond_group.eval(entity, node):
                pass_paths.update(cond_group.pass_paths)
                action_groups.append(cond_group.action_group)
            else:
                fail_paths.update(cond_group.fail_paths)
        if len(pass_paths) > 0:
            return self.ResultTuple(action_groups=action_groups, paths=pass_paths)
        else:
            return self.ResultTuple(action_groups=action_groups, paths=fail_paths)
    
                


"""
Class that represents the basic object that flows through the system. This
could represent a person walking through a bank, an animal going through a
food production facility, a primary ingredient flowing through a production
line, etc. 

"""
class BasicFlowEntity(object):
    op_map = {
        "GIVE" : "Given",
        "TAKE" : "Taken",
        "ADD" : "Added",
        "SUB" : "Subtracted",
        "MULT" : "Multiplied"
    }
    
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
                    elif ac.op == "MULT":
                        yield encon.con.put(encon.con.level*ac.val)
                    #Print log message here.


        """ res = self.currentLoc.logic['resource']
        conname = self.currentLoc.logic['entity_container_name']
        act_amount = self.currentLoc.logic['act_amount']
        #if not res in self.containers or not conname in self.containers[res]:
        #    ##Return a log entry saying entity lacked container.
        #    return None
        if self.currentLoc.logic['act'] == 'SUB' and passed:
            
            encon = self.containers[res][conname]
            evnt_logger.info(f'\t{self.currentLoc} is subtracting {act_amount} of {res} from {self}\'s {encon}. Old bal: {encon.con.level}. New bal: {encon.con.level - act_amount}', extra={'sim_time':self.env.now})
            yield encon.con.get(act_amount)
            yield self.currentLoc.container.con.put(act_amount)
        elif self.currentLoc.logic['act'] == 'ADD' and passed:
           
            encon = self.containers[res][conname]
            evnt_logger.info(f'\t{self.currentLoc} is adding {act_amount} of {res} to {self}\'s {encon}. Old bal: {encon.con.level}. New bal: {encon.con.level + act_amount}',extra={'sim_time':self.env.now})
            yield encon.con.put(act_amount)
            yield self.currentLoc.container.con.get(act_amount) """

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
        self.blueprints = {}
        self.action = env.process(self.run())
        
    def __str__(self):
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
        evnt_logger.info(f'\t{self} starting entity generation',extra={'sim_time':self.env.now})

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

            entity = BasicFlowEntity(self.env,f'{self.entity_name} {self.count}',self,self.next_dir())
            self.entities.append(entity)
            if len(self.blueprints) > 0:

                for name, blueprint in self.blueprints.items():
                    con = blueprint.build(self.env, entity)
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
        self.containers = {}
        self.count = 0
        self.entity_resources_before = {}
        self.entity_resources_after = {}

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"{self.name}"

    def add_container(self, blueprint):
        self.containers[blueprint.name] = blueprint.build(self.env, self)

    def get_con(self, name):
        return self.containers[name]

    def next_dir(self, entity):
        path_list = sorted(self.directed_to.keys(), key=lambda x: x.name)
        if len(self.directed_to) > 1:
            if self.logic.split_policy == "RAND":
                next_ind = random.randint(0,len(self.directed_to)-1)
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

                passed = len(action_groups) > 0
                (action_groups, paths) = self.logic.eval(entity, self)
                #pprint.pprint(self.directed_to, sys.stderr)
                #pprint.pprint(paths, sys.stderr)
                pathlist = [x for x in self.directed_to if x in paths]
                #pprint.pprint(pathlist, sys.stderr)
                next_ind = random.randint(0, len(pathlist)-1)
                print(f'[{self.env.now}]::\t{entity} Going to {pathlist[next_ind]}')
                passed = len(action_groups) > 0
                return (pathlist[next_ind], action_groups)          
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

class BasicContainerBlueprint(object):
    def __init__(self,name, resource, init = {'init' : 0}, capacity=float('inf'), uid=None):
        self.name = name
        self.resource = resource
        self.capacity = capacity
        self.init = init
        self.uid = uid

    def build(self, env,owner):
        return BasicContainer(env=env, name=self.name, owner=owner, resource=self.resource, init=self.init, capacity=self.capacity, uid=self.uid)

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
        return f"{self.name} + {self.con.level}"

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