from flask import Blueprint, request, jsonify, session
from datetime import datetime, timedelta
import random
from app.models import User
from app import db, mail
from flask_mail import Message

auth_bp = Blueprint("auth", __name__)


def generate_otp():
    return str(random.randint(100000, 999999))


@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=10)

    user = User.query.filter_by(email=email).first()

    if user:
        # Only update OTP, not username
        user.otp = otp
        user.otp_expiry = expiry
    else:
        # Create a new user with unique username
        base_username = email.split("@")[0]
        username = base_username
        suffix = 1
        while User.query.filter_by(user_name=username).first():
            username = f"{base_username}{suffix}"
            suffix += 1

        user = User(
            email=email,
            otp=otp,
            otp_expiry=expiry,
            user_name=username,
            points=0,
            icon="",
        )
        db.session.add(user)

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


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.otp == otp and datetime.utcnow() < user.otp_expiry:
        session["user_id"] = user.user_id
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


@auth_bp.route("/change_username", methods=["POST"])
def change_username():
    data = request.get_json()
    user_id = data.get("user_id")
    new_username = data.get("new_username", "").strip()
    new_icon = data.get("new_icon")  # Can be default icon name or JSON string for custom avatar

    if not user_id or not new_username:
        return jsonify({"error": "Missing user_id or new_username"}), 400

    new_username = new_username.lower()
    if len(new_username) < 3 or len(new_username) > 30:
        return jsonify({"error": "Username must be between 3 and 30 characters"}), 400
    if not new_username.isalnum():
        return jsonify({"error": "Username must be alphanumeric only"}), 400

    existing_user = User.query.filter_by(user_name=new_username).first()
    if existing_user and existing_user.user_id != int(user_id):
        return jsonify({"error": "Username already taken"}), 409

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.user_name = new_username
    if new_icon is not None:
        user.icon = new_icon  # Store either default animal or JSON string of avatar config

    db.session.commit()

    return jsonify({
        "message": "Username and icon updated successfully",
        "user_name": user.user_name,
        "icon": user.icon
    }), 200