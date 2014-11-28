from google.appengine._internal.django.utils import simplejson
from google.appengine.ext import db
import webapp2
from app.migraine_statistics import generate_statistics_from_events
from app.model import account
from app.model.attack import Attack

__author__ = 'simonhutton'


class Stats(webapp2.RequestHandler):
    def get(self):
        acc = account.Account.get_or_create_account()

        if acc:
            attacks = acc.get_attacks()
            events = [{'Start': attack.start_time, 'Duration': attack.duration, 'Comment': attack.comment} for attack in
                      attacks]

            if len(events) > 0:
                self.response.out.write(simplejson.dumps(generate_statistics_from_events(events)))
            else:
                self.response.out.write(simplejson.dumps({}))
        else:
            self.response.out.write(simplejson.dumps({}))


class ClearAllEvents(webapp2.RequestHandler):
    def get(self):
        acc = account.Account.get_or_create_account()

        if acc:
            attacks = acc.get_attacks()

            db.delete(attacks)

        self.response.out.write(simplejson.dumps({}))