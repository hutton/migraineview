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
from google.appengine.ext.webapp import template
import webapp2
from migraine_statistics import MigraineData
from google.appengine._internal.django.utils import simplejson


class Stats(webapp2.RequestHandler):
    def get(self):
        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../templates/stats_view.html')
        self.response.out.write(template.render(path, {}))


class Main(webapp2.RequestHandler):
    def get(self):
        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../templates/main.html')
        self.response.out.write(template.render(path, {}))


class Upload(webapp2.RequestHandler):
    def post(self):
        response = {}

        self.response.out.write(simplejson.dumps(response))


app = webapp2.WSGIApplication([
                                  ('/', Main),
                                  ('/stats', Stats),
                                  ('/migraine-data', MigraineData),
                                  ('/upload', MigraineData)
                              ], debug=True)
