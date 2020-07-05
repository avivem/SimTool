from flask import Flask, render_template, abort, jsonify, request, redirect, url_for
app = Flask(__name__)

@app.route('/') 
def root():
    return 'Hello, World!'

@app.route('/api/create_node/<type>/<name>', methods=["POST"])
def create_node(type,name):
    