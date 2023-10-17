from flask import Flask
import os

app = Flask(__name__)
app.config['OPENROUTESERVICE_KEY'] = os.environ.get('OPENROUTESERVICE_KEY')
app.config['GOOGLEMAPS_KEY'] = os.environ.get('GOOGLEMAPS_KEY')
from . import routes