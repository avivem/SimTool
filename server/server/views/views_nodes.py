from server import app
from flask import Blueprint, request, abort

nodes_blueprint = Blueprint("nodes_blueprint", __name__, url_prefix='/api/node')

@nodes_blueprint.route('/node/', methods = ["GET", "POST", "PUT", "DELETE"])
def route_node():
    if request.method == "GET":
        try:
            return app.ds.get_node(request.json["uid"])
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "POST":
        inputs = dict(request.json)
        tipe = request.json['type']
        tipe = {"START" : app.ds.START, "STATION": app.ds.STATION, "END": app.ds.END}[tipe]
        del inputs['type']
        try:
            return app.ds.create_node(tipe,inputs)
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "PUT":
        try:
            inputs = dict(request.json)
            uid = inputs["uid"]
            del inputs[uid]
            return app.ds.update_node(uid, inputs)
        except ValueError as e:
            abort(400, str(e))
    else:
        try:
            tipe = request.json["type"]
            tipe = {"START" : app.ds.START, "STATION": app.ds.STATION, "END": app.ds.END}[tipe]
            return app.ds.delete_node(request.json["uid"],tipe)
        except ValueError as e:
            abort(400, str(e))
