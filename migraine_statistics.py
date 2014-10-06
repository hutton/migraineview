import hashlib
from libs import icalendar
from helper import process_calendar

__author__ = 'simonhutton'

import calendar
from collections import Counter
import os
import datetime
import webapp2
import json
from google.appengine._internal.django.utils import simplejson


def parse_date(param):
    if len(param) == 10:
        return datetime.datetime.strptime(param, '%Y-%m-%d')
    if len(param) >= 19:
        return datetime.datetime.strptime(param[:19], '%Y-%m-%d %H:%M:%S')

    return None


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


def add_months(source_datetime, months):
    month = source_datetime.month - 1 + months
    year = source_datetime.year + month / 12
    month = month % 12 + 1
    day = min(source_datetime.day, calendar.monthrange(year, month)[1])

    return datetime.datetime(year, month, day)


def get_month_years(first_date, last_date):
    current_month_year = first_date
    month_years = []

    while current_month_year <= last_date:
        month_years.append(current_month_year.strftime('%m/%y'))

        current_month_year = add_months(current_month_year, 1)

    return month_years


def build_json_events(events):
    json_events = []

    for event in events:
        json_events.append({'Start': event['StartDate'],
                            'Duration': event['StartDate'],
                            'Comment': event['Description']})

    return json_events


def generate_statistics_from_events(events):

    # Events should have:
    #       StartDate
    #       EndDate (optional)
    #       Comment (optional)

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

    first_date = min(events, key=fetch_start_date)
    last_date = max(events, key=fetch_start_date)

    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    months_of_year = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                      'October', 'November', 'December']
    hours_of_day = ["%02d:00" % (hour * 2) for hour in range(12)]
    years = sorted(list(years_counter))
    month_years = get_month_years(first_date['StartDate'], last_date['StartDate'])

    weekdays_by_year_counters = {}
    months_by_year_counters = {}
    month_years_counter = Counter()

    for event in events:
        if event['Year'] not in weekdays_by_year_counters:
            weekdays_by_year_counters[event['Year']] = Counter()
            months_by_year_counters[event['Year']] = Counter()

        weekdays_by_year_counters[event['Year']][event['Day']] += 1
        months_by_year_counters[event['Year']][event['Month']] += 1
        month_years_counter[event['MonthYear']] += 1

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
    month_year_data = {'title': 'Overview trend',
                       'keys': month_years,
                       'frequencies': [generate_frequencies_response(month_years, month_years_counter)]}
    days_by_year_data = {'title': 'Days of week by year',
                         'keys': days_of_week,
                         'frequencies': [
                             generate_frequencies_response(days_of_week, weekdays_by_year_counters[year])
                             for year in years]}
    months_by_year_data = {'title': 'Month by year',
                           'keys': months_of_year,
                           'frequencies': [
                               generate_frequencies_response(months_of_year, months_by_year_counters[year])
                               for year in years]}
    average_days_between_event = find_average_days_between_event(events)

    overview = {'totalEvents': len(events),
                'averageTimeBetweenEvent': "{:.0f}".format(average_days_between_event),
                'firstDate': first_date['StartDate'].strftime("%B") + " " + first_date['StartDate'].strftime("%Y"),
                'lastDate': last_date['StartDate'].strftime("%B") + " " + last_date['StartDate'].strftime("%Y")}

    json_events = build_json_events(events)

    response = {'overview': overview,
                'daysOfWeek': days_data,
                'weekdaysByYearData': days_by_year_data,
                'monthsOfYear': months_data,
                'monthsByYearData': months_by_year_data,
                'hoursOfDay': hours_data,
                'yearlyTrend': years_data,
                'monthYears': month_year_data}

    return response


def json_to_events(file_content):
    return json.loads(file_content)


def ics_to_events(file_content):
    cal = icalendar.Calendar.from_ical(file_content)

    return process_calendar(cal)


class MigraineData(webapp2.RequestHandler):
    def post(self):

        if len(self.request.params.multi.dicts) > 1 and 'file' in self.request.params.multi.dicts[1]:
            file_info = self.request.POST['file']

            file_content = file_info.file.read()

            if file_info.filename.endswith('.json'):
                events = json_to_events(file_content)

            if file_info.filename.endswith('.ics'):
                events = ics_to_events(file_content)

            response = generate_statistics_from_events(events)

            self.response.out.write(simplejson.dumps(response))

