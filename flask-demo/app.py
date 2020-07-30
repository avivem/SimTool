from flask import Flask, render_template,json , jsonify, request, redirect, url_for, abort, session
from flask_cors import CORS, cross_origin
import simpy
import logic
from logic import Node, StartingPoint, BasicFlowEntity, BasicComponent, EndingPoint, BasicContainer, BasicContainerBlueprint, Logic, run as r
import sys
import io
import uuid
import pprint
import numpy as np
import collections
from waitress import serve


###If you are running locally and wish to see output in terminal, comment this out.
""" if __name__ != "__main__":
	old_stdout = sys.stdout
	new_stdout = io.StringIO()
	sys.stdout = new_stdout """

app = Flask(__name__)
app.secret_key = "REPLACE_SECRET_KEY_LATER"
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config['CORS_HEADERS'] = 'Content-Type'


class DataStore():
	nodes = {}
	save = {
		"nodes" : {},
		"containers" : {},
		"blueprints" : {},
		"dirto" : {},
		"logic" : {},
		"last_run" : None
	}
	starts = {}
	basics = {}
	ends = {}
	containers = {}
	blueprints = {}
	last_run = None
	start_time = 0
	env = simpy.Environment()

	def summary(self):
		starts_s = {k:v.summary() for k,v in app.datastore.starts.items()}
		#pprint.pprint(starts_s)
		basics_s = {k:v.summary() for k,v in app.datastore.basics.items()}
		#pprint.pprint(basics_s)
		ends_s = {k:v.summary() for k,v in app.datastore.ends.items()}
		#pprint.pprint(ends_s)
		avgbystart = {k:np.mean([e.end_time-e.start_time for e in v.entities if e.end_time != None]) for k,v in app.datastore.starts.items()}
		return {
			"run_info" : {
				"sim_start_time" : app.datastore.start_time,
				"sim_end_time" : app.datastore.env.now,
				"num_spawned_entities" : sum([1 for name,start in app.datastore.starts.items() for e in start.entities]),
				"num_completed_entities" : sum([1 for name,end in app.datastore.ends.items() for e in end.entities]),
				"avg_entity_duration_by_start" : avgbystart,
				"most_common_path" : collections.Counter(tuple(e.summary()['travelled path']) for name,start in app.datastore.starts.items() for e in start.entities).most_common(1)[0]
			},
			"Starting Nodes" : starts_s,
			"Station Nodes" : basics_s,
			"End Nodes" : ends_s
		}
app.datastore = DataStore()

""" @app.route('/api/new/')
def new():
	global data
	session["data"] = DataStore()
	data = session["data"]
	return f"New Session created" """

#TODO: update Store to handle loading container info.
@app.route('/api/store/', methods = ["GET", "POST"])
def store():
	if request.method == "GET":
		return app.datastore.save
	elif all(elem in request.json for elem in app.datastore.save):
			app.datastore.save = request.json

			for id in app.datastore.save["nodes"]:
				node = dict(app.datastore.save["nodes"][id])
				tipe = node['type']
				tipe_func = {"START": StartingPoint, "BASIC": BasicComponent, "END": EndingPoint}[tipe]
				tipe_dict = {"START": app.datastore.starts, "BASIC": app.datastore.basics, "END": app.datastore.ends}[tipe]
				del node["type"]
				node["env"] = app.datastore.env
				n = tipe_func(**node)
				app.datastore.nodes[n.uid] = n
				tipe_dict[n.uid] = n
			for entry in app.datastore.save["dirto"].keys():
				app.datastore.nodes[entry].set_directed_to(app.datastore.save["dirto"][entry])

	else:
		abort(400)

#Handles creation of container blueprints.
@app.route('/api/container/blueprint/', methods=['GET','POST', 'PUT', 'DELETE'])
def container_spec():
	if request.method == "GET":
		return app.datastore.save["blueprints"][request.json["uid"]]
	elif request.method == "POST":	
		inputs = dict(request.json)
		blueprint = BasicContainerBlueprint(**inputs)
		app.datastore.save["blueprints"][request.json['uid']] = inputs
		app.datastore.blueprints[request.json['uid']] = blueprint
		return f"Container Blueprint {request.json['name']}-{request.json['uid']} has been created."
	elif request.method == "PUT":
		inputs = dict(request.json)
		app.datastore.save["blueprints"][inputs["uid"]].update(inputs)
		app.datastore.blueprints[inputs["uid"]].update(inputs)
		return f"Container Blueprint {request.json['name']}-{request.json['uid']} has been updated."
	else:
		del app.datastore.save["blueprints"][request.json["uid"]]
		del app.datastore.blueprints[request.json["uid"]]
		return f"Container Blueprint {request.json['name']}-{request.json['uid']} has been deleted."

