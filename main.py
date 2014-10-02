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


def generate_frequencies_response(keys, weekdays_counter):
    frequencies = []
    for day in keys:
        if day in weekdays_counter:
            frequencies.append(weekdays_counter[day])
        else:
            frequencies.append(0)

    return frequencies


def fetch_start_date(args):
    return args['StartDate']


def find_average_days_between_event(events):
    first_date = min(events, key=fetch_start_date)
    last_date = max(events, key=fetch_start_date)

    duration = last_date['StartDate'] - first_date['StartDate']

    average_days_between_event = float(duration.days) / len(events)

    return average_days_between_event


def add_month(datetime, months):
    pass


def get_month_years(first_date, last_date):
    current_month_year = first_date
    month_years = []

    while current_month_year <= last_date:
        month_years.append(current_month_year.strftime('%m/%y'))

        add_month(current_month_year, 1)

    return month_years


class MigraineData(webapp2.RequestHandler):
    def get(self):

        p = os.path.join(os.path.split(__file__)[0], 'migraines.json')

        f = file(p)

        contents = f.read()

        events = json.loads(contents)

        first_date = min(events, key=fetch_start_date)
        last_date = max(events, key=fetch_start_date)

        weekdays_counter = Counter()
        months_counter = Counter()
        hours_counter = Counter()
        years_counter = Counter()
        month_year_counter = Counter()

        for event in events:
            if 'Start' in event:
                event['StartDate'] = parse_date(event['Start'])
                event['Day'] = event['StartDate'].strftime('%A')
                event['Month'] = event['StartDate'].strftime('%B')
                event['Year'] = str(event['StartDate'].year)
                event['MonthYear'] = event['StartDate'].strftime('%m/%y')

                hour = event['StartDate'].hour

                event['Hour'] = "%02d:00" % (0 if hour == 23 else hour if hour % 2 == 0 else hour + 1)

                weekdays_counter[event['Day']] += 1
                months_counter[event['Month']] += 1
                hours_counter[event['Hour']] += 1
                years_counter[event['Year']] += 1
                month_year_counter[event['MonthYear']] += 1

        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        months_of_year = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                          'October', 'November', 'December']

        hours_of_day = ["%02d:00" % (hour * 2) for hour in range(12)]

        years = sorted(list(years_counter))

        month_years = get_month_years(first_date, last_date)

        weekdays_year_counters = {}
        months_year_counters = {}

        for event in events:
            if event['Year'] not in weekdays_year_counters:
                weekdays_year_counters[event['Year']] = Counter()
                months_year_counters[event['Year']] = Counter()

            weekdays_year_counters[event['Year']][event['Day']] += 1
            months_year_counters[event['Year']][event['Month']] += 1

        days_data = {'title': 'Days of week',
                     'keys': days_of_week,
                     'frequencies': [generate_frequencies_response(days_of_week, weekdays_counter)]}
        months_data = {'title': 'Month of year',
                       'keys': months_of_year,
                       'frequencies': [generate_frequencies_response(months_of_year, months_counter)]}
        hours_data = {'title': 'Hours of the day',
                      'keys': hours_of_day,
                      'frequencies': [generate_frequencies_response(hours_of_day, hours_counter)]}
        years_data = {'title': 'Yearly trend',
                      'keys': years,
                      'frequencies': [generate_frequencies_response(years, years_counter)]}

        days_by_year_data = {'title': 'Days of week by year',
                             'keys': days_of_week,
                             'frequencies': [generate_frequencies_response(days_of_week, weekdays_year_counters[year])
                                             for year in years]}

        months_by_year_data = {'title': 'Month by year',
                             'keys': months_of_year,
                             'frequencies': [generate_frequencies_response(months_of_year, months_year_counters[year])
                                             for year in years]}

        average_days_between_event = find_average_days_between_event(events)

        overview = {'totalEvents': len(events),
                    'averageTimeBetweenEvent': "{:.0f}".format(average_days_between_event),
                    'firstDate': first_date['StartDate'].strftime("%d %B %Y"),
                    'lastDate': last_date['StartDate'].strftime("%d %B %Y")}

        response = {'overview': overview,
                    'daysOfWeek': days_data,
                    'weekdaysByYearData': days_by_year_data,
                    'monthsOfYear': months_data,
                    'monthsByYearData': months_by_year_data,
                    'hoursOfDay': hours_data,
                    'yearlyTrend': years_data}

        self.response.out.write(simplejson.dumps(response))


app = webapp2.WSGIApplication([
                                  ('/', MainHandler),
                                  ('/migraine-data', MigraineData)
                              ], debug=True)
