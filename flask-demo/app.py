from flask import Flask, render_template,json , jsonify, request, redirect, url_for, abort
from flask_cors import CORS, cross_origin
import simpy
from logic import Node, StartingPoint, BasicFlowEntity, BasicComponent, EndingPoint
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

			##TODO: discuss with team whether or not this presents security problems.
			for id in data.save["nodes"]:
				node = dict(data.save["nodes"][id])
				tipe = {"START": StartingPoint, "BASIC": BasicComponent, "END": EndingPoint}[node["type"]]
				tipe_dict = {"START": data.starts, "BASIC": data.basics, "END": data.ends}[node["type"]]
				del node["type"]
				node["env"] = data.env
				n = tipe(**node)
				data.nodes[n.uid] = n
				tipe_dict[n.uid] = n
			for entry in data.save["dirto"].keys():
				data.nodes[entry].set_directed_to(data.save["dirto"][entry])
			return data.save
	else:
		return redirect("https://http.cat/400")

# Node type- JSON must have a 'type' argument with either START, BASIC or END
@app.route('/api/node/', methods=["GET","POST"])
def node():
	if request.method == "POST":
		if not request.json:
			return redirect("https://http.cat/400")
		if request.json['type'] == "START":
			inputs = {
				'name' : request.json['name'],
				'entity_name' : request.json['entity_name'],
				'gen_fun' : request.json['gen_fun'],
				'limit' : request.json['limit'],
				'uid' : request.json['uid']
			}

			st =  StartingPoint(data.env, **inputs)
			data.nodes[st.uid] = st
			data.starts[st.uid] = st

			data.save["nodes"][st.uid] = inputs
			data.save["nodes"][st.uid]["type"] = "START"

			return data.save["nodes"][st.uid]

		elif request.json['type'] == "BASIC":

			inputs = {
				'name' : request.json['name'],
				'capacity' : request.json['capacity'],
				'time_func' : request.json['time_func'],
				'uid' : request.json['uid']
			}
			
			#Here, we will need to add logic to choose the right time function
			b = BasicComponent(data.env, **inputs)
			data.nodes[b.uid] = b
			data.basics[b.uid] = b

			data.save["nodes"][b.uid] = inputs
			data.save["nodes"][b.uid]["type"] = "BASIC"
			return data.save["nodes"][b.uid]

		elif request.json['type'] == "END":

			inputs = {
				'name' : request.json['name'],
				'uid' : request.json['uid']
			}
			
			e = EndingPoint(data.env, **inputs)
			data.nodes[e.uid] = e
			data.ends[e.uid] = e

			data.save["nodes"][e.uid] = inputs
			data.save["nodes"][e.uid]["type"] = "END"
			return data.save["nodes"][e.uid]
		else:
			return redirect("https://http.cat/400")
	elif request.method == "GET":
		return redirect("https://http.cat/400")

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
@app.route('/api/clean/')
def clean():
	global data
	data = DataStore()
	return "Graph has been reset"






