import sys
import webapp2
from app.model.account import Account

sys.path.insert(0, 'libs')

import tablib

__author__ = 'simonhutton'


def build_tab_lib_dataset(attacks):
    data = tablib.Dataset()

    data.headers = ['Started', 'Duration', 'Description']

    rows = [[str(attack.start_time), attack.duration_text, attack.comment] for attack in attacks]

    for row in rows:
        data.append(row)

    return data


def generate_xlsx_output(attacks):
    data = build_tab_lib_dataset(attacks)

    return data.xls


def generate_csv_output(attacks):
    data = build_tab_lib_dataset(attacks)

    return data.csv


class Export(webapp2.RequestHandler):

    def get(self):

        acc = Account.get_account()

        if acc:
            self.response.headers['Content-Transfer-Encoding'] = 'binary'
            self.response.headers['Accept-Range'] = 'bytes'
            self.response.headers['Content-Encoding'] = 'binary'

            if self.request.path.endswith(".xlsx"):
                self.response.headers['Content-Disposition'] = 'attachment; filename=migraines.xlsx'
                self.response.headers['Content-Type'] = 'application/xlsx'
                
                output_content = generate_xlsx_output(acc.get_attacks())

            if self.request.path.endswith(".csv"):
                self.response.headers['Content-Disposition'] = 'attachment; filename=migraines.csv'
                self.response.headers['Content-Type'] = 'application/csv'

                output_content = generate_csv_output(acc.get_attacks())


            self.response.out.write(output_content)
        else:
            self.response.out.write("We don't have what you're looking for.")

            self.response.status = 404
