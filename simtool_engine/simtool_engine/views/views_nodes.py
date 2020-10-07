from simtool_engine import app
from flask import Blueprint, request, abort

nodes_blueprint = Blueprint(name="nodes_blueprint", import_name=__name__, url_prefix='/api/node')

@nodes_blueprint.route('/', methods = ["GET", "POST", "PUT", "DELETE"])
def route_node():
    if request.method == "GET":
        try:
            return app.ds.get_node(request.json["uid"])
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "POST":
        inputs = dict(request.json)
        tipe = request.json['type']
        tipe = {"START" : app.ds.START, "STATION": app.ds.STATION, "END": app.ds.END, "GLOBAL": app.ds.GLOBAL}[tipe]
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
            tipe = {"START" : app.ds.START, "STATION": app.ds.STATION, "END": app.ds.END, "GLOBAL": app.ds.GLOBAL}[tipe]
            return app.ds.delete_node(request.json["uid"],tipe)
        except ValueError as e:
            abort(400, str(e))

@nodes_blueprint.route('/dirto/', methods = ["GET", "PUT", "DELETE"])
def route_dirto():
    if request.method == "GET":
        try:
            if not "from" in request.json:
                abort(400, "From Node UID not provided.")
            uid = request.json['from']
            return app.ds.get_directed_to(uid)
        except ValueError as e:
            return e
    elif request.method == "PUT":
        try:
            if not "from" in request.json:
                abort(400, "From Node UID not provided.")
            elif not "to" in request.json:
                abort(400, "To Node UID not provided.")
            frum = request.json['from']
            to = request.json['to']
            return app.ds.set_directed_to(frum,to)
        except ValueError as e:
            return e
    else:
        try:
            if not "from" in request.json:
                abort(400, "From Node UID not provided.")
            elif not "to" in request.json:
                abort(400, "To Node UID not provided.")
            frum = request.json['from']
            to = request.json['to']
            return app.ds.remove_directed_to(frum,to)
        except ValueError as e:
            return e