from google.appengine.api import users
import webapp2

__author__ = 'simonhutton'


class Upload(webapp2.RequestHandler):
    def get(self):

        user = users.get_current_user()
        
        self.response.set_status(200, "")




