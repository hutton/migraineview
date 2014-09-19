#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from collections import Counter
import os
import datetime
from google.appengine.ext.webapp import template
import webapp2
import json
from google.appengine._internal.django.utils import simplejson


def parse_date(param):
    if len(param) == 10:
        return datetime.datetime.strptime(param, '%Y-%m-%d')
    if len(param) >= 19:
        return datetime.datetime.strptime(param[:19], '%Y-%m-%d %H:%M:%S')

    return None


class MainHandler(webapp2.RequestHandler):
    def get(self):

        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../templates/stats_view.html')
        self.response.out.write(template.render(path, {}))


class MigraineData(webapp2.RequestHandler):
    def generate_frequencies(self, days_of_week, weekdays_counter):
        frequencies = []
        for day in days_of_week:
            if day in weekdays_counter:
                frequencies.append(weekdays_counter[day])
            else:
                frequencies.append(0)
        return frequencies

    def get(self):

        p = os.path.join(os.path.split(__file__)[0], 'migraines.json')

        f = file(p)

        contents = f.read()

        events = json.loads(contents)

        weekdays_counter = Counter()
        months_counter = Counter()

        for event in events:
            if 'Start' in event:
                event['StartDate'] = parse_date(event['Start'])
                event['Day'] = event['StartDate'].strftime('%A')
                event['Month'] = event['StartDate'].strftime('%B')

                weekdays_counter[event['Day']] += 1
                months_counter[event['Month']] += 1

        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        months_of_year = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        days_of_week_frequencies = self.generate_frequencies(days_of_week, weekdays_counter)
        months_of_year_frequencies = self.generate_frequencies(months_of_year, months_counter)

        days_data = {'daysOfWeek': days_of_week,
                     'frequencies': days_of_week_frequencies}

        months_data = {'daysOfWeek': months_of_year,
                     'frequencies': months_of_year_frequencies}

        response = {'daysOfWeek': days_data,
                    'monthsOfYear': months_data}

        self.response.out.write(simplejson.dumps(response))


app = webapp2.WSGIApplication([
                                  ('/', MainHandler),
                                  ('/migraine-data', MigraineData)
                              ], debug=True)
