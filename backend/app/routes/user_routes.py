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
        if not user.icon:
            user.icon = "default"
            db.session.commit()
        return jsonify(
            {
                "user_id": user.user_id,
                "user_name": user.user_name,
                "email": user.email,
                "points": user.points,
                "icon": user.icon if user.icon else "default",

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
            "icon": user.icon if user.icon else "default",

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
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    friendships = Friendship.query.filter(
        (Friendship.user_id == user_id) | (Friendship.friend_id == user_id)
    ).all()

    data = []
    for f in friendships:
        data.append(
            {
                "id": f.id,
                "user_id": f.user_id,
                "friend_id": f.friend_id,
                "status": f.status,
                "created_at": f.created_at.isoformat(),
            }
        )

    return jsonify({"friendships": data}), 200


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


""" 
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
    return jsonify({"users": users_data}), 200 """


# Handles friendship stuff
@user_bp.route("/send_friend_request", methods=["POST"])
def send_friend_request():
    data = request.get_json()
    user_id = data.get("user_id")
    friend_id = data.get("friend_id")

    if not user_id or not friend_id:
        return jsonify({"error": "Missing user_id or friend_id"}), 400

    # Check for existing friendship
    existing = Friendship.query.filter_by(user_id=user_id, friend_id=friend_id).first()
    if existing:
        return jsonify({"message": "Friend request already sent or exists."}), 400

    friendship = Friendship(user_id=user_id, friend_id=friend_id, status="Pending")
    db.session.add(friendship)
    db.session.commit()

    return jsonify({"message": "Friend request sent."}), 200


@user_bp.route("/accept_friend_request", methods=["POST"])
def accept_friend_request():
    data = request.get_json()
    friendship_id = data.get("friendship_id")

    friendship = Friendship.query.get(friendship_id)
    if not friendship:
        return jsonify({"error": "Friend request not found"}), 404

    friendship.status = "Accepted"
    db.session.commit()
    return jsonify({"message": "Friend request accepted"}), 200


@user_bp.route("/deny_friend_request", methods=["POST"])
def deny_friend_request():
    data = request.get_json()
    friendship_id = data.get("friendship_id")

    friendship = Friendship.query.get(friendship_id)
    if not friendship:
        return jsonify({"error": "Friend request not found"}), 404

    db.session.delete(friendship)
    db.session.commit()
    return jsonify({"message": "Friend request denied"}), 200


@user_bp.route("/unfriend", methods=["POST"])
def unfriend():
    data = request.get_json()
    user_id = data.get("user_id")
    friend_id = data.get("friend_id")

    friendship = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id))
        | ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
    ).first()

    if friendship:
        db.session.delete(friendship)
        db.session.commit()
        return jsonify({"message": "Unfriended"}), 200

    return jsonify({"error": "Friendship not found. user_id=" + str(user_id) + " friend id=" + str(friend_id)}), 404


@user_bp.route("/get_accepted_friends", methods=["GET"])
def get_accepted_friends():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    friendships = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id))
        & (Friendship.status == "Accepted")
    ).all()

    friend_ids = []
    for f in friendships:
        if str(f.user_id) == user_id:
            friend_ids.append(f.friend_id)
        else:
            friend_ids.append(f.user_id)

    return jsonify({"friend_ids": friend_ids}), 200
