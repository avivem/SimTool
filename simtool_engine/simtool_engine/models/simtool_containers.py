""" simtool_containers.py defines Container classes which allow us to store
amounts of resources (e.g. water, food, energy, tables), and associate them with
specific entities / nodes.

BasicContainerBlueprint defines a blueprint for a specific type of container.

BasicContainer defines a simple container that can hold limited or infinite
levels of a specific resource.

Written by Aviv Elazar-Mittelman, July 2020.
"""

import simpy
import random
import scipy.stats as stats
import uuid
import math

class BasicContainerBlueprint(object):
    """ BasicContainerBlueprint provides a 
    """
    def __init__(self,name, resource, init = {'init' : 0}, capacity=float('inf'), uid=None):
        self.name = name
        self.resource = resource
        self.capacity = capacity
        self.init = init
        self.uid = uid

    def build(self, env,owner):
        return BasicContainer(env=env, name=self.name, owner=owner, resource=self.resource, init=self.init, capacity=self.capacity, uid=self.uid, blueprint=self)

    def update(self, args):
        for k,v in args.items():
            setattr(self, k, v)

    def serialize(self):
        return {
            "name" : self.name,
            "uid" : self.uid,
            "resource" : self.resource,
            "init" : self.init,
            "capacity" : self.capacity
        }

#Wrapper for SimPy containers that allow us to differentiate between types of resources and
#identifies the owner for a container.
class BasicContainer(object):
    def __init__(self, env, name, owner, resource,init = {'init' : 0}, capacity = float('inf'),uid=None, blueprint=None):
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
        self.blueprint = blueprint
        self.con = simpy.Container(env, float(capacity), float(init))

    def __str__(self):
        return f"<{self.name}>:({self.con.level})"
    
    def __repr__(self):
        return f"{self.__class__.__name__}(env=<env>,name=\"{self.name}\",owner=<{self.owner}>,resource=\"{self.resource}\",init={self.init},capacity={self.capacity},uid=\"{self.uid}\")"

    def update(self, args):
        #If 
        if not (len(args) == 1 and 'env' in args):
            self.blueprint = None
        for k,v in args.items():
            setattr(self, k, v)

    def summary(self):
        return {
            "name" : self.name,
            "owner" : str(self.owner),
            "resource" : self.resource,
            "init" : self.init,
            "capacity" : self.capacity,
            "level" : self.con.level
        }

    def serialize(self):
        return {
            "name" : self.name,
            "uid" : self.uid,
            "owner" : self.owner.uid,
            "resource" : self.resource,
            "init" : self.init,
            "capacity" : self.capacity,
            "blueprint" : self.blueprint
        }