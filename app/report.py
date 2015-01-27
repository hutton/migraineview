import os
import datetime
from google.appengine._internal.django.utils import simplejson
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext.webapp import template
import webapp2
from app.authentication import BaseRequestHandler
from app.migraine_statistics import generate_statistics_from_events
from app.model import attack, account
from app.model.account import Account
from app.model.configuration import Configuration
from app.upload import create_start_text, create_duration_text

__author__ = 'simonhutton'


class Report(BaseRequestHandler):

    def show_main(self, user):

        response = {}

        if "report" in self.request.uri or "list" in self.request.uri:
            attacks = user.get_attacks_as_dict()

            if len(attacks) > 0:
                response['data'] = simplejson.dumps(generate_statistics_from_events(attacks))

        response['web_debug'] = Configuration.get_instance().web_debug
        response['share_report'] = user.share_report_key
        response['share_report_and_list'] = user.share_report_and_list_key
        response['logout_url'] = self.get_logout()
        response['show_logout'] = True
        response['show_add'] = True
        response['show_options'] = True
        response['show_list'] = True
        response['user'] = user

        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
        self.response.out.write(template.render(path, response))

    def get(self, object):

        if self.logged_in:
            self.show_main(self.current_user)
        else:
            self.redirect('/')


class ReportAdd(BaseRequestHandler):
    def post(self):

        if self.logged_in:
            user = self.current_user;

            started = datetime.datetime.strptime(self.request.POST['started'], "%Y-%m-%d %H:%M")
            ended = datetime.datetime.strptime(self.request.POST['ended'], "%Y-%m-%d %H:%M")

            duration_delta = ended - started

            new_attack = attack.Attack(parent=user.key)

            new_attack.start_time = started
            new_attack.duration = duration_delta.seconds
            new_attack.comment = self.request.POST['comment']

            new_attack.start_text = create_start_text(started)
            new_attack.duration_text = create_duration_text(duration_delta.seconds)

            new_attack.put()

            self.response.out.write({'message': "One attack created"})
            self.response.status = 200

        else:
            self.redirect('/')


class ReportEdit(BaseRequestHandler):
    def post(self):

        if self.logged_in:
            user = self.current_user;

            started = datetime.datetime.strptime(self.request.POST['started'], "%Y-%m-%d %H:%M")
            ended = datetime.datetime.strptime(self.request.POST['ended'], "%Y-%m-%d %H:%M")

            duration_delta = ended - started

            # new_attack = attack.Attack(parent=user.key)
            #
            # new_attack.start_time = started
            # new_attack.duration = duration_delta.seconds
            # new_attack.comment = self.request.POST['comment']
            #
            # new_attack.start_text = create_start_text(started)
            # new_attack.duration_text = create_duration_text(duration_delta.seconds)
            #
            # new_attack.put()

            self.response.out.write({'message': "One attack created"})
            self.response.status = 200

        else:
            self.redirect('/')
