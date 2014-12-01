from google.appengine._internal.django.utils import simplejson
from google.appengine.api import users
from google.appengine.ext import db
import webapp2
from app.migraine_statistics import json_to_events, ics_to_events, generate_statistics_from_events
from app.model import attack
from model.account import Account

__author__ = 'simonhutton'


def create_start_text(start_time):
    return ""


def create_duration_text(duration):
    """
    Upto to

    """
    if duration < 60 * 60:
        return ""

    return ""


class Upload(webapp2.RequestHandler):
    def post(self):

        account = Account.get_or_create_account()

        if account:
            if len(self.request.params.multi.dicts) > 1 and 'file' in self.request.params.multi.dicts[1]:
                file_info = self.request.POST['file']

                file_content = file_info.file.read()

                if file_info.filename.endswith('.json'):
                    events = json_to_events(file_content)

                if file_info.filename.endswith('.ics'):
                    events = ics_to_events(file_content)

                new_attacks = []

                for event in events:
                    new_attack = attack.Attack(parent=account)

                    new_attack.start_time = event['Start']
                    new_attack.duration = event['Duration']
                    new_attack.comment = event['Comment']

                    new_attack.start_time = create_start_text(event['Start'])
                    new_attack.duration_text = create_duration_text(event['Duration'])

                    new_attacks.append(new_attack)

                db.put(new_attacks)

        self.response.out.write(simplejson.dumps({'message': str(len(new_attacks)) + ' attacks uploaded.'}))





