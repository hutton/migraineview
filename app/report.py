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

        response['share_report'] = acc.share_report_key
        response['share_report_and_list'] = acc.share_report_and_list_key
        response['logout_url'] = users.create_logout_url('/')
        response['show_logout'] = True

        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
        self.response.out.write(template.render(path, response))

    def get(self, object):

        acc = account.Account.get_or_create_account()

        if acc:
            self.show_main(acc)
        else:
            self.redirect('/')


class ReportAdd(webapp2.RequestHandler):
    def post(self):

        acc = Account.get_account()

        if acc:
            started = datetime.datetime.strptime(self.request.POST['started'], "%Y-%m-%d %H:%M")
            ended = datetime.datetime.strptime(self.request.POST['ended'], "%Y-%m-%d %H:%M")

            duration_delta = ended - started

            new_attack = attack.Attack(parent=acc)

            new_attack.start_time = started
            new_attack.duration = duration_delta.seconds
            new_attack.comment = self.request.POST['comment']

            new_attack.start_text = create_start_text(started)
            new_attack.duration_text = create_duration_text(duration_delta.seconds)

            db.put(new_attack)

            self.response.out.write({'message': "One attack created"})
            self.response.status = 200

        else:
            self.redirect('/')
