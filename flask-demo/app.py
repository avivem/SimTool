from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_restful import reqparse, abort, Api, Resource
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

parser = reqparse.RequestParser()

# just output to see if the function ran
NODES = {
	'start': {'start': 'start'}
}

class DataStore():
	st = None
	bc = []
	ed = None

data = DataStore()

env = simpy.Environment()


# create starting node
class Start(Resource):
	# 'get' function, but when you run http://127.0.0.1:5000/api/create in the browser
	# it will call StartingPoint and create the starting node
	def get(self):
		
		data.st = StartingPoint(env, "Starting Point 1",2, 100)
		return "Starting Point 1 added"

# create basic component
class Basic(Resource):
	# 'get' function, but when you run http://127.0.0.1:5000/api/basiccomponent in the browser
	# it will call StartingPoint and create the starting node
	def get(self):
		data.bc.append(BasicComponent(env,f"Basic Component #{len(data.bc) + 1}", 3, 7))
		if len(data.bc) == 1:
			data.st.set_directed_to(data.bc[0])
		else:
			data.bc[len(data.bc)-2].set_directed_to(data.bc[len(data.bc)-1])
		return f"Basic Component #{len(data.bc)} added"


# create ending component
class End(Resource):
	# 'get' function, but when you run http://127.0.0.1:5000/api/basiccomponent in the browser
	# it will call StartingPoint and create the starting node
	def get(self):
		data.ed = EndingPoint(env,"Ending Point 1")
		data.bc[len(data.bc)-1].set_directed_to(data.ed)
		return f"Ending Point #{len(data.bc)} added"
		

class Run(Resource):
	def get(self):
		env.process(data.st.run())
		env.run(until=300)
		return new_stdout.getvalue().split('\n')


# resource, route
api.add_resource(Start, "/api/start")
api.add_resource(Basic, "/api/basic")
api.add_resource(End, "/api/end")
api.add_resource(Run, "/api/run")



