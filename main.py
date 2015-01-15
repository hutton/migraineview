#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os

from google.appengine.api import users
from google.appengine.ext.webapp import template
import webapp2
from app.authentication import BaseRequestHandler
from app.example import Example
from app.export import Export
from app.model.account import Account

from app.report import Report, ReportAdd
from app.services import Stats, ClearAllEvents
from app.shared import Shared
from app.upload import Upload

from app.secrets import SESSION_KEY

class Main(BaseRequestHandler):
    def get(self):

        if self.logged_in:
            template_values = {'user': {'name': self.current_user},
                               'logout_url': '/logout'}
        else:
            template_values = {'user': None,
                                           'login_url': users.create_login_url('/report')}

        # user = Account.get_account()
        #
        # if user:
        #     template_values = {'user': {'name': user.nickname},
        #                        'logout_url': users.create_logout_url('/')}
        # else:
        #     template_values = {'user': None,
        #                        'login_url': users.create_login_url('/report')}

        template_values['login_create_url'] = users.create_login_url('/create')

        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../templates/home.html')
        self.response.out.write(template.render(path, template_values))


class Uploaded(webapp2.RequestHandler):
    def get(self):
        self.redirect('/')


class CreateAccount(webapp2.RequestHandler):
    def get(self):

        acc = Account.get_or_create_account()

        if acc:
            self.redirect('/add')
        else:
            self.redirect('/')

app_config = {
  'webapp2_extras.sessions': {
    'cookie_name': '_migraine_report_sess',
    'secret_key': SESSION_KEY
  },
  'webapp2_extras.auth': {
    'user_attributes': []
  }
}

app = webapp2.WSGIApplication([webapp2.Route('/auth/<provider>',
                                             handler='app.authentication.AuthHandler:_simple_auth', name='auth_login'),
                               webapp2.Route('/auth/<provider>/callback',
                                             handler='app.authentication.AuthHandler:_auth_callback', name='auth_callback'),
                               ('/', Main),
                               ('/upload', Upload),
                               ('/uploaded/.*', Uploaded),
                               ('/example/.*', Example),
                               ('/service/stats', Stats),
                               ('/service/clearAllEvents', ClearAllEvents),
                               ('/export/.*', Export),
                               ('/report/add', ReportAdd),
                               ('/shared/.*', Shared),
                               ('/create', CreateAccount),
                               ('/(report|options|add|list)', Report)
                              ], config=app_config, debug=True)
