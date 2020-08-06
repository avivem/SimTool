from simtool_engine import app
from flask import Blueprint, request, abort, jsonify
from simtool_engine.views import views_nodes, views_blueprints, views_containers, views_logic

from pprint import pprint as pp


@app.route('/api/run/<int:until>/', methods=["GET"])
@app.route('/api/run/', methods=["GET"])
def run(until=30000):
    if app.ds.end_time != None and until <= app.ds.end_time:
        abort(400, f"Please choose a run time past {until} or restart the simulation.")
    return jsonify(app.ds.run(until))

@app.route('/api/run/summary/', methods=["GET"])
def route_summary():
    try:
        return jsonify(app.ds.summary())
    except ValueError as e:
        abort(400, str(e))

@app.route('/api/reset/<int:start>/', methods=["DELETE"])
@app.route('/api/reset/', methods=["DELETE"])
def route_reset(start=0):
    try:
        return app.ds.reset(start)
    except ValueError as e:
        return e

@app.route('/api/clean/', methods=["DELETE"])
def route_clean():
    try:
        return app.ds.clean()
    except ValueError as e:
        return e

@app.route('/api/store/', methods = ["POST", "GET"])
def route_store():
    if request.method == "GET":
        pp(app.ds.serialize())
        return jsonify(app.ds.serialize())

