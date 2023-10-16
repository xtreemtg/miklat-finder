from flask import Flask, render_template, request, jsonify
from miklat_finder import get_nearest_mamads
import os

app = Flask(__name__)

app.config['OPENROUTESERVICE_KEY'] = os.environ.get('OPENROUTESERVICE_KEY')
app.config['GOOGLEMAPS_KEY'] = os.environ.get('GOOGLEMAPS_KEY')


@app.route("/")
def home():
    return render_template("index.html", key=app.config['GOOGLEMAPS_KEY'])


@app.route("/nearest-mamads", methods=['POST'])
def nearest_mamads():
    if request.method == 'POST':
        data = request.get_json()
        if data is not None:
            # Process the JSON data
            result = get_nearest_mamads(data["start_coords"], app.config['OPENROUTESERVICE_KEY'],
                                        data.get("quick", True),
                                        data.get("numResults", 5))
            return jsonify(result), 200
        else:
            return jsonify({'error': 'Invalid JSON'}), 400


if __name__ == "__main__":
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000, host="0.0.0.0")
