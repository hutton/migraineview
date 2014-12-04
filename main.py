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
from app.export import Export

from app.migraine_statistics import Example
from app.report import Report
from app.services import Stats, ClearAllEvents
from app.upload import Upload


class Main(webapp2.RequestHandler):
    def get(self):

        user = users.get_current_user()

        if user:
            template_values = {'user': {'name': user.nickname()},
                               'logout_url': users.create_logout_url('/')}
        else:
            template_values = {'user': None,
                               'login_url': users.create_login_url('/report')}

        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../templates/home.html')
        self.response.out.write(template.render(path, template_values))


class Uploaded(webapp2.RequestHandler):
    def get(self):
        self.redirect('/')


app = webapp2.WSGIApplication([
                                  ('/', Main),
                                  ('/upload', Upload),
                                  ('/uploaded/.*', Uploaded),
                                  ('/example/.*', Example),
                                  ('/service/stats', Stats),
                                  ('/service/clearAllEvents', ClearAllEvents),
                                  ('/export/migraine.*', Export),
                                  ('/(report|options|add|list)', Report)
                              ], debug=True)
