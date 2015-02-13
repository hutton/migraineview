from google.appengine.ext.ndb import Model, DateTimeProperty, IntegerProperty, TextProperty

__author__ = 'simonhutton'


class Tweet(Model):
    message = TextProperty()
    priority = IntegerProperty()

    created = DateTimeProperty(auto_now_add=True)
    sent = DateTimeProperty()
