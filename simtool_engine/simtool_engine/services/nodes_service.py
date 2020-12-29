from simtool_engine.models.simtool_nodes_model import StartingPoint, BasicComponent, EndingPoint, GlobalNode

class DSNodesServiceMixin:
	def does_node_exist(self, uid):
		if not uid in self.nodes:
			raise ValueError(f"Node with uid {uid} not present in process.")

	def get_node(self, uid):
		self.does_node_exist(uid)
		node = self.nodes[uid]
		if isinstance(node, StartingPoint):
			return {
				"name" : node.name,
				"uid" : uid,
				"entity_name" : node.entity_name,
				"generation" : node.generation,
				"limit" : node.limit
			}
		elif isinstance(node, BasicComponent):
			return {
				"name" : node.name,
				"uid" : uid,
				"capacity" : node.capacity,
				"interaction_time" : node.interaction_time
			}
		elif isinstance(node, EndingPoint):
			return {
				"name" : node.name,
				"uid" : uid
			}
		elif isinstance(node, GlobalNode):
			return {
				"name" : node.name,
				"uid" : node.uid,
				"containers" : node.containers.keys()
			}

	def create_node(self, tipe, inputs):
		if tipe == self.START:
			tipe = "Starting Point"
			node = StartingPoint(self.env, **inputs)
			self.starts[node.uid] = node
		elif tipe == self.STATION:
			tipe = "Station"
			node = BasicComponent(self.env, **inputs)
			self.stations[node.uid] = node
		elif tipe == self.END:
			tipe = "Ending Point"
			node = EndingPoint(self.env, **inputs)
			self.ends[node.uid] = node
		elif tipe == self.GLOBAL:
			tipe = "Global Node"
			node = GlobalNode(self.env,**inputs)
			self.globals[node.uid] = node
		
		self.nodes[node.uid] = node
		return f"{tipe} {node.name}:{node.uid} has been added to the process."

	def update_node(self, uid, inputs):
		self.does_node_exist(uid)
		node = self.nodes[uid]
		node.update(inputs)
		return f"Node with uid {uid} has been updated."

	def delete_node(self, uid, tipe):
		#Remove node from node dictionaries
		self.does_node_exist(uid)
		if tipe == self.START:
			del self.starts[uid]
			tipe = "Starting Point"
		elif tipe == self.STATION:
			tipe = "Station"
			del self.stations[uid]
		elif tipe == self.END:
			tipe = "Ending Point"
			del self.ends[uid]
		elif tipe == self.GLOBAL:
			tipe = "Global Node"
			del self.globals[uid]
		node = self.nodes[uid]
		del self.nodes[uid]

		#Remove node from directed_to's and logic
		if tipe in ["StartingPoint", "Station", "EndingPoint"]:
			for n in self.nodes:
				if node in n.directed_to:
					n.remove_directed_to(node.uid)
					n.logic.removePath(node.uid)
		
		return f"{tipe} {node.name}:{node.uid} has been removed from the process."

	def get_directed_to(self, frum):
		self.does_node_exist(frum)
		return self.nodes[frum].get_directed_to()

	def set_directed_to(self, frum, to):
		self.does_node_exist(frum)
		self.does_node_exist(to)
		self.nodes[frum].set_directed_to(self.nodes[to])
		return f"Node {self.nodes[frum]}:{frum} directed to {self.nodes[to]}:{to}"
	
	def remove_directed_to(self, frum, to):
		self.does_node_exist(frum)
		self.does_node_exist(to)
		self.nodes[frum].remove_directed_to(self.nodes[to])
		return f"Node {self.nodes[frum]}:{frum} no longer directed to {self.nodes[to]}:{to}"