import simpy
import logging

evnt_logger = logging.getLogger('evnt_logger')

class BasicFlowEntity(object):
    op_map = {
        "GIVE" : "Given",
        "TAKE" : "Taken",
        "ADD" : "Added",
        "SUB" : "Subtracted",
        "MULT" : "Multiplied"
    }
    
    def __init__(self, env:simpy.Environment,start_time,name:str, start,currentLoc, resource_behaviors:dict={}):
        self.env = env
        self.start = start
        self.name = name
        self.currentLoc = currentLoc
        self.containers = {}
        self.resource_behaviors = resource_behaviors
        self.travel_path = []
        self.start_time = start_time
        self.end_time = None
        self.count = 0
        
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
                        evnt_logger.info(f"\t {self.currentLoc} has given {ac.val} {encon.resource} from {nodecon} to {encon}",extra={"sim_time":self.env.now})
                        yield encon.con.put(ac.val)
                        yield nodecon.con.get(ac.val)
                    elif ac.op == "TAKE":
                        evnt_logger.info(f"\t {self.currentLoc} has taken {ac.val} {encon.resource} from {encon} to {nodecon}",extra={"sim_time":self.env.now})
                        yield encon.con.get(ac.val)
                        yield nodecon.con.put(ac.val)
                    elif ac.op == "ADD":
                        evnt_logger.info(f"\t {self.currentLoc} has added {ac.val} {encon.resource} to {encon}",extra={"sim_time":self.env.now})
                        yield encon.con.put(ac.val)
                    elif ac.op == "SUB":
                        evnt_logger.info(f"\t {self.currentLoc} has added {ac.val} {encon.resource} to {encon}",extra={"sim_time":self.env.now})
                        yield encon.con.get(ac.val)
                    """ elif ac.op == "MULT":
                        yield encon.con.put(encon.con.level*ac.val) """
                

    def resources_snapshot(self):
        return {k:v.summary() for (k,v) in self.containers.items()}


    def run(self):
        self.travel_path.append(str(self.start))
        #If more ending point types added, may need to modify check.
        while not self.currentLoc.__class__.__name__ == "EndingPoint":
            
            #Wait in line until the component is available.
            with self.currentLoc.resource.request() as req:
                self.count += 1
                self.travel_path.append(str(self.currentLoc))
                #Tell environment I'm waiting.
                yield req
                (evnt, (next_dir, passed)) = self.currentLoc.interact(self)
                self.env.process(self.act(passed))
                yield evnt
                self.currentLoc.entities.add(self)
                self.currentLoc = next_dir

        #if not self.start.name in self.currentLoc.entities:
        #    self.currentLoc.entities[self.start.name] = []
        #self.currentLoc.entities[self.start.name].append(self)
        self.currentLoc.entities.add(self)
        self.travel_path.append(str(self.currentLoc))
        self.end_time = self.env.now
        evnt_logger.info(f'\t {self} has reached endpoint {self.currentLoc}.',extra={'sim_time':self.env.now})

    def summary(self):
        containers = {}
        for name,con in self.containers.items():
            containers[con.name] = con.summary()
        return {
            "name" : self.name,
            "number of nodes visited" : self.count,
            "containers" : containers,
            "travelled path" : self.travel_path
        }
 