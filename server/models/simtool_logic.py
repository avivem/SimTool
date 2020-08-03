import collections
import simpy
import operator

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
        def __init__(self):
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
            return self.actions[name]
        
        def remove_action(self, name):
            del self.actions[name]

    class ConditionGroup(object):
        PASS = 1000
        FAIL = 2000
        def __init__(self, name, pass_paths, fail_paths):
            self.name = name
            self.pass_paths = set(pass_paths)
            self.fail_paths = set(fail_paths)
            self.AND = True
            self.conditions = {}
            self.action_group = None
        class Condition(object):
            op_map = {
                "e>=v" : operator.ge,
                "e>v"  : operator.gt,
                "e<=v" : operator.le,
                "e<v"  : operator.lt,
                "e==v" : operator.eq,
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

        def add_condition(self, name, encon_name, nodecon_name, op, val, names=False):
            self.conditions[name] = self.Condition(name, encon_name, nodecon_name, op, val, names)
            return self.conditions[name]

        def remove_condition(self,name):
            del self.conditions[name]
            return None

        def create_action_group(self):
            self.action_group = Logic.ActionGroup()
            return self.action_group
        
        def delete_action_group(self):
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