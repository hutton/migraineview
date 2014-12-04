import os
import datetime
from google.appengine._internal.django.utils import simplejson
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext.webapp import template
import webapp2
from app.migraine_statistics import generate_statistics_from_events
from app.model import attack, account
from app.model.account import Account
from app.upload import create_start_text, create_duration_text

__author__ = 'simonhutton'


class Report(webapp2.RequestHandler):

    def show_main(self, acc):

        if "report" in self.request.uri or "list" in self.request.uri:
            attacks = acc.get_attacks_as_dict()

            if len(attacks) > 0:
                response = {'data': simplejson.dumps(generate_statistics_from_events(attacks))}
            else:
                response = {}
        else:
            response = {}

        response['logout_url'] = users.create_logout_url('/')

        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
        self.response.out.write(template.render(path, response))

    def get(self, object):

        acc = account.Account.get_or_create_account()

        if acc:
            self.show_main(acc)
        else:
            self.redirect('/')

    def post(self):

        acc = Account.get_or_create_account()

        if acc:
            started = datetime.datetime.strptime(self.request.POST['started'] + " " + self.request.POST['started-time'], "%Y-%m-%d %H:%M")
            ended = datetime.datetime.strptime(self.request.POST['ended'] + " " + self.request.POST['ended-time'], "%Y-%m-%d %H:%M")

            duration_delta = ended - started

            new_attack = attack.Attack(parent=acc)

            new_attack.start_time = started
            new_attack.duration = duration_delta.seconds
            new_attack.comment = self.request.POST['comment']

            new_attack.start_time = create_start_text(started)
            new_attack.duration_text = create_duration_text(duration_delta.seconds)

            db.put(new_attack)

            self.show_main(acc)
        else:
            self.redirect('/')


