from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class EcoAction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    icon = db.Column(db.String(50), nullable=False)
    label = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<EcoAction {self.label}>"


# eco_action_service.py
from models import EcoAction


class EcoActionService:
    @staticmethod
    def get_all_actions():
        # You can add custom logic here if needed
        eco_actions = EcoAction.query.all()
        return [
            {"id": action.id, "icon": action.icon, "label": action.label}
            for action in eco_actions
        ]

    @staticmethod
    def get_action_by_id(action_id):
        eco_action = EcoAction.query.get(action_id)
        if eco_action:
            return {
                "id": eco_action.id,
                "icon": eco_action.icon,
                "label": eco_action.label,
            }
        return None
