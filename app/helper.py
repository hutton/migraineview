import logging
import random
import string
from types import *
import datetime

from google.appengine.api import mail

import sys

sys.path.insert(0, 'libs')


def get_date_field(component, component_name):
    value = component.get(component_name)

    if not isinstance(value, (list, tuple)):
        if value:
            return value.dt
    else:
        logging.warn('Got a list as a date field')
        logging.warn(value)

        if len(value) > 0:
            value = value[0]

            if value:
                return value.dt


def process_calendar(calendar):
    events = []

    for component in calendar.walk():
        if component.name == "VEVENT":
            start_date = date_to_datetime(get_date_field(component, 'dtstart'))

            if start_date:
                event = {'Start': start_date, 'CompareDate': str(start_date)}

                value = component.get('description')

                if value:
                    event['Comment'] = unicode(value)
                else:
                    event['Comment'] = ""

                end_date = date_to_datetime(get_date_field(component, 'dtend'))

                if end_date:
                    duration_delta = end_date - start_date

                    event['Duration'] = duration_delta.seconds
                else:
                    event['Duration'] = None

                events.append(event)

    sorted_events = sorted(events, key=lambda event: event.get('CompareDate'))

    return sorted_events


def date_to_datetime(date):
    if not isinstance(date, datetime.datetime):
        return datetime.datetime(date.year, date.month, date.day)

    return date


def build_json_events(events):
    json_events = []

    for event in events:
        json_events.append({'start': event['StartText'],
                            'duration': event['DurationText'],
                            'comment': event['Comment']})

    return json_events


def support_email(subject, message):
    mail.send_mail(sender="ICS Convert Support <simon.hutton@gmail.com>",
                   to="Simon <simon.hutton@gmail.com>",
                   subject=subject,
                   body=message)


def format_events_for_html(events):

    for event in events:
        if 'Summary' in event:
            event['Summary'] = event['Summary'].replace('\n', '<br/>')

        if 'Description' in event:
            event['Description'] = event['Description'].replace('\n', '<br/>')

    return events


def format_events_for_txt(events):

    for event in events:
        if 'Summary' in event:
            event['Summary'] = event['Summary'].replace('\n', '\r\n')

        if 'Description' in event:
            event['Description'] = event['Description'].replace('\n', '\r\n')

    return events


def st_nd_rd_or_th(n):
    return str(n) + ("th" if 4 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th"))


def create_start_text(dt):
    return dt.strftime("%A<br/>%b " + st_nd_rd_or_th(dt.day) + " '%y<br/>at %H:%M")


def create_duration_text(seconds):
    result = ""
    one_day = 60 * 60 * 24
    one_hour = 60 * 60
    one_minute = 60

    if seconds == 0:
        return "-"

    if seconds >= one_day:
        days = int(seconds // one_day)

        if days == 1:
            result += "1 day "
        else:
            result += str(days) + " days "

        seconds -= one_day * days

    if seconds >= one_hour:
        hours = int(seconds // one_hour)

        if hours == 1:
            result += "1 hour "
        else:
            result += str(hours) + " hours "

        seconds -= one_hour * hours

    if seconds >= one_minute:
        label = "min"

        if len(result) == 0:
            label = "minute"

        minutes = int(seconds // one_minute)

        if minutes == 1:
            result += "1 " + label
        else:
            result += str(minutes) + " " + label + "s"

    return result.strip()


def generate_string(length):
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(length))