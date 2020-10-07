import simpy

#Meant to replace String Resources. Still being implemented.
class Resource:

    def __init__(self, env, name):
        self.env = env
        self.name = name

class ChargedResource(Resource):
    """ Represents a Resource that costs another resource to use. For example,
    An hourly employee needs to be paid, so the employee would be the resorce
    """
    def __init__(self, env, name, glob_node, cost, time):
        super().__init__(env, name)
        self.glob_node = glob_node
        self.cost = cost
        self.time = time
        self.active = False

    def activate(self):
        self.active = True

    def deactivate(self):
        self.active = False

    def run(self):
        yield self.env.timeout(self.time)

