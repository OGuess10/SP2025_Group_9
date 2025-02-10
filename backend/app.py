# File with all the flask logic

from flask import Flask, jsonify, request
import database_query, database_service

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p><iframe src='https://giphy.com/embed/PSKAppO2LH56w' width='272' height='480' frameBorder='0' class='giphy-embed' allowFullScreen></iframe><img src='https://i.pinimg.com/originals/c5/52/8e/c5528e6c4bb0a0ed0b7a3fcf127c68a2.gif'>"