from flask import Flask, render_template,json , jsonify, request, redirect, url_for, abort
from flask_cors import CORS, cross_origin
import simpy
from logic import Node, StartingPoint, BasicFlowEntity, BasicComponent, EndingPoint, BasicContainer
import sys
import io
import uuid

##TODO: replace the 400 errors with abort() instead of cat memes.

###If you are running locally and wish to see output in terminal, comment this out.
if __name__ != "__main__":
	old_stdout = sys.stdout
	new_stdout = io.StringIO()
	sys.stdout = new_stdout

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config['CORS_HEADERS'] = 'Content-Type'

# just output to see if the function ran
NODES = {
	'start': {'start': 'start'}
}

class DataStore():
	nodes = {}
	save = {
		"nodes" : {},
		"containers" : {},
		"dirto" : {},
		"last_run" : None
	}
	starts = {}
	basics = {}
	ends = {}
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
		return redirect("https://http.cat/400")


""" @api.route('/api/node/resource', methods = ["POST"])
def resource():
	if request.method == "POST":

		inputs = {
			'name' : request.json['name'],
			'owner' : request.json['owner'],
			'unit' : request.json['unit'],
			'init' : request.json['init'],
			'capacity' : request.json['capacity'],
			'uid' : request.json['uid'],
		}

		container = BasicContainer(data.env, **inputs) """
		


# Node type- JSON must have a 'type' argument with either START, BASIC or END
@app.route('/api/node/', methods=["GET","POST"])
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
	elif request.method == "PUT":
		abort(400)

		

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
		data.save['dirto'][frum].append(to)
		return f'{data.nodes[frum]} directed to {data.nodes[to]}'
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
	if len(data.starts) == 0:
		return "Please create a starting node."
	if len(data.ends) == 0:
		return "Please create an ending node."
	[data.env.process(data.nodes[x].run()) for x in data.starts]
	print(f'Running simulation until {until}')
	data.env.run(until=until)
	data.save["last_run"] = new_stdout.getvalue().split('\n')
	return jsonify(data.save["last_run"])

# url to reset simulation
@app.route('/api/reset/')
def reset():
	data.env = simpy.Environment()
	return "Simulation has been reset."

# url to clean the graph for a new sim.
@app.route('/api/clean/', methods=["GET"])
def clean():
	global data
	data = DataStore()
	return "Graph has been reset"






