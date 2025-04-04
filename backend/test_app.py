from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)  # Set the logging level

@app.route("/")
@cross_origin(allow_headers=['Content-Type'])
def home():
    app.logger.info("Request received at /")  
    return jsonify({"message": "Backend is working!"}), 200

# example: /add_user?user_id=0&user_name=TestUser
@app.route("/add_user")
def add_user():
    data = request.get_json()
    user_id = data.get("user_id")
    user_name = data.get("user_name")
    points = 0
    if not user_id or not user_name:
        return jsonify({"error": "Missing required parameters"}), 400
    else:
        return jsonify({"user_name": user_name, "points": points}), 200

# Params: user_id
@app.route("/remove_user")
def remove_user():
    user_id = request.args.get('user_id', '')
    if (not user_id):
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id=='0':
        # remove user from db
        return jsonify({"message": "User succesfully removed"}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400

# example: /get_user?user_id=0
@app.route("/get_user")
def get_user():
    user_id = request.args.get('user_id', '')
    if (not user_id):
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id=='0':
        user_name = "TestUser"
        points = 500
        icon = "koala"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id=='1':
        user_name = "Friend 1"
        points = 200
        icon = "koala"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id=='2':
        user_name = "Friend 2"
        points = 219
        icon = "kangaroo"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id=='3':
        user_name = "Friend 3"
        points = 783
        icon = "sloth"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id=='4':
        user_name = "Friend 4"
        points = 537
        icon = "koala"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id=='5':
        user_name = "Friend 5"
        points = 1029
        icon = "kangaroo"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400

# example: /get_activity?user_id=0
@app.route("/get_activity")
def get_activity():
    user_id = request.args.get('user_id', '')
    if (not user_id):
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id=='0':
        data = {
            "2025-01-01": 10,
            "2025-01-05": 15,
            "2025-02-10": 17,
            "2025-03-15": 70,
            "2025-03-20": 100
        }
        return jsonify({"data": data}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400
    
# example: /get_friends?user_id=0
@app.route("/get_friends")
def get_friends():
    user_id = request.args.get('user_id', '')
    if not user_id:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == '0':
        data = [1, 2, 3, 4, 5]
        return jsonify({"friend_ids": data}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400

# Params: user_id, friend_id
@app.route("/add_friend")
def add_friend():
    data = request.get_json()
    user_id = data.get("user_id")
    friend_id = data.get("friend_id")
    if not user_id or not friend_id:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == '0':
        # add friend_id to list of user friends
        return jsonify({"message": "Friend added succesfully"}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400

# Params: user_id, friend_id
@app.route("/remove_friend")
def remove_friend():
    data = request.get_json()
    user_id = data.get("user_id")
    friend_id = data.get("friend_id")
    if not user_id or not friend_id:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == '0':
        # remove friend_id from list of user friends
        return jsonify({"message": "Friend removed succesfully"}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400
    
# Params: user_id, activity
@app.route("/add_activity")
def add_activity():
    data = request.get_json()
    user_id = data.get("user_id")
    activity = data.get("activity")
    if not user_id or not activity:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == '0':
        # add activity
        return jsonify({"message": "Activity added succesfully"}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400

# Params: user_id
@app.route("/get_activities")
def get_activities():
    user_id = request.args.get('user_id', '')
    if not user_id:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == '0':
        data = {
            "recycled": ["2025-01-10", "picture.png"],
            "recycled": ["2025-01-15", "picture.png"],
            "litter_cleanup": ["2025-01-30", ""]
        }
        return jsonify({"data": data}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400

# Params: name
@app.route("/search")
def search():
    name = request.args.get('user_id', '')
    if not name:
        return jsonify({"error": "Missing required paramaters"}), 400
    # search for name in db
    data = {
        "user1": [1, "user1", 50],
        "user2": [2, "user2", 75],
        "user3": [3, "user3", 20]
    }
    return jsonify({"data": data}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=6001, debug=True)
