from google.appengine.ext import db

__author__ = 'simonhutton'


class Attack(db.Model):
    start_time = db.DateTimeProperty()
    duration = db.IntegerProperty()
    comment = db.TextProperty()
