from google.appengine._internal.django.utils import simplejson
from google.appengine.ext import ndb
import webapp2
from app.authentication import BaseRequestHandler
from app.migraine_statistics import generate_statistics_from_events
from app.model import account
from app.model.attack import Attack

__author__ = 'simonhutton'


class Stats(BaseRequestHandler):
    def get(self):

        if self.logged_in:
            user = self.current_user;

            attacks = user.get_attacks_as_dict()

            if len(attacks) > 0:
                self.response.out.write(simplejson.dumps(generate_statistics_from_events(attacks)))
            else:
                self.response.out.write(simplejson.dumps({}))
        else:
            self.response.out.write(simplejson.dumps({}))


class ClearAllEvents(BaseRequestHandler):
    def get(self):
        if self.logged_in:

            user = self.current_user;
            attacks = user.get_attacks()

            ndb.delete_multi(attacks)

            self.response.out.write(simplejson.dumps({}))
        else:
            self.redirect('/')