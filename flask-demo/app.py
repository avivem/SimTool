from flask import Flask, render_template,json , jsonify, request, redirect, url_for, abort
from flask_cors import CORS, cross_origin
import simpy
from logic import Node, StartingPoint, BasicFlowEntity, BasicComponent, EndingPoint, BasicContainer
import sys
import io
import uuid


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
		"container_spacs" : {},
		"dirto" : {},
		"logic" : {},
		"last_run" : None
	}
	starts = {}
	basics = {}
	ends = {}
	containers = {}
	container_specs = {}
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
			return data.save
	else:
		abort(400)

#Handles creation of container specs.
@app.route('/api/container_spec/', methods=['GET','POST'])
def container_spec():
	if request.method == "GET":
		return data.container_specs[request.json['resource']][request.json['uid']]
	else:	
		if not request.json['resource'] in data.container_specs:
			data.container_specs[request.json['resource']] = {}
	
		inputs = dict(request.json)
		data.container_specs[request.json['resource']][request.json['uid']] = inputs
		return jsonify(inputs)

#Handles adding a new container to a node. TODO: add functionality to remove containers / update.
@app.route('/api/node/container/', methods=['PUT'])
def container():
	if request.method == "PUT":
		res = request.json['resource']
		if not res in data.save['containers']:
			data.save['containers'][res] = {}
		data.save['containers'][res] = request.json
		con = dict(request.json)
		con['env'] = data.env
		con['owner'] = data.nodes[con['owner']]
		bcon = BasicContainer(**con)
		if not res in data.containers:
			data.containers[res] = {}
		data.containers[res][con['uid']] = bcon
		con['owner'].add_container(bcon)
		return f"Container {bcon} added to {con['owner']}"

#Handles adding a container specification to a starting node.
@app.route('/api/node/container_spec/', methods=['PUT','DELETE'])
def node_container_spec():
	if request.method == "PUT":
		node = data.nodes[request.json['node']]
		spec = data.container_specs[request.json['resource']][request.json['uid']]
		node.add_container_spec(spec)
		return f"Container Specification {spec} added to {node}"

#Handles assigning logic to a node (determines where to send an entity and what to do with their resources.)
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
		return request.json
		


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
@app.route('/api/reset/')
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

