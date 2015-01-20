import logging
import traceback
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext import ndb
import webapp2
from app.authentication import BaseRequestHandler
from app.helper import create_start_text, create_duration_text
from app.migraine_statistics import json_to_events, ics_to_events
from app.model import attack

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
            except Exception as e:

                trace = traceback.format_exc()

                logging.error(e.message)
                logging.error(trace)

                self.response.set_status(500)
                self.response.out.write(simplejson.dumps({'message': "Upload failed.  Sorry!  We're looking at it."}))
        else:
            self.response.out.write(simplejson.dumps({'message': 'Please login before uploading attacks.'}))




