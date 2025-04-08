import datetime
from . import db


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
    status = db.Column(db.String(20))  # e.g., "Pending", "Accepted"
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class Action(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    action_type = db.Column(db.String(50))
    points_earned = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user = db.relationship("User", backref=db.backref("actions"))


class ImageUpload(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    filename = db.Column(db.String(100))
    mimetype = db.Column(db.String(50))
    image_data = db.Column(db.LargeBinary)
    uploaded_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
