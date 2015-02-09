from app.authentication import BaseRequestHandler

__author__ = 'simonhutton'


class SharedLinks(BaseRequestHandler):
    def get(self):

        if self.logged_in and self.current_user:
            self.redirect('/')
        else:
            self.redirect('/')

