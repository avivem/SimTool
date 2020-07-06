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
    b1 = None
    ed = None

data = DataStore()

env = simpy.Environment()


# create starting node
class Start(Resource):
    # 'get' function, but when you run http://127.0.0.1:5000/api/create in the browser
    # it will call StartingPoint and create the starting node
	def get(self):
		
		data.st = StartingPoint(env, "Starting Point 1",2, 100)
		return NODES

# create basic component
class Basic(Resource):
	# 'get' function, but when you run http://127.0.0.1:5000/api/basiccomponent in the browser
    # it will call StartingPoint and create the starting node
	def get(self):
		data.b1 = BasicComponent(env,"Basic Component #1", 3, 7) 
		return NODES


# create ending component
class End(Resource):
	# 'get' function, but when you run http://127.0.0.1:5000/api/basiccomponent in the browser
    # it will call StartingPoint and create the starting node
	def get(self):
		data.ed = EndingPoint(env,"Ending Point 1")
		data.st.set_directed_to(data.b1)
		data.b1.set_directed_to(data.ed)
		env.process(data.st.run())
		env.run(until=300)
		return jsonify(new_stdout.getvalue().splitlines())


# resource, route
api.add_resource(Start, "/api/start")
api.add_resource(Basic, "/api/basic")
api.add_resource(End, "/api/end")



