from flask import Blueprint, request, jsonify, session
from app.models import User, Friendship
from app import db

user_bp = Blueprint("user", __name__)


@user_bp.route("/get_user", methods=["GET"])
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


@user_bp.route("/get_all_users", methods=["GET"])
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


@user_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"}), 200


@user_bp.route("/update_points", methods=["POST"])
def update_points():
    data = request.get_json()
    user_id = data.get("user_id")
    points = data.get("points")

    if not user_id or points is None:
        return jsonify({"error": "Missing user_id or points parameter"}), 400

    user = User.query.get(user_id)
    if user:
        user.points = points
        db.session.commit()
        return jsonify({"success": True}), 200
    else:
        return jsonify({"error": "User not found"}), 404


@user_bp.route("/get_friends", methods=["GET"])
def get_friends():
    user_id = request.args.get("user_id", "")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    matching_friendships = Friendship.query.filter(Friendship.user_id == user_id).all()
    friend_ids = [f.friend_id for f in matching_friendships]
    # Always return a JSON with friend_ids, even if empty.
    return jsonify({"friend_ids": friend_ids}), 200


@user_bp.route("/get_all_leaderboard", methods=["GET"])
def get_all_leaderboard():
    users = User.query.order_by(User.points.desc()).all()
    users_data = [
        {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "points": user.points,
            "icon": user.icon,
        }
        for user in users
    ]
    return jsonify({"users": users_data}), 200


@user_bp.route("/get_friends_leaderboard", methods=["GET"])
def get_friends_leaderboard():
    user_id = request.args.get("user_id", "")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    # Fetch friend IDs
    matching_friendships = Friendship.query.filter_by(user_id=user_id).all()
    friend_ids = [f.friend_id for f in matching_friendships]

    # Also include the current user in the leaderboard
    friend_ids.append(int(user_id))

    users = (
        User.query.filter(User.user_id.in_(friend_ids))
        .order_by(User.points.desc())
        .all()
    )
    users_data = [
        {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "points": user.points,
            "icon": user.icon,
        }
        for user in users
    ]
    return jsonify({"users": users_data}), 200
