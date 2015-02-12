import string
import sys

sys.path.insert(0, 'libs')

import icalendar

from app.helper import process_calendar, build_json_events, date_to_datetime

__author__ = 'simonhutton'

import calendar
from collections import Counter
import os
import datetime
import webapp2
import json



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
    if isinstance(args['Start'], datetime.date):
        return datetime.datetime(args['Start'].year, args['Start'].month, args['Start'].day)

    return args['Start']


def fetch_count_from_tuple(args):
    return args[1]


def find_average_days_between_event(events):
    first_date = min(events, key=fetch_start_date)
    last_date = max(events, key=fetch_start_date)

    duration = date_to_datetime(last_date['Start']) - date_to_datetime(first_date['Start'])

    average_days_between_event = float(duration.days) / len(events)

    return average_days_between_event


def find_time_between_attacks(events):
    times = []

    previous_start = None

    for event in events:
        if previous_start:
            times.append((event['Start'] - previous_start).total_seconds() / (60 * 60 * 24))

        previous_start = event['Start']

    times = sorted(times)

    return times


def find_time_since_last_attack(events):
    last_event = events[-1:]

    delta = datetime.datetime.now() - last_event[0]['Start']

    return delta.days, "Days since last attack"


def add_months(source_datetime, months):
    month = source_datetime.month - 1 + months
    year = source_datetime.year + month / 12
    month = month % 12 + 1
    day = min(source_datetime.day, calendar.monthrange(year, month)[1])

    return datetime.datetime(year, month, day)


def get_month_years(first_date, last_date):
    current_month_year = date_to_datetime(first_date)
    last_date = date_to_datetime(last_date)
    month_years = []

    while current_month_year <= last_date:
        month_years.append(current_month_year.strftime('%m/%y'))

        current_month_year = add_months(current_month_year, 1)

    return month_years


def seconds_to_hours(seconds):
    return seconds / (60 * 60)


def timedelta_to_text(delta):
    if delta.days > 2:
        return str(delta.days) + " <span>days</span>"

    return str(int(seconds_to_hours(delta.total_seconds()))) + " <span>hours</span>"


def find_most_and_least_frequent(keys, frequencies):
    zipped = zip(keys, frequencies)

    least_frequency = min(frequencies)
    most_frequency = max(frequencies)

    least = [item[0] for item in zipped if item[1] == least_frequency]
    most = [item[0] for item in zipped if item[1] == most_frequency]

    return most, least


def build_frequency_text(frequent_days, frequent_months):
    return string.join(frequent_days, ' or ') + ' in ' + string.join(frequent_months, ' or ')


def generate_statistics_from_events(events):
    # Events should have:
    # Start
    #       EndDate (optional)
    #       Comment (optional)

    if len(events) == 0:
        return {}

    weekdays_counter = Counter()
    months_counter = Counter()
    hours_counter = Counter()
    years_counter = Counter()
    month_year_counter = Counter()

    longest_gap = datetime.timedelta(0)
    shortest_gap = datetime.timedelta(10000)

    previous_start = None

    finding_gaps = True #len(events) > 10

    events = sorted(events, key=lambda event: event.get('Start'))

    for event in events:
        event['Day'] = event['Start'].strftime('%A')
        event['Month'] = event['Start'].strftime('%B')
        event['Year'] = str(event['Start'].year)
        event['MonthYear'] = event['Start'].strftime('%m/%y')
        event['ShortStartDate'] = event['Start'].strftime('%Y-%m-%d')

        weekdays_counter[event['Day']] += 1
        months_counter[event['Month']] += 1
        years_counter[event['Year']] += 1
        month_year_counter[event['MonthYear']] += 1

        if finding_gaps and previous_start:
            gap = event['Start'] - previous_start

            if gap > longest_gap:
                longest_gap = gap
            if gap < shortest_gap:
                shortest_gap = gap

        previous_start = event['Start']

        if isinstance(event['Start'], datetime.datetime):
            hour = event['Start'].hour
            event['Hour'] = "%02d:00" % (0 if hour == 23 else hour if hour % 2 == 0 else hour + 1)
            hours_counter[event['Hour']] += 1

    first_date = min(events, key=fetch_start_date)
    last_date = max(events, key=fetch_start_date)

    longest_gap_text = timedelta_to_text(longest_gap)
    shortest_gap_text = timedelta_to_text(shortest_gap)

    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    months_of_year = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                      'October', 'November', 'December']
    hours_of_day = ["%02d:00" % (hour * 2) for hour in range(12)]
    years = sorted(list(years_counter))
    month_years = get_month_years(first_date['Start'], last_date['Start'])

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

    most_frequent_months, least_frequent_months = find_most_and_least_frequent(months_data['keys'],
                                                                               months_data['frequencies'][0])
    most_frequent_days, least_frequent_days = find_most_and_least_frequent(days_data['keys'],
                                                                           days_data['frequencies'][0])

    most_frequent_text = build_frequency_text(most_frequent_days, most_frequent_months)
    least_frequent_text = build_frequency_text(least_frequent_days, least_frequent_months)

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

    time_between_attacks = find_time_between_attacks(events)

    time_since_last_attack, time_since_last_attack_label = find_time_since_last_attack(events)

    overview = {'totalEvents': len(events),
                'timeSinceLastAttack': time_since_last_attack,
                'timeSinceLastAttackLabel': time_since_last_attack_label,
                'averageTimeBetweenEvent': "{:.0f}".format(average_days_between_event),
                'averageTimeBetweenEventLabel': "Days average between attacks",
                'timeBetweenAttacks': time_between_attacks,
                'firstDate': first_date['Start'].strftime("%B") + " " + first_date['Start'].strftime("%Y"),
                'lastDate': last_date['Start'].strftime("%B") + " " + last_date['Start'].strftime("%Y"),
                'longestGap': longest_gap_text,
                'shortestGap': shortest_gap_text}

    days_of_week_response = {'daysData': days_data,
                             'daysDataByYear': days_by_year_data,
                             'mostFrequentText': most_frequent_text,
                             'leastFrequentText': least_frequent_text}

    months_of_year_response = {'monthsData': months_data,
                               'monthsDataByYear': months_by_year_data}

    json_events = build_json_events(events)

    response = {'overview': overview,
                'firstYear': int(first_date['Start'].strftime("%Y")),
                'thisYear': int(datetime.datetime.now().strftime("%Y")),
                'daysOfWeek': days_of_week_response,
                'monthsOfYear': months_of_year_response,
                'hoursOfDay': hours_data,
                'yearlyTrend': years_data,
                'monthYears': month_year_data,
                'events': json_events}

    return response


def json_to_events(file_content):
    json_data = json.loads(file_content)

    events = []

    for item in json_data:
        event = {}

        start = parse_date(item['Start'])
        end = parse_date(item['End'])

        duration_delta = end - start

        event['Start'] = start
        event['Duration'] = duration_delta.seconds

        event['Comment'] = item['Description']

        events.append(event)

    return events


def ics_to_events(file_content):
    cal = icalendar.Calendar.from_ical(file_content)

    return process_calendar(cal)

