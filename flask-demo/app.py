from flask import Flask, render_template,json , jsonify, request, redirect, url_for, abort
from flask_cors import CORS, cross_origin
import simpy
from logic import Node, StartingPoint, BasicFlowEntity, BasicComponent, EndingPoint, BasicContainer, BasicContainerBlueprint, Logic
import sys
import io
import uuid
import pprint


###If you are running locally and wish to see output in terminal, comment this out.
if __name__ != "__main__":
	old_stdout = sys.stdout
	new_stdout = io.StringIO()
	sys.stdout = new_stdout

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config['CORS_HEADERS'] = 'Content-Type'


class DataStore():
	nodes = {}
	save = {
		"nodes" : {},
		"containers" : {},
		"container_blueprints" : {},
		"dirto" : {},
		"logic" : {},
		"last_run" : None
	}
	starts = {}
	basics = {}
	ends = {}
	containers = {}
	container_blueprints = {}
	env = simpy.Environment()
data = DataStore()

#TODO: update Store to handle loading container info.
@app.route('/api/store/', methods = ["GET", "POST"])
def store():
	if request.method == "GET":
		return data.save
	elif all(elem in request.json for elem in data.save):
			data.save = request.json

			for id in data.save["nodes"]:
				node = dict(data.save["nodes"][id])
				tipe = node['type']
				tipe_func = {"START": StartingPoint, "BASIC": BasicComponent, "END": EndingPoint}[tipe]
				tipe_dict = {"START": data.starts, "BASIC": data.basics, "END": data.ends}[tipe]
				del node["type"]
				node["env"] = data.env
				n = tipe_func(**node)
				data.nodes[n.uid] = n
				tipe_dict[n.uid] = n
			for entry in data.save["dirto"].keys():
				data.nodes[entry].set_directed_to(data.save["dirto"][entry])

	else:
		abort(400)

#Handles creation of container blueprints.
@app.route('/api/container/blueprint/', methods=['GET','POST'])
def container_spec():
	if request.method == "GET":
		return data.save["container_blueprints"][request.json["uid"]]
	else:	
		inputs = dict(request.json)
		blueprint = BasicContainerBlueprint(**inputs)
		data.save["container_blueprints"][request.json['uid']] = inputs
		data.container_blueprints[request.json['uid']] = blueprint
		return f"Container Blueprint {request.json['name']}-{request.json['uid']} has been created."

#Handles adding a new container to a node. TODO: add functionality to remove containers / update.
@app.route('/api/node/container/', methods=['PUT'])
def container():
	if request.method == "PUT":
		blueprint = request.json['blueprint']
		if not blueprint in data.save["container_blueprints"]:
			abort(404, f"Container Blueprint {blueprint} does not exist.")
		bp = data.container_blueprints[blueprint]
		owner = data.nodes[request.json['owner']]
		if isinstance(owner, StartingPoint):
			owner.add_blueprint(bp)
		else:
			owner.add_container(bp)
		bcon = data.container_blueprints[blueprint].build(data.env, owner)
		if not request.json["owner"] in data.save['containers']:
			data.save['containers'][request.json["owner"]] = {}
		data.save['containers'][request.json["owner"]][blueprint] = dict(data.save['container_blueprints'][blueprint])
		data.save['containers'][request.json["owner"]][blueprint]['owner'] = request.json['owner']
		if not request.json["owner"] in data.containers:
			data.containers[request.json["owner"]] = {}
		data.containers[request.json["owner"]][blueprint] = bcon
		return f"Container {bcon} added to {owner}"

""" #Handles assigning logic to a node (determines where to send an entity and what to do with their resources.)
@app.route('/api/node/logic', methods=['PUT'])
def node_logic():
	if request.method == "PUT":
		logic = dict(request.json)
		data.save["logic"][logic['owner']] = request.json
		node = data.nodes[logic['owner']]
		del logic['owner']

		if 'pass' in logic:
			logic['pass'] = [data.nodes[x] for x in data.nodes if x in logic['pass']]
			logic['fail'] = [data.nodes[x] for x in data.nodes if x in logic['fail']]
		node.set_node_logic_policy(logic)
		return request.json """

@app.route('/api/node/logic/', methods=["PUT", "DELETE"])
def node_logic():
	if request.method == "PUT":
		#pprint.pprint(request.json, sys.stderr)
		node = data.nodes[request.json["owner"]]
		node.create_logic(request.json["split_policy"])
		return f"Node logic created for {node}"
	else:
		#Replace logic with default of blank with random path choosing.
		node = data.nodes[request.json["owner"]]
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
		node = data.nodes[request.json["owner"]]
		name = request.json['name']
		if not request.json["owner"] in data.save["logic"]:
			data.save["logic"][request.json["owner"]] = {}
			data.save["logic"][request.json["owner"]]["cond_groups"] = {}
		data.save["logic"][request.json["owner"]]["cond_groups"][request.json['name']] = dict(inputs)
		inputs["pass_paths"] = [data.nodes[x] for x in inputs["pass_paths"]]
		inputs["fail_paths"] = [data.nodes[x] for x in inputs["fail_paths"]]
		node.logic.create_condition_group(**inputs)
		return f"Condition group {name} added to {node}"
	else:
		node = data.nodes[request.json["owner"]]
		request.json['name']
		node.logic.delete_condition_group(name)
		
		return f"Condition group {name} removed from {node}"

