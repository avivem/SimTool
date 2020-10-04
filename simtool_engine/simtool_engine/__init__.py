from flask import Flask
from flask_cors import CORS, cross_origin
from simtool_engine.services import DataStore
from waitress import serve
import threading

app = Flask(__name__)
app.secret_key = "REPLACE_SECRET_KEY_LATER"
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config['CORS_HEADERS'] = 'Content-Type'

app.ds = DataStore()

import simtool_engine.views as views
app.register_blueprint(views.views_nodes.nodes_blueprint)
app.register_blueprint(views.views_blueprints.blueprints_blueprint)
app.register_blueprint(views.views_containers.containers_blueprint)
app.register_blueprint(views.views_logic.logic_blueprint)
""" server = threading.Thread(target=serve, kwargs={"app": app, "host": '0.0.0.0', "port" : 5000})
server.start() """
#serve(app, host='0.0.0.0', port=5000)
if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=5000)