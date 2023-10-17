from flask import render_template, request, jsonify
from app import app
from miklat_finder import get_nearest_mamads


@app.route("/")
def home():
    return render_template("index.html", key=app.config['GOOGLEMAPS_KEY'])


@app.route("/nearest-mamads", methods=['POST'])
def nearest_mamads():
    data = request.get_json()
    if data is not None:
        # Process the JSON data
        result = get_nearest_mamads(data["start_coords"], app.config['OPENROUTESERVICE_KEY'],
                                    data.get("quick", True),
                                    data.get("numResults", 5))
        return jsonify(result), 200
    else:
        return jsonify({'error': 'Invalid JSON'}), 400

