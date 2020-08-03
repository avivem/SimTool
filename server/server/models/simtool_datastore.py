import simpy
import collections
import numpy as np
import io
import sys
import logging
from .simtool_nodes import StartingPoint, BasicComponent, EndingPoint
from .simtool_logic import Logic
from .simtool_containers import BasicContainer, BasicContainerBlueprint

class DataStore():
	START = 1000
	STATION = 2000
	END = 3000
	def __init__(self, start=0):
		self.nodes = {}
		self.starts = {}
		self.basics = {}
		self.ends = {}
		self.blueprints = {}
		self.last_run = None
		self.runs = []
		self.start_time = 0
		self.end_time = None
		self.env = simpy.Environment(start)
		""" self.save = {
			"nodes" : {},
			"containers" : {},
			"blueprints" : {},
			"dirto" : {},
			"logic" : {},
			"last_run" : None
		} """

		#Set up logging.
		self.strStream = io.StringIO()
		self.data_logger = logging.getLogger("data_logger")
		self.evnt_logger = logging.getLogger("evnt_logger")
		self.data_logger.setLevel(logging.INFO)
		self.evnt_logger.setLevel(logging.INFO)

		self.data_formatter = logging.Formatter('<%(asctime)s>:: %(message)s')
		self.evnt_formatter = logging.Formatter('[%(sim_time)s]:: %(message)s')

		self.data_out_handler = logging.StreamHandler(sys.stdout)
		self.data_str_handler = logging.StreamHandler(self.strStream)

		self.evnt_out_handler = logging.StreamHandler(sys.stdout)
		self.evnt_str_handler = logging.StreamHandler(self.strStream)

		self.data_out_handler.setLevel(logging.INFO)
		self.data_str_handler.setLevel(logging.INFO)

		self.evnt_out_handler.setLevel(logging.INFO)
		self.evnt_str_handler.setLevel(logging.INFO)

		self.data_out_handler.setFormatter(self.data_formatter)
		self.data_str_handler.setFormatter(self.data_formatter)

		self.evnt_out_handler.setFormatter(self.evnt_formatter)
		self.evnt_str_handler.setFormatter(self.evnt_formatter)

		self.data_logger.addHandler(self.data_out_handler)
		self.data_logger.addHandler(self.data_str_handler)

		self.evnt_logger.addHandler(self.evnt_out_handler)
		self.evnt_logger.addHandler(self.evnt_str_handler)

	def newEnv(self, start = 0):
		self.env = simpy.Environment(start)
		for node in self.nodes:
			node.update({'env':self.env})
			node.reset()

	def does_node_exist(self, uid):
		if not uid in self.nodes:
			raise ValueError(f"Node with uid {uid} not present in process.")

	def getNode(self, uid):
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
				"time_func" : node.time_func
			}
		else:
			return {
				"name" : node.name,
				"uid" : uid
			}

	def create_node(self, tipe, inputs):
		if tipe == DataStore.START:
			tipe = "Starting Point"
			node = StartingPoint(self.env, **inputs)
			self.starts[node.uid] = node
		elif tipe == DataStore.STATION:
			tipe = "Station"
			node = BasicComponent(self.env, **inputs)
			self.basics[node.uid] = node
		elif tipe == DataStore.END:
			tipe = "Ending Point"
			node = EndingPoint(self.env, **inputs)
			self.ends[node.uid] = node
		
		self.nodes[node.uid] = node
		return f"{tipe} {node.name}:{node.uid} has been added to the process."

	def updateNode(self, uid, inputs):
		self.does_node_exist(uid)
		node = self.nodes[uid]
		node.update(inputs)
		return f"Node with uid {uid} has been updated."

	def deleteNode(self, uid, tipe):
		#Remove node from node dictionaries
		self.does_node_exist(uid)
		if tipe == DataStore.START:
			del self.starts[uid]
			tipe = "Starting Point"
		elif tipe == DataStore.STATION:
			tipe = "Station"
			del self.basics[uid]
		else:
			tipe = "Ending Point"
			del self.ends[uid]
		node = self.nodes[uid]
		del self.nodes[uid]

		#Remove node from directed_to's and logic
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

	def add_blueprint(self, node_uid, blueprint):
		self.does_node_exist(node_uid)
		if not blueprint in self.blueprints:
			raise ValueError(f"Blueprint {blueprint} does not exist.")
		node = self.nodes[node_uid]
		node.add_blueprint(self.blueprints[blueprint])

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
	
	def create_container(self, owner_uid, inputs):
		self.does_node_exist(owner_uid)
		node = self.nodes[owner_uid]
		con = node.add_container(inputs)
		return f"Container {con.name} added to {self.nodes[owner_uid].name}:{owner_uid}"

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

	def create_logic(self, uid, opt):
		self.does_node_exist(uid)
		node = self.nodes[uid]
		node.create_logic(opt)
		return f"Logic for node {node.name}:{uid} has been created with option: {opt}"

	def delete_logic(self, uid):
		self.does_node_exist(uid)
		node = self.nodes[uid]
		node.create_logic("RAND")

	#To update a condition group, act as if the old one doesn't exist and create a new one.
	def create_condition_group(self, node_uid, name, pass_paths, fail_paths):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if node.logic.split_policy in ["RAND", "ALPHA_SEQ"]:
			raise ValueError(f"{node.name}:{node_uid} does not have a BOOL split policy. Cannot add Condition Group.")
		else:

			pass_paths = [self.nodes[x] for x in pass_paths]
			fail_paths = [self.nodes[x] for x in fail_paths]
			con = node.logic.create_condition_group(name, pass_paths, fail_paths)
			return f"{con.name} added to node {node.name}:{node_uid}"

	def delete_condition_group(self, node_uid, name):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if node.logic.split_policy in ["RAND", "ALPHA_SEQ"]:
			raise ValueError(f"{node.name}:{node_uid} does not have a BOOL split policy. Does not have Condition Groups.")
		node.delete_condition_group(name)
		return f"Condition Group {name} has been removed from {node.name}:{node_uid}"

	def flip_condition_group_cond_type(self, node_uid, name):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not name in self.nodes[node_uid].logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {name}")
		else:
			self.nodes[node_uid].logic.condition_groups[name].flip_type()
			setting = "AND" if self.nodes[node_uid].logic.condition_groups[name].AND else "OR"
			return f"Condition Group {name} of {self.nodes[node_uid].name}:{node_uid} has been set to {setting}."

	def get_condition(self, node_uid, cond_group, name):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in self.nodes[node_uid].logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		elif not name in self.nodes[node_uid].logic.condition_groups[cond_group]:
			raise ValueError(f"Condition Group {name} of {node.name}:{node_uid} does not have a condition {name}")
		else:
			cond = self.nodes[node_uid].logic.condition_groups[cond_group][name]
			return {
				"name" : name,
				"cond_group" : cond_group,
				"owner" : node_uid,
				"encon_name" : cond.encon_name,
				"nodecon_name" : cond.nodecon_name,
				"op" : cond.op,
				"val" : cond.val
			}

	def add_condition(self, node_uid, cond_group, inputs):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in self.nodes[node_uid].logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		else:
			cond = node.logic.condition_groups[cond_group].add_condition(**inputs)
			return f"Condition {cond.name} added to Condition Group {cond_group} of {node.name}:{node_uid}."
		
	def remove_condition(self, node_uid, cond_group, name):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in self.nodes[node_uid].logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		else:
			cond = self.nodes[node_uid].logic.condition_groups[cond_group][name]
			self.nodes[node_uid].logic.condition_groups[cond_group].remove_condition(name)
			return f"Condition {cond.name} has been removed from Condition Group {cond_group} of {node.name}:{node_uid}."

	def get_action_group(self, node_uid, cond_group):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		elif node.logic.condition_groups[cond_group].action_group == None:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have an Action Group")
		else:
			return node.logic.condition_groups[cond_group].action_group.keys()

	def create_action_group(self, node_uid, cond_group):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		else:
			node.logic.condition_groups[cond_group].create_action_group()
			return f"Action Group created for Condition Group {cond_group} of {node.name}:{node_uid}"
	
	def delete_action_group(self, node_uid, cond_group):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		else:
			node.logic.condition_groups[cond_group].delete_action_group()
			return f"Action Group deleted for Condition Group {cond_group} of {node.name}:{node_uid}"

	def get_action(self, node_uid, cond_group, name):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		elif node.logic.condition_groups[cond_group].action_group == None:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have an Action Group")
		elif not name in node.logic.condition_groups[cond_group].action_group.actions:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have an action {name}")
		else:
			action = node.logic.condition_groups[cond_group].action_group.actions[name]
			return {
				"name" : name,
				"owner" : node_uid,
				"cond_group" : cond_group,
				"encon_name" : action.encon_name,
				"nodecon_name" : action.nodecon_name,
				"op" : action.op,
				"val" : action.val
			}
	
	def add_action(self, node_uid, cond_group, inputs):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		elif node.logic.condition_groups[cond_group].action_group == None:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have an Action Group")
		else:
			action = node.logic.condition_groups[cond_group].action_group.add_action(**inputs)
			return f"Action {action.name} has been added to Condition Group {cond_group} of {node.name}:{node_uid}"
	
	def remove_action(self, node_uid, cond_group, name):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		elif node.logic.condition_groups[cond_group].action_group == None:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have an Action Group")
		elif not name in node.logic.condition_groups[cond_group].action_group.actions:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have an action {name}")
		else:
			action = node.logic.condition_groups[cond_group].action_group.actions[name]
			node.logic.condition_groups[cond_group].action_group.remove_action(name)
			return f"Action {action.name} has been removed from Condition Group {cond_group} of {node.name}:{node_uid}"\
	
	def summary(self):
		start_nodes = {k:v.summary() for k,v in self.starts.items()}
		station_nodes = {k:v.summary() for k,v in self.basics.items()}
		end_nodes = {k:v.summary() for k,v in self.ends.items()}
		avgbystart = {k:np.mean([e.end_time-e.start_time for e in v.entities if e.end_time != None]) for k,v in self.starts.items()}
		return {
			"run_info" : {
				"sim_start_time" : self.start_time,
				"sim_end_time" : self.end_time,
				"num_spawned_entities" : sum([1 for name,start in self.starts.items() for e in start.entities]),
				"num_completed_entities" : sum([1 for name,end in self.ends.items() for e in end.entities]),
				"avg_entity_duration_by_start" : avgbystart,
				"most_common_path" : collections.Counter(tuple(e.summary()['travelled path']) for name,start in self.starts.items() for e in start.entities).most_common(1)[0]
			},
			"Starting Nodes" : start_nodes,
			"Station Nodes" : station_nodes,
			"End Nodes" : end_nodes
		}

	""" def save_state(self):
		blueprints = {}
		starts = {}
		basics = {}
		ends = {}
		dirto = {}
		for name, s in self.starts:
			dirto[s.uid] = s.get_directed_to()
			save = {
				"name" : s.name,
				"entity_name" : s.entity_name,
				"generation" : s.generation,
				"limit" : s.limit,
				"uid" : s.uid,
				"blueprints" : {}
			} """

	def run(self, until=20000):
		if len(self.starts) == 0:
			raise ValueError("Please create at least one starting node.")
		elif len(self.ends) == 0:
			raise ValueError("Please create at least one ending node.")
		else:
			#[self.env.process(self.nodes[x]) for x in self.starts]
			self.data_logger.info(f"Running simulation until {until}")
			self.start_time = self.env.now
			self.env.run(until)
			self.last_run = self.strStream.getvalue().split('\n')
			self.runs.append(self.last_run)
			return (self.last_run, self.summary())
			