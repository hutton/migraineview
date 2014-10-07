import logging
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
            start_date = get_date_field(component, 'dtstart')

            if start_date:
                event = {'Start': start_date, 'CompareDate': str(start_date)}

                value = component.get('description')

                if value:
                    event['Comment'] = unicode(value)
                else:
                    event['Comment'] = ""

                end_date = get_date_field(component, 'dtend')

                if end_date:
                    duration_delta = end_date - start_date

                    event['Duration'] = duration_delta.seconds
                else:
                    event['Duration'] = None

                events.append(event)

    sorted_events = sorted(events, key=lambda event: event.get('CompareDate'))

    return sorted_events


def date_to_datetime(date):
    if isinstance(date, datetime.date):
        return datetime.datetime(date.year, date.month, date.day)

    return date


def build_json_events(events):
    json_events = []

    for event in events:
        json_events.append({'Start': str(event['Start']),
                            'Duration': event['Duration'],
                            'Comment': event['Comment']})

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

