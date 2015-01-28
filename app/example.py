import os
import webapp2
from app.helper import create_start_text, create_duration_text
from app.migraine_statistics import json_to_events, generate_statistics_from_events
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext.webapp import template
from app.model.configuration import Configuration


__author__ = 'simonhutton'

class Example(webapp2.RequestHandler):

    @staticmethod
    def get_example_attacks():
        f = open('migraines.json')

        file_content = f.read()

        events = json_to_events(file_content)

        i = -1

        for event in events:
            if 'StartText' not in event:
                event['StartText'] = create_start_text(event['Start'])

            if 'DurationText' not in event:
                event['DurationText'] = create_duration_text(event['Duration'])

            event['Id'] = i
            i -= 1

        return events

    def get(self):

        events = self.get_example_attacks()

        response = generate_statistics_from_events(events)

        response['web_debug'] = Configuration.get_instance().web_debug
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


