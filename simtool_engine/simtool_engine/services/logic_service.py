class DSLogicServiceMixin:
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
	def create_condition_group(self, node_uid, name, pass_paths, fail_paths, AND, action_order_random):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if node.logic.split_policy in ["RAND", "ALPHA_SEQ"]:
			raise ValueError(f"{node.name}:{node_uid} does not have a BOOL split policy. Cannot add Condition Group.")
		else:

			pass_paths = [self.nodes[x] for x in pass_paths]
			fail_paths = [self.nodes[x] for x in fail_paths]
			con_group = node.logic.create_condition_group(name, pass_paths, fail_paths, AND, action_order_random)
			return f"{con_group.name} added to node {node.name}:{node_uid}"

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

	def get_action_keys(self, node_uid, cond_group):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		elif len(node.logic.condition_groups[cond_group].actions) == 0:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have any actions")
		else:
			return node.logic.condition_groups[cond_group].actions.keys()
	
	def delete_actions(self, node_uid, cond_group):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		else:
			node.logic.condition_groups[cond_group].delete_actions()
			return f"Actions deleted for Condition Group {cond_group} of {node.name}:{node_uid}"

	def get_action(self, node_uid, cond_group, name):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		elif len(node.logic.condition_groups[cond_group].actions) == 0:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have any actions.")
		elif not name in node.logic.condition_groups[cond_group].actions:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have an action {name}")
		else:
			action = node.logic.condition_groups[cond_group].actions[name]
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
		else:
			action = node.logic.condition_groups[cond_group].add_action(**inputs)
			return f"Action {action.name} has been added to Condition Group {cond_group} of {node.name}:{node_uid}"
	
	def remove_action(self, node_uid, cond_group, name):
		self.does_node_exist(node_uid)
		node = self.nodes[node_uid]
		if not cond_group in node.logic.condition_groups:
			raise ValueError(f"{node.name}:{node_uid} does not have a Condition Group {cond_group}")
		elif len(node.logic.condition_groups[cond_group].actions) == 0:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have any actions.")
		elif not name in node.logic.condition_groups[cond_group].actions:
			raise ValueError(f"Condition Group {cond_group} of {node.name}:{node_uid} does not have an action {name}")
		else:
			action = node.logic.condition_groups[cond_group].actions[name]
			node.logic.condition_groups[cond_group].remove_action(name)
			return f"Action {action.name} has been removed from Condition Group {cond_group} of {node.name}:{node_uid}"