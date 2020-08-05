from simtool_engine import app
from flask import Blueprint, request, abort, jsonify
from simtool_engine.views import views_nodes, views_blueprints, views_containers, views_logic

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

