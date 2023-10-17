from app import db


class Miklat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    name_hebrew = db.Column(db.String(100))
    address = db.Column(db.String(500))
    address_hebrew = db.Column(db.String(500))
    lat = db.Column(db.Float, nullable=False)
    long = db.Column(db.Float, nullable=False)
    is_public = db.Column(db.Boolean)
    size = db.Column(db.Float)
    description = db.Column(db.Text)
    comments = db.Column(db.Text)
    city_id = db.Column(db.Integer)
    type_id = db.Column(db.Integer, db.ForeignKey('miklat_type.id'))
    miklat_type = db.relationship('MiklatType', backref='miklat', uselist=False)


class MiklatType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

