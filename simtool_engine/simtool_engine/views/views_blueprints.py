from simtool_engine import app
from flask import Blueprint, request, abort

blueprints_blueprint = Blueprint(name="blueprints_blueprint", import_name=__name__, url_prefix='/api')

#Routing for handling blueprint creation, updating, deletion, and retrieval.
@blueprints_blueprint.route('/blueprint/', methods=["GET", "POST", "PUT", "DELETE"])
def route_blueprint():
    if request.method == "GET":
        try:
            return app.ds.get_blueprint(request.json["uid"])
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "POST":
        try:
            return app.ds.create_blueprint(request.json)
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "PUT":
        try:
            if not "uid" in request.json:
                abort(400, "Blueprint UID not provided.")
            uid = request.json['uid']
            inputs = dict(request.json)
            del inputs['uid']
            return app.ds.update_blueprint(uid,inputs)
        except ValueError as e:
            abort(400, str(e))
    else:
        try:
            if not "uid" in request.json:
                abort(400, "Blueprint UID not provided.")
            uid = request.json['uid']
            return app.ds.delete_blueprint(uid)
        except ValueError as e:
            abort(400, str(e))
