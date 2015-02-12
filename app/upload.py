import StringIO
import csv
import logging
import traceback
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext import ndb
import webapp2
from app.authentication import BaseRequestHandler
from app.helper import create_start_text, create_duration_text, support_email, date_to_datetime
from app.migraine_statistics import json_to_events, ics_to_events
from app.model import attack
from libs import xlrd
from libs.dateutil.parser import parse

__author__ = 'simonhutton'


class Upload(BaseRequestHandler):
    def post(self):

        if self.logged_in:
            try:
                if len(self.request.params.multi.dicts) > 1 and 'file' in self.request.params.multi.dicts[1]:
                    file_info = self.request.POST['file']

                    file_content = file_info.file.read()

                    if file_info.filename.endswith('.json'):
                        events = json_to_events(file_content)

                    if file_info.filename.endswith('.xlsx'):
                        events = excel_to_events(file_content)

                    if file_info.filename.endswith('.xls'):
                        events = excel_to_events(file_content)

                    if file_info.filename.endswith('.csv'):
                        events = csv_to_events(file_content)

                    if file_info.filename.endswith('.ics'):
                        events = ics_to_events(file_content)

                    new_attacks = []

                    for event in events:
                        new_attack = attack.Attack(parent=self.current_user.key)

                        new_attack.start_time = event['Start'].replace(tzinfo=None)
                        new_attack.duration = event['Duration']
                        new_attack.comment = event['Comment']

                        new_attack.start_text = create_start_text(event['Start'])
                        new_attack.duration_text = create_duration_text(event['Duration'])

                        new_attacks.append(new_attack)

                    ndb.put_multi(new_attacks)

                self.response.out.write(simplejson.dumps({'message': str(len(new_attacks)) + ' attacks uploaded.'}))

                support_email("List uploaded", str(len(new_attacks)) + " attacks uploaded.")
            except Exception as e:

                trace = traceback.format_exc()

                logging.error(e.message)
                logging.error(trace)

                self.response.set_status(500)
                self.response.out.write(simplejson.dumps({'message': "Upload failed.<br/>Sorry!  We're looking at it."}))

                support_email("Upload failed", "Couldn't upload: " + file_info.filename)
        else:
            self.response.out.write(simplejson.dumps({'message': 'Please login before uploading attacks.'}))


def excel_to_events(file_content):
    wb = xlrd.open_workbook(file_contents=file_content)
    sh = wb.sheet_by_index(0)

    new_rows = []

    for row in range(sh.nrows):
        new_rows.append(sh.row_values(row))

    events = plain_rows_to_events(new_rows)

    return events


def string_matches(text, match_list):
    text = text.upper()

    for match in match_list:
        match = match.upper()

        if text == match:
            return True

    return False


def plain_rows_to_events(rows):
    events = []

    if len(rows) == 0:
        return events

    index_of_start = None
    index_of_finished = None
    index_of_comment = None

    header_row = rows[0]

    for i in range(0, len(header_row)):
        if string_matches(header_row[i], ["Started", "Start", "Start Time", "Began", "When"]):
            index_of_start = i
        if string_matches(header_row[i], ["Recovered", "Finished", "Finish"]):
            index_of_finished = i
        if string_matches(header_row[i], ["Description", "Comment", "Comments"]):
            index_of_comment = i

    if index_of_start is not None and index_of_finished is not None and index_of_comment is not None:
        for row in rows[1:]:

            start = parse(row[index_of_start])

            event = {'Start': start}

            finished = parse(row[index_of_finished])

            if finished:
                duration_delta = finished - start

                event['Duration'] = int(duration_delta.total_seconds())
            else:
                event['Duration'] = None

            event['Comment'] = row[index_of_comment]

            events.append(event)

    return events


def csv_to_events(file_content):
    csv_reader = csv.reader(StringIO.StringIO(file_content))

    new_rows = []

    for row in csv_reader:
        new_rows.append(row)

    events = plain_rows_to_events(new_rows)

    return events


