from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail, Message
import random
import sqlite3
import datetime
from dotenv import load_dotenv
import os
from sqlalchemy import Column, Integer, String, DateTime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


load_dotenv()

app = Flask(__name__)
CORS(app)


# Setup secret key for session
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "a_secret_key_here")

# Database setup
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USERNAME"] = "ecootp1@gmail.com"
app.config["MAIL_PASSWORD"] = os.getenv("GMAIL_PW")
app.config["MAIL_DEFAULT_SENDER"] = "ecootp1@gmail.com"

app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False

db = SQLAlchemy(app)
mail = Mail(app)


# Database setup
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    otp_expiry = db.Column(db.DateTime, nullable=False)
    user_name = db.Column(db.String(50))
    points = db.Column(db.Integer, default=0)
    icon = db.Column(db.String(50))


class Friendship(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    friend_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    status = db.Column(db.String(20))  # Pending, Accepted, ...
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class Action(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    action_type = db.Column(db.String(50))
    points_earned = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user = db.relationship("User", backref=db.backref("actions"))


with app.app_context():
    db.create_all()


def generate_otp():
    return str(random.randint(100000, 999999))


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend is working!"}), 200


@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = generate_otp()
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

    user = User.query.filter_by(
        email=email
    ).first()  # This to check if user already exists
    if user:
        user.otp = otp
        user.otp_expiry = expiry
        db.session.commit()

    try:
        msg = Message(
            subject="Welcome! Here is your OTP Code",
            recipients=[email],
            body=f"Your OTP code is: {otp}. It will expire in 10 minutes.",
        )
        mail.send(msg)
        return jsonify({"message": "OTP sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Always return a JSON response with a success message
    return jsonify({"message": "OTP sent successfully"}), 200


@app.route("/verify_otp", methods=["POST"])
def verify_otp():
    try:
        data = request.json
        email = data.get("email")
        otp = data.get("otp")

        if not email or not otp:
            return jsonify({"error": "Email and OTP are required"}), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            # initialize the user with default values
            user = User(
                email=email,
                otp=otp,
                otp_expiry=datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
                user_name="",
                points=0,
            )
            db.session.add(user)
            db.session.commit()

        if (
            user.otp == otp
            and user.otp_expiry
            and datetime.datetime.utcnow() < user.otp_expiry
        ):
            session["user_id"] = user.user_id  # Store user ID in the session
            return jsonify(
                {
                    "message": "Login successful",
                    "user": {
                        "user_id": user.user_id,
                        "user_name": user.user_name,
                        "points": user.points,
                        "icon": user.icon,
                    },
                }
            ), 200
        else:
            return jsonify({"error": "Invalid or expired OTP"}), 400
    except Exception as e:
        # Log the error and return a generic error response
        print(f"Error: {str(e)}")
        return jsonify(
            {"error": "An unexpected error occurred. Please try again later."}
        ), 500


@app.route("/get_user", methods=["GET"])
def get_user():
    user_id = request.args.get("user_id", "")

    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    user = User.query.get(user_id)

    if user:
        return jsonify(
            {
                "user_id": user.user_id,
                "user_name": user.user_name,
                "email": user.email,
                "points": user.points,
                "icon": user.icon,
            }
        ), 200
    else:
        return jsonify({"error": "User not found"}), 404


@app.route("/get_all_users", methods=["GET"])
def get_all_users():
    users = User.query.all()
    users_data = [
        {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "points": user.points,
            "icon": user.icon,
        }
        for user in users
    ]
    return jsonify(users_data), 200


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)  # Remove the session data
    return jsonify({"message": "Logged out"}), 200


@app.route("/update_points", methods=["POST"])
def update_points():
    data = request.json
    user_id = data.get("user_id")
    points = data.get("points")

    print(f"Received data: user_id={user_id}, points={points}")

    if not user_id or points is None:
        return jsonify({"error": "Missing user_id or points parameter"}), 400

    user = User.query.get(user_id)

    if user:
        print(f"Updating user {user_id} points from {user.points} to {points}")
        user.points = points
        db.session.commit()
        print(f"Updated user {user_id} points to {points}")
        return jsonify({"success": True}), 200
    else:
        print(f"User {user_id} not found")
        return jsonify({"error": "User not found"}), 404
<<<<<<< Updated upstream


if __name__ == "__main__":
    app.run(debug=True)
=======


# ---------------------------------------
# FAKE API
# ---------------------------------------


# example: /get_activity?user_id=0
@app.route("/get_activity")
def get_activity():
    user_id = request.args.get("user_id", "")
    if not user_id:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == "0":
        data = {
            "2025-01-01": 10,
            "2025-01-05": 15,
            "2025-02-10": 17,
            "2025-03-15": 70,
            "2025-03-20": 100,
        }
        return jsonify({"data": data}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400


# example: /get_friends?user_id=0
@app.route("/get_friends")
def get_friends():
    user_id = request.args.get("user_id", "")
    if not user_id:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == "0":
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
    if user_id == "0":
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
    if user_id == "0":
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
    if user_id == "0":
        # add activity
        return jsonify({"message": "Activity added succesfully"}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400


# Params: user_id
@app.route("/get_activities")
def get_activities():
    user_id = request.args.get("user_id", "")
    if not user_id:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == "0":
        data = {
            "recycled": ["2025-01-10", "picture.png"],
            "recycled": ["2025-01-15", "picture.png"],
            "litter_cleanup": ["2025-01-30", ""],
        }
        return jsonify({"data": data}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400


# Params: name
@app.route("/search")
def search():
    name = request.args.get("user_id", "")
    if not name:
        return jsonify({"error": "Missing required paramaters"}), 400
    # search for name in db
    data = {
        "user1": [1, "user1", 50],
        "user2": [2, "user2", 75],
        "user3": [3, "user3", 20],
    }
    return jsonify({"data": data}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
>>>>>>> Stashed changes
