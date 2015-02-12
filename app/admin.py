import os
from google.appengine.ext.ndb import Query
from app.authentication import BaseRequestHandler
from google.appengine.ext.webapp import template
from app.model.mr_user import User

__author__ = 'simonhutton'


class Accounts(BaseRequestHandler):
    def get(self):

        if self.logged_in and self.current_user.admin:

            query = Query(kind="User")

            users = query.fetch()

            users = reversed(sorted(users, key=lambda user: user.created))

            template_values = {'users': users}

            path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/admin/accounts.html')
            self.response.out.write(template.render(path, template_values))

        else:
            self.redirect('/')

