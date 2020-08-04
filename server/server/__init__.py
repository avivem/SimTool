from flask import Flask
from flask_cors import CORS, cross_origin
from .models.simtool_datastore import DataStore

app = Flask(__name__)
app.secret_key = "REPLACE_SECRET_KEY_LATER"
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config['CORS_HEADERS'] = 'Content-Type'

app.ds = DataStore()

import server.views

if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=5000)