@app.route('/api/node/logic/condition_group/flip/', methods=["PUT"])
def flip_condition_group():
	node = data.nodes[request.json["owner"]]
	name = data.nodes[request.json["name"]]
	node.logic.condition_groups[name].flip_type()
	setting = "AND" if node.logic.condition_groups[name].AND else "OR"
	return f"Condition Group {name} of {node} has been set to {setting}"

@app.route('/api/node/logic/condition_group/condition/', methods=["PUT", "DELETE"])
def condition():
	if request.method == "PUT":
		node = data.nodes[request.json["owner"]]
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
		cond_group_save = data.save["logic"][request.json["owner"]]["cond_groups"][request.json["cond_group"]]
		if not "conditions" in cond_group_save:
			cond_group_save["conditions"] = {}
		cond_group_save["conditions"][inputs["name"]] = inputs
		return f"Condition Added."
	else:
		node = data.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		cond_group.remove_condition(request.json["name"])
		return f"Condition Removed."

@app.route('/api/node/logic/condition_group/action_group/', methods=["PUT", "DELETE"])
def action_group():
	if request.method == "PUT":
		node = data.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		cond_group.create_action_group(request.json["name"])
		return "Action group created."
	else:
		node = data.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		cond_group.delete_action_group(request.json["name"])
		return "Action group removed."

@app.route('/api/node/logic/condition_group/action_group/action/', methods=["PUT", "DELETE"])
def action():
	if request.method == "PUT":
		node = data.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		action_group = cond_group.action_group
		inputs = {
			"name" : request.json["name"],
			"encon_name" : request.json["encon_name"],
			"nodecon_name" : request.json["nodecon_name"],
			"op" : request.json["op"],
			"val" : request.json["val"]
		}
		action_group.add_action(**inputs)
		return "Action added"
	else:
		node = data.nodes[request.json["owner"]]
		cond_group = node.logic.condition_groups[request.json["cond_group"]]
		action_group = cond_group.action_group
		action_group.remove_action(request.json["name"])
		return "Action removed"

# Node type- JSON must have a 'type' argument with either START, BASIC or END
@app.route('/api/node/', methods=["GET","POST", "PUT"])
def node():
	if request.method == "POST":
		if not request.json:
			abort(400)

		inputs = dict(request.json)
		tipe = request.json['type']
		tipe_func = {"START": StartingPoint, "BASIC": BasicComponent, "END": EndingPoint}[tipe]
		tipe_dict = {"START": data.starts, "BASIC": data.basics, "END": data.ends}[tipe]
		del inputs['type']
		inputs["env"] = data.env
		n = tipe_func(**inputs)
		data.nodes[n.uid] = n
		tipe_dict[n.uid] = n
		data.save["nodes"][n.uid] = inputs
		inputs['type'] = tipe
		del inputs['env']
		return inputs
	# update
	elif request.method == "PUT":
		uid = request.json['uid']
		if not uid in data.nodes:
			abort(400)
		
		inputs = dict(request.json)
		del inputs['type']
		data.nodes[uid].update(inputs)
		data.save["nodes"][uid].update(inputs)
		return data.save["nodes"][uid]
		

@app.route('/api/dirto/', methods = ["GET","POST","DELETE"])
def dirto():
	if request.method == "GET":
		return data.save["dirto"][request.json['from']]
	elif request.method == "POST":
		frum = request.json['from']
		to = request.json['to']
		data.nodes[frum].set_directed_to(data.nodes[to])
		if frum not in data.save['dirto']:
			data.save['dirto'][frum] = []
		if not to in data.save['dirto'][frum]:
			data.save['dirto'][frum].append(to)
			return f'{data.nodes[frum]} directed to {data.nodes[to]}'
		else:
			return f'{data.nodes[frum]} already directed to {data.nodes[to]}'
	else:
		frum = request.json['from']
		to = request.json['to']
		data.nodes[frum].remove_directed_to(data.nodes[to])
		data.save['dirto'][frum].remove(to)
		return f'Removed direction from {data.nodes[frum]} to {data.nodes[to]}'

 # url to run the simulation
@app.route('/api/run/<int:until>')
@app.route('/api/run/')
def run(until=20000):
	global new_stdout
	if len(data.starts) == 0:
		return "Please create a starting node."
	if len(data.ends) == 0:
		return "Please create an ending node."
	[data.env.process(data.nodes[x].run()) for x in data.starts]
	print(f'Running simulation until {until}')
	data.env.run(until=until)

	#Fix later when we have a logger
	data.save["last_run"] = new_stdout.getvalue().split('\n')
	new_stdout = io.StringIO()
	sys.stdout = new_stdout
	return jsonify(data.save["last_run"])

# url to reset simulation
@app.route('/api/reset/', methods=["POST"])
def reset():
	data.env = simpy.Environment()
	for k,v in data.nodes.items():
		v.update({'env': data.env})
		v.reset()
	for k,v in data.containers.items():
		v.update({'env': data.env})
	return "Simulation has been reset."

# url to clean the graph for a new sim.
@app.route('/api/clean/', methods=["DELETE"])
def clean():
	global data
	data = DataStore()
	return "Graph has been reset"



if __name__ == '__main_':
    app.run()

