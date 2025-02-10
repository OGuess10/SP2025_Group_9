from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/")
def test():
    return jsonify({"message": "Test test test"})

if __name__ == '__main__':
    app.run(debug=True)