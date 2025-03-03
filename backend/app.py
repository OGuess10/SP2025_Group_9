from flask import Flask, jsonify, request, session
from flask_cors import CORS
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
        print("Decoded token:", decoded_token)
        return decoded_token
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


@app.route("/protected", methods=["GET"])
def protected_route():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    decoded_token = verify_supabase_jwt(token)
    if not decoded_token:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_id = decoded_token.get("sub")  # This is the user ID
    return jsonify({"message": "Welcome!", "user_id": user_id})


if __name__ == "__main__":
    app.run(debug=True)
