import os
import re
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext.webapp import template
import webapp2
from app.example import Example
from app.migraine_statistics import generate_statistics_from_events
from app.model.account import Account

__author__ = 'simonhutton'


class Shared(webapp2.RequestHandler):
    def get(self):

        matches = re.match(
                r"/shared/(?P<key>[0-9a-z_]+)/.*",
                self.request.path)

        if matches:
            shared_link = matches.group("key")

            response = {}

            if len(shared_link) == 7:
                # Report with List
                acc = Account.get_account_from_share_link_report_and_list(shared_link)

                response['show_list'] = True

                attacks = acc.get_attacks_as_dict()

            if len(shared_link) == 8:
                # Report only
                acc = Account.get_account_from_share_link_report_only(shared_link)

                response['show_list'] = False

                attacks = acc.get_attacks_as_dict()

            if shared_link == "example_report":
                response['show_list'] = False

                attacks = Example.get_example_attacks()

            if shared_link == "example_report_and_list":
                response['show_list'] = True

                attacks = Example.get_example_attacks()

            if attacks:

                response['data'] = simplejson.dumps(generate_statistics_from_events(attacks))
                response['show_logout'] = False
                response['show_add'] = False
                response['show_options'] = False

                path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
                self.response.out.write(template.render(path, response))
            else:
                self.response.status = 404
        else:
            self.response.status = 404


