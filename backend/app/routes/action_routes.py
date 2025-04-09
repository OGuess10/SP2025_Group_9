import os
from flask import Blueprint, request, jsonify, current_app
from app.models import Action, ImageUpload
from app import db
import datetime
import base64
import time

action_bp = Blueprint("action", __name__)


# Existing endpoints (upload image to filesystem, fake API endpoints, etc.) remain here.
@action_bp.route("/upload_image", methods=["POST"])
def upload_blob():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]
    user_id = request.form.get("user_id")
    action_type = request.form.get("action_type")
    base_points = request.form.get("points")

    if not user_id or not action_type or not base_points:
        return jsonify({"error": "user_id, action_type, and points are required"}), 400

    try:
        # Save image
        image_data = image_file.read()
        new_image = ImageUpload(
            user_id=user_id,
            filename=image_file.filename,
            mimetype=image_file.mimetype,
            image_data=image_data,
            uploaded_at=datetime.datetime.utcnow(),
        )
        db.session.add(new_image)

        # Log action with bonus points
        total_points = int(base_points) + 5  # 🎉 Add 5 bonus points

        new_action = Action(
            user_id=user_id,
            action_type=action_type,
            points_earned=total_points,
            timestamp=datetime.datetime.utcnow(),
        )
        db.session.add(new_action)

        # Also update user's point total
        from app.models import User

        user = User.query.get(user_id)
        if user:
            user.points += total_points

        db.session.commit()

        return jsonify(
            {
                "message": "Image uploaded and action logged with bonus points!",
                "image_id": new_image.id,
                "action_points": total_points,
            }
        ), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@action_bp.route("/get_images/<int:image_id>", methods=["GET"])
def get_blob(image_id):
    image_record = ImageUpload.query.get(image_id)
    if not image_record:
        return jsonify({"error": "Image not found"}), 404

    from flask import Response

    return Response(image_record.image_data, mimetype=image_record.mimetype)


@action_bp.route("/get_recent_activity", methods=["GET"])
def get_recent_activity():
    # For demonstration, fetch the 10 most recent actions.
    recent_actions = Action.query.order_by(Action.timestamp.desc()).limit(10).all()
    data = []
    for action in recent_actions:
        data.append(
            {
                "user_id": action.user_id,
                "user_name": action.user.user_name if action.user else "",
                "action_type": action.action_type,
                "points_earned": action.points_earned,
                "timestamp": action.timestamp.isoformat(),
            }
        )
    return jsonify({"recent_activity": data}), 200


@action_bp.route("/get_activity", methods=["GET"])
def get_activity():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    try:
        # Query all actions for this user
        actions = Action.query.filter_by(user_id=user_id).all()

        # Group points by date
        activity_summary = {}
        for action in actions:
            date_str = action.timestamp.strftime("%Y-%m-%d")
            if date_str not in activity_summary:
                activity_summary[date_str] = 0
            activity_summary[date_str] += action.points_earned

        return jsonify({"data": activity_summary}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@action_bp.route("/log_action", methods=["POST"])
def log_action():
    data = request.get_json()
    user_id = data.get("user_id")
    action_type = data.get("action_type")
    points = data.get("points")
    timestamp_str = data.get("timestamp")

    if not user_id or not action_type or points is None:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Use provided timestamp if available, else use now
        if timestamp_str:
            timestamp = datetime.datetime.fromisoformat(timestamp_str)
        else:
            timestamp = datetime.datetime.utcnow()

        new_action = Action(
            user_id=user_id,
            action_type=action_type,
            points_earned=points,
            timestamp=timestamp,
        )
        db.session.add(new_action)
        db.session.commit()
        return jsonify({"message": "Action logged"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@action_bp.route("/get_action_count", methods=["GET"])
def get_action_count():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    try:
        count = Action.query.filter_by(user_id=user_id).count()
        return jsonify({"count": count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# List all photos uploaded by a user
@action_bp.route("/get_user_photos", methods=["GET"])
def get_user_photos():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    photos = (
        ImageUpload.query.filter_by(user_id=user_id)
        .order_by(ImageUpload.uploaded_at.desc())
        .all()
    )
    photo_data = [
        {"id": p.id, "filename": p.filename, "uploaded_at": p.uploaded_at.isoformat()}
        for p in photos
    ]

    return jsonify({"photos": photo_data}), 200
