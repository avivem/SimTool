from simtool_engine import app
from flask import Blueprint, request, abort

containers_blueprint = Blueprint(name="containers_blueprint", import_name=__name__, url_prefix='/api/node')

@containers_blueprint.route('/container/', methods=["GET", "POST", "PUT", "DELETE"])
def routes_containers():
    if request.method == "GET":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "name" in request.json:
                abort(400, "Container name not provided.")
            uid = request.json['owner']
            name = request.json['name']

            return app.ds.get_container(uid,name)
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "POST":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            uid = request.json['uid']
            inputs = dict(request.json)
            del inputs['owner']
            return app.ds.create_container(uid, inputs)
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "PUT":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "name" in request.json:
                abort(400, "Container name not provided.")
            uid = request.json['owner']
            name = request.json['name']
            inputs = dict(request.json)
            del inputs['owner']
            del inputs['name']
            return app.ds.update_container(uid, name, inputs)
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "DELETE":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "name" in request.json:
                abort(400, "Container name not provided.")
            uid = request.json['owner']
            name = request.json['name']
            return app.ds.delete_container(uid,name)
        except ValueError as e:
            abort(400, str(e))

@containers_blueprint.route('/container/blueprint/', methods=["PUT"])
def route_container_from_bp():
    try:
        if not "owner" in request.json:
            abort(400, "Node UID not provided.")
        elif not "blueprint" in request.json:
            abort(400, "Blueprint UID not provided.")
        uid = request.json['owner']
        blueprint = request.json['blueprint']
        return app.ds.create_container_bp(uid,blueprint)
    except ValueError as e:
        abort(400, str(e))

@containers_blueprint.route('/blueprint/', methods=["PUT"])
def route_add_blueprint():
    try:
        if not "owner" in request.json:
            abort(400, "Node UID not provided.")
        elif not "blueprint" in request.json:
            abort(400, "Blueprint UID not provided.")
        uid = request.json['owner']
        blueprint = request.json['blueprint']
        return app.ds.add_blueprint(uid,blueprint)
    except ValueError as e:
        abort(400, str(e))