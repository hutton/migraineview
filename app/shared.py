import os
import re
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext.webapp import template
import webapp2
from app.migraine_statistics import generate_statistics_from_events
from app.model.account import Account

__author__ = 'simonhutton'


class Shared(webapp2.RequestHandler):
    def get(self):

        matches = re.match(
                r"/shared/(?P<key>[0-9a-z]+)",
                self.request.path)

        if matches:
            shared_link = matches.group("key")

            acc = Account.get_account_from_share_link(shared_link)

            if acc:
                attacks = acc.get_attacks_as_dict()

                response = {'data': simplejson.dumps(generate_statistics_from_events(attacks)), 'show_logout': True}

                path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
                self.response.out.write(template.render(path, response))
            else:
                self.response.status = 404
        else:
            self.response.status = 404



