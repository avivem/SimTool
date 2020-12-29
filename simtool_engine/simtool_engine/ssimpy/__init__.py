import simpy
import wrapt
from simtool_engine.util.simtool_logging import SimToolLogging
from typing import TYPE_CHECKING, Optional, Union
from simpy.core import BoundClass

evnt_logger = SimToolLogging.getEventLog()
evnt_logger_machine = SimToolLogging.getEventLogMachine()
data_logger = SimToolLogging.getDataLog()
data_logger_machine = SimToolLogging.getDataLogMachine()

ContainerAmount = Union[int, float]

class ModifiedContainerPut(simpy.resources.base.Put):
    def __init__(self, container, amount, name, owner, resource):
        
        if amount <= 0:
            raise ValueError(f'amount(={amount}) must be > 0.')
        self.amount = amount
        self.name = name
        self.owner = owner
        self.resource = resource
        evnt_logger.info(f"\t {self.name} of {self.owner} received put request of {amount} {self.resource}",extra={"sim_time":container._env.now})
        super().__init__(container)
        
        
    
class ModifiedContainerGet(simpy.resources.base.Get):
    def __init__(self, container, amount, name, owner, resource):

        if amount <= 0:
            raise ValueError(f'amount(={amount}) must be > 0.')
        self.amount = amount
        self.name = name
        self.owner = owner
        self.resource = resource
        evnt_logger.info(f"\t {self.name} of {self.owner} received get request of {amount} {self.resource}",extra={"sim_time":container._env.now})
        super().__init__(container)

        
        
class ModifiedContainer(simpy.Container):

    def __init__(self, env, capacity, init, name, owner, resource):
        super().__init__(env,capacity, init)
        self.name = name
        self.owner = owner
        self.resource = resource

    if TYPE_CHECKING:

        def put(  # type: ignore[override] # noqa: F821
            self, amount: ContainerAmount, name: str, owner, resource: str
        ) -> ModifiedContainerPut:
            """Request to put *amount* of matter into the container."""
            return ModifiedContainerPut(self, amount, self.name, self.owner, self.resource)

        def get(  # type: ignore[override] # noqa: F821
            self, amount: ContainerAmount, name: str, owner, resource: str
        ) -> ModifiedContainerGet:
            """Request to get *amount* of matter out of the container."""
            return ModifiedContainerGet(self, amount, self.name, self.owner, self.resource)

    else:
        put = BoundClass(ModifiedContainerPut)
        get = BoundClass(ModifiedContainerGet)

    def _do_put(self, event: ModifiedContainerPut) -> Optional[bool]:
        if self._capacity - self._level >= event.amount:
            self._level += event.amount
            event.succeed()
            evnt_logger.info(f"\t {self.name} of {self.owner}'s level increased by {event.amount} {self.resource}'",extra={"sim_time":self._env.now})
            return True
        else:
            evnt_logger.info(f"\t {self.name} of {self.owner}'s put failed.'",extra={"sim_time":self._env.now})
            return None

    def _do_get(self, event: ModifiedContainerGet) -> Optional[bool]:
        if self._level >= event.amount:
            self._level -= event.amount
            event.succeed()
            evnt_logger.info(f"\t {self.name} of {self.owner}'s level decreased by {event.amount} {self.resource}'",extra={"sim_time":self._env.now})
            return True
        else:
            evnt_logger.info(f"\t {self.name} of {self.owner}'s put failed.'",extra={"sim_time":self._env.now})
            return None