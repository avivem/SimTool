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
	'todo1': {'task': 'build an API'},
	'todo2': {'task': '?????'},
	'todo3': {'task': 'profit!'},
}

# create node
class Create(Resource):
    # 'get' function, but when you run http://127.0.0.1:5000/api/create in the browser
    # it will call StartingPoint and create the starting node
	def get(self):
		env = simpy.Environment()
		st = StartingPoint(env, "Starting Point 1",2, 100)
		b1 = BasicComponent(env,"Basic Component #1", 3, 7) 
		ed = EndingPoint(env,"Ending Point 1")
		st.set_directed_to(b1)
		b1.set_directed_to(ed)
		env.process(st.run())
		env.run(until=300)
		return jsonify(new_stdout.getvalue().splitlines())

# resource, route
api.add_resource(Create, "/api/create")



