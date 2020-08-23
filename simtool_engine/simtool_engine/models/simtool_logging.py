import logging
import uuid
import io
import sys

class SimToolLogging():

    #Consider using a thread local to store StringIO for each Sim.
    _evnt_log = logging.getLogger("envt")
    _evnt_log_machine = logging.getLogger("evnt_machine")

    _data_log = logging.getLogger("data")
    _data_log_machine = logging.getLogger("data_machine")

    _data_log.setLevel(logging.INFO)
    _evnt_log.setLevel(logging.INFO)

    _data_log_machine.setLevel(logging.INFO)
    _evnt_log_machine.setLevel(logging.INFO)

    _strStream = io.StringIO()
    _strStream_machine = io.StringIO()

    #DataStore messages are of the format: <date and time>:: <msg>
    _data_formatter = logging.Formatter('<%(asctime)s>::%(message)s')
    #Messages from events are of teh format: [sim_time]:: <msg>
    _evnt_formatter = logging.Formatter('[%(sim_time)s]:: %(message)s')


    _data_formatter_machine = logging.Formatter('<%(asctime)s><%(filename)s:%(lineno)s><%(funcName)s>::%(message)s')
    _evnt_formatter_machine = logging.Formatter('<%(asctime)s><%(filename)s:%(lineno)s><%(funcName)s>::[%(sim_time)s]::%(message)s')

    #Messages are directed to stdout and to two IOStreams.
    _data_out_handler = logging.StreamHandler(sys.stdout)
    _data_str_handler = logging.StreamHandler(_strStream)

    _data_out_handler_machine = logging.StreamHandler(sys.stdout)
    _data_str_handler_machine = logging.StreamHandler(_strStream_machine)

    _evnt_out_handler = logging.StreamHandler(sys.stdout)
    _evnt_str_handler = logging.StreamHandler(_strStream)

    _evnt_out_handler_machine = logging.StreamHandler(sys.stdout)
    _evnt_str_handler_machine = logging.StreamHandler(_strStream_machine)

    _data_out_handler.setLevel(logging.INFO)
    _data_str_handler.setLevel(logging.INFO)

    _data_out_handler_machine.setLevel(logging.INFO)
    _data_str_handler_machine.setLevel(logging.INFO)

    _evnt_out_handler.setLevel(logging.INFO)
    _evnt_str_handler.setLevel(logging.INFO)

    _evnt_out_handler_machine.setLevel(logging.INFO)
    _evnt_str_handler_machine.setLevel(logging.INFO)

    _data_out_handler.setFormatter(_data_formatter)
    _data_str_handler.setFormatter(_data_formatter)

    _data_out_handler_machine.setFormatter(_data_formatter_machine)
    _data_str_handler_machine.setFormatter(_data_formatter_machine)

    _evnt_out_handler.setFormatter(_evnt_formatter)
    _evnt_str_handler.setFormatter(_evnt_formatter)

    _evnt_out_handler_machine.setFormatter(_evnt_formatter_machine)
    _evnt_str_handler_machine.setFormatter(_evnt_formatter_machine)

    _data_log.addHandler(_data_out_handler)
    _data_log.addHandler(_data_str_handler)

    _data_log_machine.addHandler(_data_out_handler_machine)
    _data_log_machine.addHandler(_data_str_handler_machine)

    _evnt_log.addHandler(_evnt_out_handler)
    _evnt_log.addHandler(_evnt_str_handler)

    _evnt_log_machine.addHandler(_evnt_out_handler_machine)
    _evnt_log_machine.addHandler(_evnt_str_handler_machine)
    
    @classmethod
    def getEventLog(cls):
        return cls._evnt_log

    @classmethod
    def getEventLogMachine(cls):
        return cls._evnt_log_machine

    @classmethod
    def getDataLog(cls):
        return cls._data_log

    @classmethod
    def getDataLogMachine(cls):
        return cls._data_log_machine

    @classmethod
    def getStrStream(cls):
        return cls._strStream
    
    @classmethod
    def getStrStreamMachine(cls):
        return cls._strStream_machine
    
    #Disable console messages to reduce spam.
    @classmethod
    def disable_evnt_console(cls):
        cls._evnt_log.removeHandler(cls._evnt_str_handler)
    
    #Opposite of above command.
    @classmethod
    def enable_evnt_console(cls):
        cls._evnt_log.addHandler(cls._evnt_str_handler)
        