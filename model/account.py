from google.appengine.ext import db

__author__ = 'simonhutton'


class Account(db.Model):
    user_id = db.StringProperty()

