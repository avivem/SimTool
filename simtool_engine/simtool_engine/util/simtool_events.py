import simpy
from simtool_engine.util.simtool_logging import SimToolLogging

evnt_logger = SimToolLogging.getEventLog()
evnt_logger_machine = SimToolLogging.getEventLogMachine()
data_logger = SimToolLogging.getDataLog()
data_logger_machine = SimToolLogging.getDataLogMachine()

class SimtoolEvent(object):
    class StartEntityGeneration(simpy.events.Timeout):
        def __init__(self, env, start):
            self.start = start
            self.env = env
            super().__init__(env,0) #Use timeout event with delay of 0 since it is automatically triggered.
            evnt_logger.info(f'\t {start} starting entity generation',extra={'sim_time':env.now})

    class EndEntityGeneration(simpy.events.Timeout):
        def __init__(self, env, start):
            self.start = start
            self.env = env
            super().__init__(env,0) #Use timeout event with delay of 0 since it is automatically triggered.
            evnt_logger.info(f'\t {start} ending entity generation',extra={'sim_time':env.now})

    class EntityCreated(simpy.events.Timeout):
        def __init__(self, env, start, entity):
            self.start = start
            self.entity = entity
            self.env = env
            super().__init__(env,0)
            evnt_logger.info(f'\t {entity} has left {start}',extra={'sim_time':env.now})

    class EntityEnded(simpy.events.Timeout):
        def __init__(self, env, entity, end):
            self.env = env
            self.entity = entity
            self.end = end
            super().__init__(env,0)
            evnt_logger.info(f'\t {entity} has reached endpoint {end}.',extra={'sim_time':env.now})

    class EntityNextPathDecided(simpy.events.Timeout):
        def __init__(self, env, entity, ndir):
            self.env = env
            self.ndir = ndir
            self.entity = entity
            super().__init__(env,0)
            evnt_logger.info(f'\t {entity} Going to {ndir}', extra = {"sim_time":env.now})

    class EntityNodeInteraction(simpy.events.Timeout):
        def __init__(self,env,entity,node):
            self.env = env
            self.entity = entity
            self.node = node
            super().__init__(env,0)
            evnt_logger.info(f'\t {entity} is now interacting with {node}',extra={'sim_time':env.now})

    class EntityContainerAction(simpy.events.Timeout):
        def __init__(self,env,entity,action,currentLoc,val,encon,nodecon=None):
            self.env = env
            self.entity = entity
            self.action = action
            self.currentLoc = currentLoc
            self.val = val
            self.encon = encon
            self.nodecon = nodecon
            super().__init__(env,0)
            if action == "GIVE" : 
                evnt_logger.info(f"\t {currentLoc} has given {val} {encon.resource} from {nodecon} to {encon} of {entity}",extra={"sim_time":env.now})
            elif action == "TAKE" :
                evnt_logger.info(f"\t {currentLoc} has taken {val} {encon.resource} from {nodecon} to {encon} of {entity}",extra={"sim_time":env.now})
            elif action == "ADD" :
                evnt_logger.info(f"\t {currentLoc} has added {val} {encon.resource} to {encon} of {entity}",extra={"sim_time":env.now})
            elif action == "SUB" :
                evnt_logger.info(f"\t {currentLoc} has added {val} {encon.resource} to {encon} of {entity}",extra={"sim_time":env.now})
