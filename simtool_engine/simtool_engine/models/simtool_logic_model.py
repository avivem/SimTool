""" simtool_logic_model.py contains the Logic class, which represents the conditons
and actions a station can take when interacting with an entity.

Written by Aviv Elazar-Mittelman, July 2020
"""

import collections
import simpy
import operator

class Logic(object):
    """ Every Node (except EndingPoints) have a reference to a Logic object
    which dictates how the node behaves when interacting with an entity.

    Logic in StartingNodes is used solely for deciding which path selection
    method should be used (e.g. RAND, ALPHA_SEQ).

    Logic in Station Nodes (BasicComponent) also have Conditions and Actions
    which allow the node to exchange resources and direct nodes based on
    resource levels or their names. Multiple ConditionGroups can be created,
    each having their own set of Actions.
    """

    #Named tuple class for returning actions and choice of paths.
    ResultTuple = collections.namedtuple('Result', ['action_groups','paths'])
    def __init__(self, split_policy):
        self.condition_groups = {}
        self.split_policy = split_policy

    #Check if no conditions.
    def noconds(self):
        return len(self.condition_groups) == 0

    class ActionGroup(object):
        """ ActionGroup holds a group of Action objects. Belongs to a single
        ConditionGroup.
        """
        def __init__(self):
            self.actions = {}
        
        class Action(object):
            """ An Action object represents a single action that should take
            place given the associated ConditionGroup returns True. An Action
            can transfer resources between containers, or simply alter the level
            of an entity's containers.
            """
            def __init__(self, name, con1_name, con2_name, op, val):
                self.name = name
                self.con1_name = con1_name
                self.con2_name = con2_name
                self.op = op
                self.val = val
            
            def serialize(self):
                return {
                    "name" : self.name,
                    "con1_name" : self.con1_name,
                    "con2_name" : self.con2_name,
                    "op" : self.op,
                    "val" : self.val
                }
        
        def add_action(self, name, con1_name, con2_name, op, val):
            self.actions[name] = self.Action(name, con1_name, con2_name, op, val)
            return self.actions[name]
        
        def remove_action(self, name):
            del self.actions[name]

        def serialize(self):
            return {
                "actions" : {name:action.serialize() for name,action in self.actions.items()}
            }

    class ConditionGroup(object):
        """ ConditionGroup holds multiple Conditions. A ConditionGroup can be
        configured to return true if at least one Condition returns true, or if
        all return true. Each ConditionGroup has a list of paths for success and
        failure that are added to the final paths after all conditions are 
        checked.
        """
        PASS = 1000
        FAIL = 2000
        def __init__(self, name, pass_paths, fail_paths):
            self.name = name
            self.pass_paths = set(pass_paths)
            self.fail_paths = set(fail_paths)
            self.AND = True
            self.conditions = {}
            self.action_group = None

        """ Conditions allow for comparing Entities and various other things.
        They return a boolean value corresponding to the result of the condition.
        The following types of conditions are supported:

            -   Entity Container vs Set Value
                --  Compare the value of an entity's container to a set value.

            -   Entity Container vs Node Container
                --  Compare the value of an entity's container to the value of
                    a container in the node of the same type.

            -   Entity name      vs Set Value
                --  Compare the name of the entity to a certain string.

            -   Node Container   vs Set Value
                --  Compare the value of a node's container to a set value.
        """
        class Condition(object):
            op_map = {
                ">=" : operator.ge,
                ">"  : operator.gt,
                "<=" : operator.le,
                "<"  : operator.lt,
                "==" : operator.eq,
            }

            def __init__(self, name, con1_name, con2_name, mode, op, val):
                self.name = name
                self.con1_name = con1_name
                self.con2_name = con2_name
                self.mode = mode
                self.op = op
                self.op_func = self.op_map[op]
                self.val = val
                

            def eval(self, entity, node):

                if self.mode == "entity_value":
                    try:
                        encon = entity.containers[self.con1_name]
                    except KeyError:
                        return False
                    return self.op_func(encon.con.level,self.val)
                elif self.mode == "entity_node":
                    try:
                        encon = entity.containers[self.con1_name]
                        nodecon = node.containers[self.con2_name]
                    except KeyError:
                        return False
                    if not encon.resource == nodecon.resource:
                        return False
                    else:
                        return self.op_func(encon.con.level,nodecon.con.level)
                elif self.mode == "entity_name":
                    return self.op_func(entity.name,self.val)
                elif self.mode == "node_value":
                    try:
                        nodecon = node.containers[self.con2_name]
                    except KeyError:
                        return False
                    return self.op_func(nodecon.con.level,self.val)
                elif self.mode == "entity_entity":
                    try:
                        encon1 = entity.containers[self.con1_name]
                        encon2 = entity.containers[self.con2_name]
                    except KeyError:
                        return False
                    return self.op_func(encon1.level, encon2.level)
                elif self.mode == "node_node":
                    try:
                        node1 = node.containers[self.con1_name]
                        node2 = node.containers[self.con2_name]
                    except KeyError:
                        return False
                    return self.op_func(node1.level, node2.level)

            def serialize(self):
                return {
                    "name": self.name,
                    "con1_name": self.con1_name,
                    "con2_name": self.con2_name,
                    "mode" : self.mode,
                    "op": self.op,
                    "val": self.val,
                }

        def addPath(self, uid, opt):
            if opt == Logic.ConditionGroup.PASS:
                self.pass_paths.add(uid)
            else:
                self.fail_paths.add(uid)
        
        def removePath(self, uid, opt):
            if opt == Logic.ConditionGroup.PASS:
                self.pass_paths.remove(uid)
            else:
                self.fail_paths.remove(uid)

        def add_condition(self, name, con1_name, con2_name, mode, op, val):
            self.conditions[name] = self.Condition(name, con1_name, con2_name, mode, op, val)
            return self.conditions[name]

        def remove_condition(self,name):
            del self.conditions[name]
            return None

        def create_action_group(self):
            self.action_group = Logic.ActionGroup()
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

        def serialize(self):
            return {
                "name" : self.name,
                "pass_paths" : [x.uid for x in self.pass_paths],
                "fail_paths" : [x.uid for x in self.fail_paths],
                "conditions" : {name:condition.serialize() for name,condition in self.conditions.items()},
                "action_group" : self.action_group.serialize() if self.action_group != None else None
            }
    
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

    def serialize(self):
        return {
            "cond_groups": {name:group.serialize() for name,group in self.condition_groups.items()},
            "split_policy" : self.split_policy
        }