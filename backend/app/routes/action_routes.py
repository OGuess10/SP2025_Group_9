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
    """
    Endpoint to upload an image file and store it as BLOB in the SQLite database.
    Expects a multipart/form-data request with:
      - 'image': the file to upload,
      - 'user_id': the ID of the user uploading the image.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]
    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        # Read image data as binary
        image_data = image_file.read()
        # Create new ImageUpload record
        new_image = ImageUpload(
            user_id=user_id,
            filename=image_file.filename,
            mimetype=image_file.mimetype,
            image_data=image_data,
            uploaded_at=datetime.datetime.utcnow(),
        )
        db.session.add(new_image)
        db.session.commit()
        return jsonify(
            {"message": "Image uploaded successfully", "image_id": new_image.id}
        ), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@action_bp.route("/get_blob/<int:image_id>", methods=["GET"])
def get_blob(image_id):
    """
    Endpoint to retrieve an image from the database by its image ID.
    This will return the image data with the appropriate MIME type.
    """
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
