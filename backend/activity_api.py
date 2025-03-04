from flask import Flask, jsonify
from eco_action_service import EcoActionService

app = Flask(__name__)


@app.route("/api/eco-actions", methods=["GET"])
def get_eco_actions():
    eco_actions = EcoActionService.get_all_actions()
    return jsonify(eco_actions), 200


@app.route("/api/eco-actions/<int:action_id>", methods=["GET"])
def get_eco_action(action_id):
    eco_action = EcoActionService.get_action_by_id(action_id)
    if eco_action:
        return jsonify(eco_action), 200
    return jsonify({"error": "Action not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
