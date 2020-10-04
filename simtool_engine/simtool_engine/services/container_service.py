from simtool_engine.models.simtool_containers_model import BasicContainer, BasicContainerBlueprint

class DSContainerServiceMixin:

    def get_blueprint(self, uid):
        if not uid in self.blueprints:
            raise ValueError(f"Blueprint {uid} does not exist.")
        else:
            bp = self.blueprints[uid]
            return {
                "name" : bp.name,
                "uid" : uid,
                "init" : bp.init,
                "capacity" : bp.capacity,
                "resource" : bp.resource
            }

    def create_blueprint(self, inputs):
        bp = BasicContainerBlueprint(**inputs)
        self.blueprints[bp.uid] = bp
        return f"Blueprint {bp.name}:{bp.uid} created."

    def update_blueprint(self, uid, inputs):
        if not uid in self.blueprints:
            raise ValueError(f"Blueprint {uid} does not exist.")
        else:
            self.blueprints[uid].update(inputs)
        return f"Blueprint with uid {uid} has been updated."

    def delete_blueprint(self, uid):
        if not uid in self.blueprints:
            raise ValueError(f"Blueprint {uid} does not exist.")
        else:
            bp = self.blueprints[uid]
            del self.blueprints[uid]
            return f"Blueprint {bp.name}:{uid} has been deleted."

    def get_container(self, owner_uid, name):
        self.does_node_exist(owner_uid)
        if not name in self.nodes[owner_uid].containers:
            raise ValueError(f"Node {owner_uid} does not have a container {name}")
        else:
            return self.nodes[owner_uid].containers[name]

    #Method for adding a blueprint to a Starting Node. The blueprint will be used to
    #create containers for entities.
    def add_blueprint(self, node_uid, blueprint):
        self.does_node_exist(node_uid)
        if not blueprint in self.blueprints:
            raise ValueError(f"Blueprint {blueprint} does not exist.")
        node = self.nodes[node_uid]
        bp = self.blueprints[blueprint]
        node.add_blueprint(bp)
        return f"Blueprint {bp.name}:{blueprint} has been added to {node.name}:{node_uid}"

    #Method for creating a container directly without a blueprint and assigning to a station node.
    def create_container(self, owner_uid, inputs):
        self.does_node_exist(owner_uid)
        node = self.nodes[owner_uid]
        con = node.add_container(inputs)
        return f"Container {con.name} added to {self.nodes[owner_uid].name}:{owner_uid}"

    #Method for creating a container using an existing blueprint and assigning to a station node.
    def create_container_bp(self, owner_uid, bp):
        self.does_node_exist(owner_uid)
        if not bp in self.blueprints:
            raise ValueError(f"Blueprint {owner_uid} does not exist.")
        else:
            bp = self.blueprints[bp]
            node = self.nodes[owner_uid]
            con = node.add_container_bp(bp)
            return f"Container {con.name} based on Blueprint {bp.name} added to {self.nodes[owner_uid].name}:{owner_uid}"

    def update_container(self, owner_uid, name, inputs):
        self.does_node_exist(owner_uid)
        if not name in self.nodes[owner_uid].containers:
            raise ValueError(f"Node {owner_uid} does not have a container {name}")
        else:
            con = self.nodes[owner_uid][name]
            con.update(inputs)
        return f"Container {con.name} of {self.nodes[owner_uid].name}:{owner_uid} has been updated."

    def delete_container(self, owner_uid, name):
        self.does_node_exist(owner_uid)
        if not name in self.nodes[owner_uid].containers:
            raise ValueError(f"Node {owner_uid} does not have a container {name}")
        else:
            con = self.nodes[owner_uid][name]
            del self.nodes[owner_uid][name]
        return f"Container {con.name} of {self.nodes[owner_uid].name}:{owner_uid} has been deleted."