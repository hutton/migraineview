import sys
from datetime import timedelta
import webapp2
from app.authentication import BaseRequestHandler
from app.example import Example
from app.helper import generate_string
from app.model.account import Account

sys.path.insert(0, 'libs')

import icalendar
import tablib

__author__ = 'simonhutton'


def build_tab_lib_dataset(attacks):
    data = tablib.Dataset()

    data.headers = ['Started', 'Duration', 'Recovered', 'Description']

    rows = [[str(attack['Start']),
             attack['DurationText'],
             str(attack['Start'] + timedelta(seconds=attack['Duration'])),
             attack['Comment']] for attack in attacks]

    for row in rows:
        data.append(row)

    return data


def generate_xlsx_output(attacks):
    data = build_tab_lib_dataset(attacks)

    return data.xlsx


def generate_csv_output(attacks):
    data = build_tab_lib_dataset(attacks)

    return data.csv


def generate_ics_output(attacks, unique_id):

    cal = icalendar.Calendar()
    cal.add('prodid', '-//Migraine.Report//mxm.dk//')
    cal.add('version', '2.0')

    for attack in attacks:
        event = icalendar.Event()
        event.add('summary', attack['Comment'])
        event.add('dtstart', attack['Start'])
        event.add('dtend', attack['Start'] + timedelta(seconds=attack['Duration']))
        event.add('dtstamp', attack['Start'])
        event['uid'] = attack['Start'].strftime("%Y%m%dT%H%M%S/") + unique_id + '@mxm.dk'

        event.add('priority', 5)

        cal.add_component(event)

    lines = cal.to_ical().splitlines()

    result = ""

    for line in lines:
        result += line + "\n"

    return result


class Export(BaseRequestHandler):

    def get(self):

        if "example" in self.request.path:
            attacks = Example.get_example_attacks()
            uid = generate_string(6)
        else:
            if self.logged_in:
                attacks = self.current_user.get_attacks_as_dict()
                uid = self.current_user.share_report_and_list_key

        if attacks is not None:
            self.response.headers['Content-Transfer-Encoding'] = 'binary'
            self.response.headers['Accept-Range'] = 'bytes'
            self.response.headers['Content-Encoding'] = 'binary'

            if self.request.path.endswith(".xlsx"):
                self.response.headers['Content-Disposition'] = 'attachment; filename=migraines.xlsx'
                self.response.headers['Content-Type'] = 'application/xlsx'
                
                output_content = generate_xlsx_output(attacks)

            if self.request.path.endswith(".csv"):
                self.response.headers['Content-Disposition'] = 'attachment; filename=migraines.csv'
                self.response.headers['Content-Type'] = 'application/csv'

                output_content = generate_csv_output(attacks)

            if self.request.path.endswith(".ics"):
                self.response.headers['Content-Disposition'] = 'attachment; filename=migraines.ics'
                self.response.headers['Content-Type'] = 'application/ics'

                output_content = generate_ics_output(attacks, uid)

            self.response.out.write(output_content)
        else:
            self.response.out.write("We don't have what you're looking for.")

            self.response.status = 404
