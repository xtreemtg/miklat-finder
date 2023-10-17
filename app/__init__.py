from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

app = Flask(__name__)
app.config['OPENROUTESERVICE_KEY'] = os.environ.get('OPENROUTESERVICE_KEY')
app.config['GOOGLEMAPS_KEY'] = os.environ.get('GOOGLEMAPS_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///miklat.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
from . import routes, models