""" simtool_datastore.py contains the DataStore class, which provides
a functions for creating and managing simulations in a method similar
to the HTTP requests.

Written by Aviv Elazar-Mittelman, July 2020
"""

import simpy
import collections
import numpy as np
import io
import math
import sys
import logging
import pprint
from simtool_engine.models.simtool_nodes import StartingPoint, BasicComponent, EndingPoint
from simtool_engine.models.simtool_logic import Logic
from simtool_engine.models.simtool_containers import BasicContainer, BasicContainerBlueprint
from simtool_engine.models.simtool_logging import SimToolLogging

class DataStore():
	""" DataStore is a simulation manager that can handle a single simulation per
	DataStore object. The methods take String inputs to be functionally equivalent
	to the HTTP requests made by the GUI. DataStore lets you create, run, and view
	results of simulations without touching any of the inner classes.

	Many of the functions take a parameter <inputs>. **inputs in a function call
	means that Python is expecting a dict, and will attempt to unpack it to use
	as parameters. Please refer to the appropriate files to find the correct
	parameters (e.g. simtool_nodes for functions dealing with nodes.)

	It is reccomended to attempt an example using the internal classes directly
	before playing with DataStore to gain an understanding of the different concepts.
	"""

	#enums representing node types. Values are arbitrary.
	START = 1000
	STATION = 2000
	END = 3000
	def __init__(self, start=0):
		self.nodes = {}
		self.starts = {}
		self.stations = {}
		self.ends = {}
		self.blueprints = {}
		self.last_run = None
		self.runs = []
		self.start_time = 0
		self.end_time = None
		self.env = simpy.Environment(start) #Create env with given start time.

		#Set up logging.

		## NOTE: at the moment, loggers are hardcoded, so attempts to run multiple
		## 		 simulations at the same time will lead to mixed output. To resolve this,
		## 	   	 will need to dynamically create loggers and pass logger names to inner
		## 		 classes.


		self.data_logger = SimToolLogging.getDataLog()
		self.evnt_logger = SimToolLogging.getEventLog()
		self.strStream = SimToolLogging.getStrStream()

	

	#Replace environment with a new one in all objects.
	def new_env(self, start = 0):
		self.env = simpy.Environment(start)
		self.end_time = None
		self.start_time = None
		for _, node in self.nodes.items():
			node.update({'env':self.env})
			node.reset()

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
			self.stations[node.uid] = node
		elif tipe == DataStore.END:
			tipe = "Ending Point"
			node = EndingPoint(self.env, **inputs)
			self.ends[node.uid] = node
		
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
		if tipe == DataStore.START:
			del self.starts[uid]
			tipe = "Starting Point"
		elif tipe == DataStore.STATION:
			tipe = "Station"
			del self.stations[uid]
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

	#Create/Replace the default logic object with the specified split policy.
	#Currently supporting "RAND" and "ALPHA_SEQ".
	def create_logic(self, uid, opt):
		self.does_node_exist(uid)
		node = self.nodes[uid]
		node.create_logic(opt)
		return f"Logic for node {node.name}:{uid} has been created with option: {opt}"

	#Replace with new logic that just chooses paths randomly.
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

	#By default, condition groups are set to AND, meaning all conditions must be True to execute associated
	#actions. This function flips the state between AND and OR, where at least one condition must be True.
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

	#Each ConditionGroup can have one action group. All actions are executed sequentially if the
	#ConditionGroup evaluates to True.
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
	
	#Get Summary info about the last run. Finds most common path traversed, in general, and by end node.
	def summary(self):
		""" if self.end_time == None:
			raise ValueError("Please run the simulation at least once.") """
		start_nodes = {k:v.summary() for k,v in self.starts.items()}
		station_nodes = {k:v.summary() for k,v in self.stations.items()}
		end_nodes = {k:v.summary() for k,v in self.ends.items()}
		avgbystart = {k:np.mean([e.end_time-e.start_time for e in v.entities if e.end_time != None]) for k,v in self.starts.items()}
		most_common_path_to_end = collections.Counter(tuple(e.summary()['travelled path']) for name,start in self.starts.items() for e in start.entities).most_common(1)
		if len(most_common_path_to_end) == 0:
			most_common_path_to_end = None
		else:
			most_common_path_to_end = most_common_path_to_end[0]
		to_ret = {
			"run_info" : {
				"sim_start_time" : self.start_time,
				"sim_end_time" : self.end_time,
				"num_spawned_entities" : sum([1 for name,start in self.starts.items() for e in start.entities]),
				"num_completed_entities" : sum([1 for name,end in self.ends.items() for e in end.entities]),
				"avg_entity_duration_by_start" : avgbystart,
				"most_common_path_to_end" : most_common_path_to_end
			},
			"Starting Nodes" : start_nodes,
			"Station Nodes" : station_nodes,
			"End Nodes" : end_nodes
		}
		return to_ret

	#The serialize method returns a JSON object with info about nodes, containers, blueprints, and logic
	#In order to allow for saving a process to a file.
	def serialize(self):
		return {
			"starts" : {x.uid:x.serialize() for _,x in self.starts.items()},
			"stations" : {x.uid:x.serialize() for _,x in self.stations.items()},
			"ends" : {x.uid:x.serialize() for _,x in self.ends.items()},
			"blueprints" : {uid:blueprint.serialize() for uid,blueprint in self.blueprints.items()}
		}

	def deserialize(self, save):
		#First, clean the system.
		self.clean()
		starts = save["starts"]
		stations = save["stations"]
		ends = save["ends"]
		nodes = dict(starts)
		nodes.update(stations)
		nodes.update(ends)
		blueprints = save["blueprints"]

		#Create the base nodes.
		for uid,node in starts.items():
			inputs = {
				"name" : node["name"],
				"entity_name" : node["entity_name"],
				"limit" : node["limit"],
				"generation" : node["generation"],
				"uid" : node["uid"]
			}
			self.create_node(DataStore.START,inputs)
		
		for uid,node in stations.items():
			inputs = {
				"name" : node["name"],
				"capacity" : node["capacity"],
				"time_func" : node["time_func"],
				"uid" : node["uid"]
			}
			self.create_node(DataStore.STATION,inputs)

		for uid,node in ends.items():
			inputs = {
				"name" : node["name"],
				"uid" : node["uid"]
			}
			self.create_node(DataStore.END,inputs)

		#Now, direct nodes to proper places.

		for uid, node in nodes.items():
			if "dirto" in node:
				for to in node["dirto"]:
					self.set_directed_to(uid,to)

		#Create blueprints:

		for uid,bp in blueprints.items():
			inputs = {
				"capacity" : bp["capacity"],
				"init" : bp["init"],
				"name" : bp["name"],
				"resource" : bp["resource"],
				"uid" : bp["uid"]
			}
			self.create_blueprint(inputs)

		#Create containers based on blueprints.

		for uid,node in starts.items():
			for bp in node["blueprints"]:
				self.add_blueprint(uid,bp)
		
		for uid,node in stations.items():
			for bp in node["blueprints"]:
				self.create_container_bp(uid,bp)

		#Create containers

		for uid, node in stations.items():
			for con in node["containers"]:
				self.create_container(uid,con)

		#Now load logic.

		for uid, node in starts.items():
			self.create_logic(uid,node["logic"]["split_policy"])

		for uid, node in stations.items():
			self.create_logic(uid,node["logic"]["split_policy"])

		for uid, node in stations.items():
			if len(node["logic"]["cond_groups"]) > 0:
				for name, group in node["logic"]["cond_groups"].items():
					pp = group["pass_paths"]
					fp = group["fail_paths"]
					self.create_condition_group(uid,name,pp,fp)

					for cond_name, condition in group["conditions"].items():
						self.add_condition(uid,name,condition)
					
					if not group["action_group"] == None:
						self.create_action_group(uid,name)
						for act_name, action in group["action_group"]["actions"].items():
							self.add_action(uid,name,action)


	#The run method is what starts the simulation. It takes an optional until parameter that tells when
	#to stop the simulation. If all events finish before the given time, the simulation will end
	#immediately.
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
			self.end_time = self.env.now
			if (self.env.peek() != math.inf):
				self.data_logger.info(f"Simulation stopped at {self.end_time}. Further events have not been processed.")
			else:
				self.data_logger.info(f"Simulation stopped at {self.end_time}. All scheduled events been processed.")
			self.last_run = self.strStream.getvalue().split('\n')
			self.runs.append(self.last_run)
			return (self.last_run, self.summary())

	def step2(self, amount = 1):
		do = True
		while do:
			#print(self.env.peek())
			if self.env.peek() == math.inf:
				return "No more events"
			else :
				#Store current stream location.
				loc = self.strStream.tell()
				self.env.step()
				self.strStream.seek(loc)
				new_output = self.strStream.read().split('\n')[:-1]
				if not all('' == s for s in new_output):
					do = False
		return [new_output, self.summary()]

	#Step through n events and return summaries after each step.
	def step(self, amount = 1):
		output = []
		for _ in range(amount):
			do = True
			while do:
				if self.env.peek() == math.inf:
					return ""
				else:
					loc = self.strStream.tell()
					self.env.step()
					self.strStream.seek(loc)
					curr = self.strStream.read().split('\n')[:-1]
					if not all('' == s for s in curr):
						do = False
			output.append(curr[0])
		output.append(self.summary())
		return output


	def reset(self, start = 0):
		self.new_env(start)
		return f"Simulation reset. Time is now {self.env.now}"

	def clean(self):
		self.__init__()
		return f"Process has been deleted. Time is now {self.env.now}"