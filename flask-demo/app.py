from flask import Flask, render_template,json , jsonify, request, redirect, url_for, abort
from flask_cors import CORS
import simpy
from logic import Node, StartingPoint, BasicFlowEntity, BasicComponent, EndingPoint
import sys
import io
import uuid

###If you are running locally and wish to see output in terminal, comment this out.
if __name__ != "__main__":
	old_stdout = sys.stdout
	new_stdout = io.StringIO()
	sys.stdout = new_stdout

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# just output to see if the function ran
NODES = {
	'start': {'start': 'start'}
}

class DataStore():
	nodes = {}
	directed_to = {}
	starts = {}
	basics = {}
	ends = {}
	env = simpy.Environment()
data = DataStore()

# Node type- JSON must have a 'type' argument with either START, BASIC or END
@app.route('/api/node/<fid>', methods=["GET","POST"])
@app.route('/api/node/', methods=["GET","POST"])
def node(fid="-1"):
	if request.method == "POST":
		if not request.json:
			abort(400)
		if request.json['type'] == "START":
			name = request.json['name']
			gen_fun = request.json['gen_fun']
			gen_limit = request.json['gen_limit']
			st =  StartingPoint(data.env, name, gen_fun, gen_limit)
			#st =  StartingPoint(data.env, name,gen_fun, gen_limit,fid)
			data.nodes[st.uid] = st
			data.starts[st.uid] = st
			return st.uid
		elif request.json['type'] == "BASIC":
			name = request.json['name']
			capacity = request.json['capacity']
			time_func = request.json['time_func']
			#Here, we will need to add logic to choose the right time function
			b = BasicComponent(data.env, name, capacity, time_func)
			#b = BasicComponent(data.env, name,capacity, time_func, fid)
			data.nodes[b.uid] = b
			data.basics[b.uid] = b
			return b.uid
		elif request.json['type'] == "END":
			name = request.json['name']
			e = EndingPoint(data.env, name)
			#e = EndingPoint(data.env, name,fid)
			data.nodes[e.uid] = e
			data.ends[e.uid] = e
			return e.uid
		else:
			abort(400)

# url to connect two nodes together- has a direction
@app.route('/api/<frum>/dirto/<to>', methods=["POST"])
def dirto(frum,to):
	data.nodes[frum].set_directed_to(data.nodes[to])
	return f'{data.nodes[frum]} directed to {data.nodes[to]}'

""" @app.route('/api/basic')
def basic():
	data.bc.append(BasicComponent(data.env,f"Basic Component #{len(data.bc) + 1}", 3, 7))
	if len(data.bc) == 1:
		data.st.set_directed_to(data.bc[0])
	else:
		data.bc[len(data.bc)-2].set_directed_to(data.bc[len(data.bc)-1])
	return data.bc[len(data.bc)-1].uid

@app.route('/api/end')
def end():
	data.ed = EndingPoint(data.env,"Ending Point 1",)
	if len(data.bc) == 0:
		data.st.set_directed_to(data.ed)
	else:
		data.bc[len(data.bc)-1].set_directed_to(data.ed)
	return data.ed.uid
 """

 # url to run the simulation
@app.route('/api/run/<int:until>')
@app.route('/api/run/')
def run(until=300):
	if len(data.starts) == 0:
		return "Please create a starting node."
	if len(data.ends) == 0:
		return "Please create an ending node."
	[data.env.process(data.nodes[x].run()) for x in data.starts]
	data.env.run(until=until)
	return jsonify(new_stdout.getvalue().split('\n'))

# url to reset simulation
@app.route('/api/reset')
def reset():
	global data
	data = DataStore()
	return "Graph has been reset."

# OLD
# # create starting node
# class Start(Resource):
# 	# 'get' function, but when you run http://127.0.0.1:5000/api/start in the browser
# 	# it will call StartingPoint and create the starting node
# 	def get(self):
# 		data.st = StartingPoint(data.env, "Starting Point 1",2, 100)
# 		return data.st.uid

# # create basic component
# class Basic(Resource):
# 	# 'get' function, but when you run http://127.0.0.1:5000/api/basic in the browser
# 	# it will call BasicComponent and create the starting node
# 	def get(self):
# 		data.bc.append(BasicComponent(data.env,f"Basic Component #{len(data.bc) + 1}", 3, 7))
# 		if len(data.bc) == 1:
# 			data.st.set_directed_to(data.bc[0])
# 		else:
# 			data.bc[len(data.bc)-2].set_directed_to(data.bc[len(data.bc)-1])
# 		return data.bc[len(data.bc)-1].uid

# 	def post(self):
# 		args = parser.parse_args()
# 		# example how to change data inside our sim
# 		# task = {'start': args['period']}
# 		# NODES[4] = task
# 		return args


# # create ending component
# class End(Resource):
# 	# 'get' function, but when you run http://127.0.0.1:5000/api/end in the browser
# 	# it will call EndingPoint and create the starting node
# 	def get(self):
# 		data.ed = EndingPoint(data.env,"Ending Point 1",)
# 		if len(data.bc) == 0:
# 			data.st.set_directed_to(data.ed)
# 		else:
# 			data.bc[len(data.bc)-1].set_directed_to(data.ed)
# 		return data.ed.uid
		

# class Run(Resource):
# 	def get(self):
# 		if data.st == None:
# 			return "Please create a starting node."
# 		if data.ed == None:
# 			return "Please create an ending node."
# 		data.env.process(data.st.run())
# 		data.env.run(until=300)
# 		return new_stdout.getvalue().split('\n')

# class Reset(Resource):
# 	def get(self):
# 		global data
# 		data = DataStore()
# 		return "Graph has been reset."









