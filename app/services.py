import logging
import traceback
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext import ndb
import webapp2
from app.authentication import BaseRequestHandler
from app.migraine_statistics import generate_statistics_from_events

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

            try:
                user = self.current_user;
                attacks = user.get_attacks()

                ndb.delete_multi([attack.key for attack in attacks])

                self.response.out.write(simplejson.dumps({'message': "All attacks cleared."}))
            except Exception as e:

                trace = traceback.format_exc()

                logging.error(e.message)
                logging.error(trace)

                self.response.set_status(500)
                self.response.out.write(simplejson.dumps({'message': "Clear attacks failed.  Sorry!  We're looking at it."}))

        else:
            self.redirect('/')