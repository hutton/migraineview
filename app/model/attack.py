from google.appengine.ext.ndb import Model, DateTimeProperty, IntegerProperty, TextProperty

__author__ = 'simonhutton'


class Attack(Model):
    start_time = DateTimeProperty()
    duration = IntegerProperty()
    comment = TextProperty()

    start_text = TextProperty()
    duration_text = TextProperty()
