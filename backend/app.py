from flask import Flask, jsonify, request, session
from flask_cors import CORS
from supabase_config import supabase, supabase_service_role
import os
from dotenv import load_dotenv
import jwt
import requests
import random
from datetime import datetime, timedelta


load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:8081"])
app.secret_key = os.getenv("SECRET_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")


def verify_supabase_jwt(token):
    """Verify JWT from Supabase."""
    try:
        decoded_token = jwt.decode(
            token, os.getenv("SUPABASE_JWT_SECRET"), algorithms=["HS256"]
        )
        return decoded_token
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None  #


# example: /get_user?user_id=0
@app.route("/get_user")
def get_user():
    user_id = request.args.get("user_id", "")
    if not user_id:
        return jsonify({"error": "Missing required parameters"}), 400
    if user_id == "0":
        user_name = "TestUser"
        points = 500
        icon = "koala"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id == "1":
        user_name = "Friend 1"
        points = 200
        icon = "koala"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id == "2":
        user_name = "Friend 2"
        points = 219
        icon = "kangaroo"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id == "3":
        user_name = "Friend 3"
        points = 783
        icon = "sloth"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id == "4":
        user_name = "Friend 4"
        points = 537
        icon = "koala"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    elif user_id == "5":
        user_name = "Friend 5"
        points = 1029
        icon = "kangaroo"
        return jsonify({"user_name": user_name, "points": points, "icon": icon}), 200
    else:
        return jsonify({"error": "Could not find matching user"}), 400


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


def verify_token(token):
    try:
        # Decoding the JWT using the Supabase secret
        decoded_token = supabase.auth.api.decode_jwt(token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None


def generate_otp():
    return str(random.randint(100000, 999999))


def store_otp_in_db(email, otp):
    expiration_time = datetime.utcnow() + timedelta(minutes=10)
    data = {"email": email, "otp": otp, "expires_at": expiration_time}
    response = supabase.table("otp_table").upsert(data)
    return response


def get_current_user():
    """Extracts and verifies Supabase user token from request headers."""
    auth_header = request.headers.get("Authorization", None)
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    decoded_token = verify_supabase_jwt(token)
    if not decoded_token:
        return None  # Unauthorized

    user_id = decoded_token.get("sub")  # Supabase user ID
    return user_id  # You can now store this in your database/session


@app.route("/protected", methods=["GET"])
def protected_route():
    user_id = get_current_user()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    session["user_id"] = user_id
    return jsonify({"message": "Welcome!", "user_id": user_id})


if __name__ == "__main__":
    app.run(debug=True)
