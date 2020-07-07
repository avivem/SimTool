from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_restful import reqparse, abort, Api, Resource
from flask_cors import CORS
import simpy
from logic import Node, StartingPoint, BasicFlowEntity, BasicComponent, EndingPoint
import sys
import io
# from logic import Node, BasicFlowEntity, StartingPoint, EndingPoint, BasicComponent

###If you are running locally and wish to see output in terminal, comment this out.
if __name__ != "__main__":
	old_stdout = sys.stdout
	new_stdout = io.StringIO()
	sys.stdout = new_stdout

app = Flask(__name__)
api = Api(app)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# dont use this- need to find another solution
parser = reqparse.RequestParser()
parser.add_argument('period', location=['json', 'form', 'args'])

# just output to see if the function ran
NODES = {
	'start': {'start': 'start'}
}

class DataStore():
	st = None
	bc = []
	ed = None
	env = simpy.Environment()

data = DataStore()


# create starting node
class Start(Resource):
	# 'get' function, but when you run http://127.0.0.1:5000/api/start in the browser
	# it will call StartingPoint and create the starting node
	def get(self):
		data.st = StartingPoint(data.env, "Starting Point 1",2, 100)
		return "Starting Point 1 added"

# create basic component
class Basic(Resource):
	# 'get' function, but when you run http://127.0.0.1:5000/api/basic in the browser
	# it will call BasicComponent and create the starting node
	def get(self):
		data.bc.append(BasicComponent(data.env,f"Basic Component #{len(data.bc) + 1}", 3, 7))
		if len(data.bc) == 1:
			data.st.set_directed_to(data.bc[0])
		else:
			data.bc[len(data.bc)-2].set_directed_to(data.bc[len(data.bc)-1])
		return f"Basic Component #{len(data.bc)} added"

	def post(self):
		args = parser.parse_args()
		# example how to change data inside our sim
		# task = {'start': args['period']}
		# NODES[4] = task
		return args


# create ending component
class End(Resource):
	# 'get' function, but when you run http://127.0.0.1:5000/api/end in the browser
	# it will call EndingPoint and create the starting node
	def get(self):
		data.ed = EndingPoint(data.env,"Ending Point 1")
		if len(data.bc) == 0:
			data.st.set_directed_to(data.ed)
		else:
			data.bc[len(data.bc)-1].set_directed_to(data.ed)
		return f"Ending Point #{len(data.bc)} added"
		

class Run(Resource):
	def get(self):
		if data.st == None:
			return "Please create a starting node."
		if data.ed == None:
			return "Please create an ending node."
		data.env.process(data.st.run())
		data.env.run(until=300)
		return new_stdout.getvalue().split('\n')

class Reset(Resource):
	def get(self):
		global data
		data = DataStore()
		return "Graph has been reset."



# resource, route
api.add_resource(Start, "/api/start")
api.add_resource(Basic, "/api/basic")
api.add_resource(End, "/api/end")
api.add_resource(Run, "/api/run")
api.add_resource(Reset, "/api/reset")





