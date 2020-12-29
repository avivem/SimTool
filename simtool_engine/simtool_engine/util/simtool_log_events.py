from simtool_engine.util.simtool_logging import SimToolLogging

evnt_logger = SimToolLogging.getEventLog()
evnt_logger_machine = SimToolLogging.getEventLogMachine()
data_logger = SimToolLogging.getDataLog()
data_logger_machine = SimToolLogging.getDataLogMachine()

class SimToolLogEvent(object):
    
    def logContainerDoPut(self):
        evnt_logger.info("test")