#Handles adding a new container to a node. TODO: add functionality to remove containers / update.
@app.route('/api/node/container/', methods=['PUT', 'DELETE', 'GET'])
def container():
	if request.method == "PUT":
		blueprint = request.json['blueprint']
		if not blueprint in app.datastore.save["blueprints"]:
			abort(404, f"Container Blueprint {blueprint} does not exist.")
		bp = app.datastore.blueprints[blueprint]
		owner = app.datastore.nodes[request.json['owner']]
		if isinstance(owner, StartingPoint):
			owner.add_blueprint(bp)
		else:
			owner.add_container(bp)
		bcon = app.datastore.blueprints[blueprint].build(app.datastore.env, owner)
		if not request.json["owner"] in app.datastore.save['containers']:
			app.datastore.save['containers'][request.json["owner"]] = {}
		app.datastore.save['containers'][request.json["owner"]][bp.name] = dict(app.datastore.save['blueprints'][blueprint])
		app.datastore.save['containers'][request.json["owner"]][bp.name]['owner'] = request.json['owner']
		if not request.json["owner"] in app.datastore.containers:
			app.datastore.containers[request.json["owner"]] = {}
		app.datastore.containers[request.json["owner"]][bp.name] = bcon
		return f"Container {bcon} added to {owner}"
	elif request.method == "DELETE":
		name = request.json["name"]
		owner = app.datastore.nodes[request.json["owner"]]
		if isinstance(owner, StartingPoint):
			bp = owner.blueprints[name]
			owner.remove_blueprint(name)
		else:
			con = owner.containers[name]
			owner.remove_container(name)
		del app.datastore.save["containers"][request.json["owner"]][name]


""" #Handles assigning logic to a node (determines where to send an entity and what to do with their resources.)
@app.route('/api/node/logic', methods=['PUT'])
def node_logic():
	if request.method == "PUT":
		logic = dict(request.json)
		app.datastore.save["logic"][logic['owner']] = request.json
		node = app.datastore.nodes[logic['owner']]
		del logic['owner']

		if 'pass' in logic:
			logic['pass'] = [app.datastore.nodes[x] for x in app.datastore.nodes if x in logic['pass']]
			logic['fail'] = [app.datastore.nodes[x] for x in app.datastore.nodes if x in logic['fail']]
		node.set_node_logic_policy(logic)
		return request.json """

@app.route('/api/node/logic/', methods=["PUT", "DELETE"])
def node_logic():
	if request.method == "PUT":
		#pprint.pprint(request.json, sys.stderr)
		node = app.datastore.nodes[request.json["owner"]]
		node.create_logic(request.json["split_policy"])
		return f"Node logic created for {node}"
	else:
		#Replace logic with default of blank with random path choosing.
		node = app.datastore.nodes[request.json["owner"]]
		node.create_logic(request.json["RAND"])
		return f"Node logic replaced with default (Random) for {node}"

@app.route('/api/node/logic/condition_group/', methods=["PUT", "DELETE"])
def condition_group():
	if request.method == "PUT":
		inputs = {
			"name" : request.json["name"],
			"pass_paths" : request.json["pass_paths"],
			"fail_paths" : request.json["fail_paths"],
		}
		node = app.datastore.nodes[request.json["owner"]]
		name = request.json['name']
		if not request.json["owner"] in app.datastore.save["logic"]:
			app.datastore.save["logic"][request.json["owner"]] = {}
			app.datastore.save["logic"][request.json["owner"]]["cond_groups"] = {}
		app.datastore.save["logic"][request.json["owner"]]["cond_groups"][request.json['name']] = dict(inputs)
		inputs["pass_paths"] = [app.datastore.nodes[x] for x in inputs["pass_paths"]]
		inputs["fail_paths"] = [app.datastore.nodes[x] for x in inputs["fail_paths"]]
		node.logic.create_condition_group(**inputs)
		return f"Condition group {name} added to {node}"
	else:
		node = app.datastore.nodes[request.json["owner"]]
		name = request.json['name']
		del app.datastore.save["logic"][request.json["owner"]]["cond_groups"][name]
		node.logic.delete_condition_group(name)
		
		return f"Condition group {name} removed from {node}"

