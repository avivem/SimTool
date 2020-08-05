from simtool_engine import app
from flask import Blueprint, request, abort

logic_blueprint = Blueprint(name="logic_blueprint", import_name=__name__, url_prefix='/api/node/logic')

@logic_blueprint.route('/', methods = ["PUT", "DELETE"])
def route_create_logic():
    if request.method == "PUT":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "split_policy" in request.json:
                abort(400, "Split Policy not provided.")
            owner = request.json['owner']
            split_policy = request.json['split_policy']
            return app.ds.create_logic(owner,split_policy)
        except ValueError as e:
            abort(400, str(e))
    else:
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            owner = request.json['owner']
            return app.ds.delete_logic(owner)
        except ValueError as e:
            abort(400, str(e))

#No update for condition groups, simply send a new group with same name to replace.
@logic_blueprint.route('/cond_group/', methods = ["PUT", "DELETE"])
def route_cond_group():
    if request.method == "PUT":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "name" in request.json:
                abort(400, "Condition Group name not provided.")
            elif not "pass_paths" in request.json:
                abort(400, "Pass Paths not provided.")
            elif not "fail_paths" in request.json:
                abort(400, "Fail Paths not provided.")
            owner = request.json['owner']
            name = request.json['name']
            pp = request.json['pass_paths']
            fp = request.json['fail_paths']
            return app.ds.create_condition_group(owner,name,pp,fp)
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "DELETE":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "name" in request.json:
                abort(400, "Condition Group name not provided.")
            owner = request.json['owner']
            name = request.json['name']
            return app.ds.delete_condition_group(owner,name)
        except ValueError as e:
            abort(400, str(e))

@logic_blueprint.route('/cond_group/flip/', methods = ["PUT"])
def route_cond_group_flip():
    try:
        if not "owner" in request.json:
            abort(400, "Node UID not provided.")
        elif not "name" in request.json:
            abort(400, "Condition Group name not provided.")
        owner = request.json['owner']
        name = request.json['name']
        return app.ds.flip_condition_group_cond_type(owner,name)
    except ValueError as e:
        abort(400, str(e))

@logic_blueprint.route('/cond_group/condition/', methods = ['GET', 'PUT', 'DELETE'])
def route_cond_group_condition():
    if request.method == "GET":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "cond_group" in request.json:
                abort(400, "Condition Group name not provided.")
            elif not "name" in request.json:
                abort(400, "Condition name not provided.")
            owner = request.json['owner']
            cond_group = request.json['cond_group']
            name = request.json['name']
            return app.ds.get_condition(owner,cond_group,name)
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "PUT":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "cond_group" in request.json:
                abort(400, "Condition Group name not provided.")
            owner = request.json['owner']
            cond_group = request.json['cond_group']
            inputs = dict(request.json)
            del inputs["owner"]
            del inputs["cond_group"]
            return app.ds.add_condition(owner,cond_group,inputs)
        except ValueError as e:
            abort(400, str(e))
    else:
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "cond_group" in request.json:
                abort(400, "Condition Group name not provided.")
            elif not "name" in request.json:
                abort(400, "Condition name not provided.")
            owner = request.json['owner']
            cond_group = request.json['cond_group']
            name = request.json['name']
            return app.ds.remove_condition(owner,cond_group,name)
        except ValueError as e:
            abort(400, str(e))

@logic_blueprint.route('/cond_group/action_group/', methods=['PUT','DELETE'])
def route_action_group():
    try:
        if not "owner" in request.json:
            abort(400, "Node UID not provided.")
        elif not "cond_group" in request.json:
            abort(400, "Condition Group name not provided.")
        owner = request.json['owner']
        cond_group = request.json['cond_group']
        if request.method == "PUT":
            return app.ds.create_action_group(owner,cond_group)
        else:
            return app.ds.delete_action_group(owner,cond_group)
    except ValueError as e:
        abort(400, str(e))

@logic_blueprint.route('/cond_group/action_group/action/', methods = ['GET', 'PUT', 'DELETE'])
def route_action():
    if request.method == "GET":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "cond_group" in request.json:
                abort(400, "Condition Group name not provided.")
            elif not "name" in request.json:
                abort(400, "Action name not provided.")
            owner = request.json['owner']
            cond_group = request.json['cond_group']
            name = request.json['name']
            return app.ds.get_action(owner,cond_group,name)
        except ValueError as e:
            abort(400, str(e))
    elif request.method == "PUT":
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "cond_group" in request.json:
                abort(400, "Action Group name not provided.")
            owner = request.json['owner']
            cond_group = request.json['cond_group']
            inputs = dict(request.json)
            del inputs["owner"]
            del inputs["cond_group"]
            return app.ds.add_action(owner,cond_group,inputs)
        except ValueError as e:
            abort(400, str(e))
    else:
        try:
            if not "owner" in request.json:
                abort(400, "Node UID not provided.")
            elif not "cond_group" in request.json:
                abort(400, "Condition Group name not provided.")
            elif not "name" in request.json:
                abort(400, "Action name not provided.")
            owner = request.json['owner']
            cond_group = request.json['cond_group']
            name = request.json['name']
            return app.ds.remove_action(owner,cond_group,name)
        except ValueError as e:
            abort(400, str(e))