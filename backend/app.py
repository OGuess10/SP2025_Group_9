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
CORS(app, origins=["exp://192.168.0.149:8081"])


# Setup secret key for session
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "a_secret_key_here")

# Database setup
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:////Users/mijung/Code/SP2025_Group_9/backend/database.db"
)


app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USERNAME"] = "ecootp1@gmail.com"
app.config["MAIL_PASSWORD"] = "wjhovynavpwnxgkz"
app.config["MAIL_DEFAULT_SENDER"] = "ecootp1@gmail.com"

app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False

db = SQLAlchemy(app)
mail = Mail(app)


# User model
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), nullable=False)
    otp = Column(String(6), nullable=False)
    otp_expiry = Column(DateTime, nullable=False)
    user_name = Column(String(50))
    points = Column(Integer, default=0)
    icon = Column(String(50))
    plant_number = Column(String(50))


with app.app_context():
    db.create_all()

# Initialize Database
with app.app_context():
    db.create_all()


def generate_otp():
    return str(random.randint(100000, 999999))


@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = generate_otp()
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

    user = User.query.filter_by(email=email).first()  # This line
    if user:
        user.otp = otp
        user.otp_expiry = expiry
        db.session.commit()
    else:
        new_user = User(email=email, otp=otp, otp_expiry=expiry)
        db.session.add(new_user)
        db.session.commit()

    try:
        msg = Message(
            subject="Your OTP Code",
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
    data = request.json
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    user = User.query.filter_by(email=email).first()

    if (
        user
        and user.otp == otp
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
                    "plant_number": user.plant_number,
                },
            }
        ), 200
    else:
        return jsonify({"error": "Invalid or expired OTP"}), 400


@app.route("/get_user", methods=["GET"])
def get_user():
    user_id = session.get("user_id")
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify(
                {
                    "user_id": user.user_id,
                    "user_name": user.user_name,
                    "points": user.points,
                    "icon": user.icon,
                    "plant_number": user.plant_number,
                }
            ), 200
        else:
            return jsonify({"error": "User not found"}), 404
    else:
        return jsonify({"error": "User not logged in"}), 401


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)  # Remove the session data
    return jsonify({"message": "Logged out"}), 200


if __name__ == "__main__":
    app.run(debug=True)