@app.route('/api/node/logic/condition_group/flip/', methods=["PUT"])
def flip_condition_group():
	node = app.datastore.nodes[request.json["owner"]]
	name = app.datastore.nodes[request.json["name"]]
	node.logic.condition_groups[name].flip_type()
	setting = "AND" if node.logic.condition_groups[name].AND else "OR"
	return f"Condition Group {name} of {node} has been set to {setting}"

@app.route('/api/node/logic/condition_group/condition/', methods=["PUT", "DELETE"])
def condition():
	if request.method == "PUT":
		node = app.datastore.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		inputs = {
			"name" : request.json["name"],
			"encon_name" : request.json["encon_name"],
			"nodecon_name" : request.json["nodecon_name"],
			"op" : request.json["op"],
			"val" : request.json["val"]
		}
		if "names" in request.json:
			inputs["names"] = request.json["names"]
		cond_group.add_condition(**inputs)
		cond_group_save = app.datastore.save["logic"][request.json["owner"]]["cond_groups"][request.json["cond_group"]]
		if not "conditions" in cond_group_save:
			cond_group_save["conditions"] = {}
		cond_group_save["conditions"][inputs["name"]] = inputs
		return f"Condition Added."
	else:
		node = app.datastore.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		cond_group.remove_condition(request.json["name"])
		del app.datastore.save["logic"][request.json["owner"]]["cond_groups"][request.json["cond_group"]]["conditions"][request.json["name"]]
		return f"Condition Removed."

@app.route('/api/node/logic/condition_group/action_group/', methods=["PUT", "DELETE"])
def action_group():
	if request.method == "PUT":
		node = app.datastore.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		cond_group.create_action_group(request.json["name"])
		cond_group_save = app.datastore.save["logic"][request.json["owner"]]["cond_groups"][request.json["cond_group"]]
		if not "action_group" in cond_group_save:
			cond_group_save["action_group"] = {}
		cond_group_save["action_group"] = {
			"name" : request.json['name'],
			"owner" : cond_group_save["name"],
			"actions" : {}
		}
		return "Action group created."
	else:
		node = app.datastore.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		cond_group_save = app.datastore.save["logic"][request.json["owner"]]["cond_groups"][request.json["cond_group"]]
		del cond_group_save["action_group"]
		cond_group.delete_action_group(request.json["name"])
		return "Action group removed."

@app.route('/api/node/logic/condition_group/action_group/action/', methods=["PUT", "DELETE"])
def action():
	if request.method == "PUT":
		node = app.datastore.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		cond_group_save = app.datastore.save["logic"][request.json["owner"]]["cond_groups"][request.json["cond_group"]]
		action_group = cond_group.action_group
		action_group_save = cond_group_save["action_group"]
		inputs = {
			"name" : request.json["name"],
			"encon_name" : request.json["encon_name"],
			"nodecon_name" : request.json["nodecon_name"],
			"op" : request.json["op"],
			"val" : request.json["val"]
		}
		action_group.add_action(**inputs)
		action_group_save["actions"][request.json["name"]] = inputs
		return "Action added"
	else:
		node = app.datastore.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		cond_group_save = app.datastore.save["logic"][request.json["owner"]]["cond_groups"][request.json["cond_group"]]
		action_group = cond_group.action_group
		action_group_save = cond_group_save["action_group"]
		del action_group_save["actions"][request.json["name"]]
		action_group.remove_action(request.json["name"])
		return "Action removed"

