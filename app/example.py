import os
import webapp2
from app.migraine_statistics import json_to_events, generate_statistics_from_events
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext.webapp import template


__author__ = 'simonhutton'

class Example(webapp2.RequestHandler):

    @staticmethod
    def get_example_attacks():
        f = open('migraines.json')

        file_content = f.read()

        return json_to_events(file_content)

    def get(self):

        events = self.get_example_attacks()

        response = generate_statistics_from_events(events)

        response['show_logout'] = False
        response['share_report'] = "example_report"
        response['share_report_and_list'] = "example_report_and_list"
        response['show_add'] = True
        response['show_options'] = True
        response['show_list'] = True
        response['example'] = True

        response['data'] = simplejson.dumps(response)

        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
        self.response.out.write(template.render(path, response))


