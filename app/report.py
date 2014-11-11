import os
from google.appengine.api import users
from google.appengine.ext.webapp import template
import webapp2

__author__ = 'simonhutton'

class Report(webapp2.RequestHandler):
    def get(self):

        user = users.get_current_user()

        if user:
            path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
            self.response.out.write(template.render(path, {}))
        else:
            self.redirect('/')