# Node type- JSON must have a 'type' argument with either START, BASIC or END
@app.route('/api/node/', methods=["GET","POST", "PUT", "DELETE"])
def node():
	if request.method == "POST":
		if not request.json:
			abort(400)

		inputs = dict(request.json)
		tipe = request.json['type']
		tipe_func = {"START": StartingPoint, "BASIC": BasicComponent, "END": EndingPoint}[tipe]
		tipe_dict = {"START": app.datastore.starts, "BASIC": app.datastore.basics, "END": app.datastore.ends}[tipe]
		del inputs['type']
		inputs["env"] = app.datastore.env
		n = tipe_func(**inputs)
		app.datastore.nodes[n.uid] = n
		tipe_dict[n.uid] = n
		app.datastore.save["nodes"][n.uid] = inputs
		inputs['type'] = tipe
		del inputs['env']
		return inputs
	# update
	elif request.method == "PUT":
		uid = request.json['uid']
		if not uid in app.datastore.nodes:
			abort(400)
		
		inputs = dict(request.json)
		del inputs['type']
		app.datastore.nodes[uid].update(inputs)
		app.datastore.save["nodes"][uid].update(inputs)
		return app.datastore.save["nodes"][uid]
	elif request.method == "DELETE":
		uid = request.json["uid"]
		todel = app.datastore.nodes[uid]

		#Remove node from logic paths
		for _, node in app.datastore.nodes.items():
			for _,cond_group in node.logic.condition_groups.items():
				if uid in cond_group.pass_paths: 
					cond_group.pass_paths.remove(todel)
				if uid in cond_group.fail_paths:
					cond_group.fail_paths.remove(todel)
		for _,owner in app.datastore.save["logic"].items():
			for _,logic in owner.items():
				for _,cond_group in logic["cond_groups"].items():
					if uid in cond_group["pass_paths"]: 
						del cond_group["pass_paths"]["todel"]
					if uid in cond_group["fail_paths"]:
						del cond_group["fail_paths"]["todel"]
		
		#Remove arrows
		for frum in app.datastore.save["dirto"]:
			if uid in frum:
				frum.remove(uid)
		del app.datastore.save["dirto"][uid]
		for frum in app.datastore.nodes:
			if frum != todel:
				frum.remove_directed_to(todel)

		#Delete node
		del app.datastore.save["nodes"][uid]
		del app.datastore.nodes["uid"]
		return f"Node {todel.name} removed."
		

		

@app.route('/api/dirto/', methods = ["GET","POST","DELETE"])
def dirto():
	if request.method == "GET":
		return app.datastore.save["dirto"][request.json['from']]
	elif request.method == "POST":
		frum = request.json['from']
		to = request.json['to']
		app.datastore.nodes[frum].set_directed_to(app.datastore.nodes[to])
		if frum not in app.datastore.save['dirto']:
			app.datastore.save['dirto'][frum] = []
		if not to in app.datastore.save['dirto'][frum]:
			app.datastore.save['dirto'][frum].append(to)
			return f'{app.datastore.nodes[frum]} directed to {app.datastore.nodes[to]}'
		else:
			return f'{app.datastore.nodes[frum]} already directed to {app.datastore.nodes[to]}'
	else:
		frum = request.json['from']
		to = request.json['to']
		app.datastore.nodes[frum].remove_directed_to(app.datastore.nodes[to])
		app.datastore.save['dirto'][frum].remove(to)
		return f'Removed direction from {app.datastore.nodes[frum]} to {app.datastore.nodes[to]}'

 # url to run the simulation
@app.route('/api/run/<int:until>')
@app.route('/api/run/')
def run(until=20000):
	global new_stdout
	if len(app.datastore.starts) == 0:
		return "Please create a starting node."
	if len(app.datastore.ends) == 0:
		return "Please create an ending node."
	[app.datastore.env.process(app.datastore.nodes[x].run()) for x in app.datastore.starts]
	print(f'Running simulation until {until}')
	app.datastore.start_time = app.datastore.env.now
	result = r(app.datastore.env,until)
	app.datastore.last_run = result

	#Fix later when we have a logger
	app.datastore.save["last_run"] = result.split('\n')
	return jsonify(app.datastore.save["last_run"])

# url to reset simulation
@app.route('/api/reset/', methods=["POST"])
def reset():
	app.datastore.env = simpy.Environment()
	for k,v in app.datastore.nodes.items():
		v.update({'env': app.datastore.env})
		v.reset()
	for k,v in app.datastore.containers.items():
		v.update({'env': app.datastore.env})
	return "Simulation has been reset."

# url to clean the graph for a new sim.
@app.route('/api/clean/', methods=["DELETE"])
def clean():
	global data
	#session["data"] = DataStore()
	#data = session["data"]
	data = DataStore()
	return "Graph has been reset"

@app.route('/api/run/summary/')
def get_summary():
	if app.datastore.env.now == 0:
		abort(400, "Cannot obtain run summary before simulation has been run.")
	return app.datastore.summary()

if __name__ == '__main__':
    #app.run()
	serve(app, host='0.0.0.0', port=5000)

