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


""" @app.route('/api/node/resource', methods = ["POST"])
def resource():
	if request.method == "POST":
		if request.json['type'] == 'RESOURCE':
			data.containers[request.json['name']] = {}
		elif request.json['type'] == 'CONTAINER':
			inputs = {
				'name' : request.json['name'],
        		'owner' : request.json['owner'],
        		'init' : request.json['init'],
        		'resource' : request.json['resource'],
        		'capacity' : request.json['capacity'],
				'uid' : request.json['uid']
			}
			res = inputs['resource']
			if not res in data.containers:
				abort(400, message=f'Resource {res} not found.')
			con = BasicContainer(env = data.env, **inputs)
			owner_uid = inputs['owner']
			owner = data.nodes[owner_uid]
			owner.add_container(con)
			data.save['containers'][res][con.uid] = inputs
			data.containers[res] = con
		else:
			abort(400) """

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

@app.route('/api/node/container', methods=['GET','POST', 'UPDATE'])
def container():
	if request.method == "POST":
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

@app.route('/api/node/container_spec', methods=['PUT','DELETE'])
def node_container_spec():
	if request.method == "PUT":
		node = data.nodes[request.json['node']]
		spec = data.container_specs[request.json['resource']][request.json['uid']]
		node.add_container_spec(spec)

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
def run(until=300):
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

# # set resources on node
# @app.route('api/resource', methods=["POST"])
# def resource():
#  	if request.resource == "POST":
#  		# wallet example
# 		wallet_spec = {
# 			'name' : request.json['name'],
# 			'resource' : request.json['resource'],
# 			'init' : request.json['init'],
# 			'capacity' : request.json['capacity'],
# 			'uid' : request.json['uid']
# 		}

# 		st.add_container_spec(wallet_spec)

# 		# return?
# 		return data.save["nodes"][st.uid]


# @app.route('api/container', methods=["POST"])
# def container():
# 	# would creating the resource here and the container work better?
# 	wallet_spec = {
# 		'name' : request.json['name'],
# 		'resource' : request.json['resource'],
# 		'init' : request.json['init'],
# 		'capacity' : request.json['capacity'],
# 		'uid' : request.json['uid']
# 	}

# 	st.add_container_spec(wallet_spec)

# 	# node will be the one being sent from ui

# 	revenue = BasicContainer(env,"Revenue",node,"Dollar",0,uid='rev')
# 	node.add_container(revenue)

# 	# is split being set by the user?





