import os
import datetime
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext import ndb
from google.appengine.ext.webapp import template
import webapp2
from app.authentication import BaseRequestHandler
from app.migraine_statistics import generate_statistics_from_events
from app.model import attack, account
from app.model.attack import Attack
from app.model.configuration import Configuration
from app.upload import create_start_text, create_duration_text

__author__ = 'simonhutton'


class Report(BaseRequestHandler):

    def show_main(self, user):

        response = {}

        attacks = user.get_attacks_as_dict()
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
            user = self.current_user

            started = datetime.datetime.strptime(self.request.POST['started'], "%Y-%m-%d %H:%M")

            if 'duration' in self.request.POST:
                duration = int(self.request.POST['duration'])
            else:
                ended = datetime.datetime.strptime(self.request.POST['ended'], "%Y-%m-%d %H:%M")

                duration_delta = ended - started

                duration = int(duration_delta.total_seconds())

            new_attack = attack.Attack(parent=user.key)

            new_attack.start_time = started
            new_attack.duration = duration
            new_attack.comment = self.request.POST['comment']

            new_attack.start_text = create_start_text(started)
            new_attack.duration_text = create_duration_text(duration)

            new_attack.put()

            self.response.out.write({'message': "One attack created"})
            self.response.status = 200

        else:
            self.redirect('/')


class ReportEdit(BaseRequestHandler):
    def post(self):

        if self.logged_in:
            user = self.current_user

            id = int(self.request.POST['id'])
            started = datetime.datetime.strptime(self.request.POST['started'], "%Y-%m-%d %H:%M")

            if 'duration' in self.request.POST:
                duration = int(self.request.POST['duration'])
            else:
                ended = datetime.datetime.strptime(self.request.POST['ended'], "%Y-%m-%d %H:%M")

                duration_delta = ended - started

                duration = int(duration_delta.total_seconds())

            found_attack = Attack.get_by_id(id, parent=user.key)

            if found_attack:
                found_attack.start_time = started
                found_attack.duration = duration
                found_attack.comment = self.request.POST['comment']

                found_attack.start_text = create_start_text(started)
                found_attack.duration_text = create_duration_text(duration)

                found_attack.put()

                self.response.out.write({'message': "Attack updated."})
                self.response.status = 200
            else:
                self.response.out.write({'message': "Attack not found."})
                self.response.status = 404

        else:
            template_values = {'status': '401 - Unauthenticated',
                               'title': 'What a headache!',
                               'message': "You need to be logged in to update attacks."}

            self.response.status = 404
            path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../templates/error.html')
            self.response.out.write(template.render(path, template_values))

class ReportDelete(BaseRequestHandler):
    def post(self):

        if self.logged_in:
            user = self.current_user;

            id = int(self.request.POST['id'])

            found_attack = Attack.get_by_id(id, parent=user.key)

            if found_attack:
                found_attack.key.delete()

                self.response.out.write({'message': "Attack deleted."})
                self.response.status = 200
            else:
                self.response.out.write({'message': "Attack not found."})
                self.response.status = 404

        else:
            template_values = {'status': '401 - Unauthenticated',
                               'title': 'What a headache!',
                               'message': "You need to be logged in to delete attacks."}

            self.response.status = 404
            path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../templates/error.html')
            self.response.out.write(template.render(path, template_values))


