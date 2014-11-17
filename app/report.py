import os
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext import db
from google.appengine.ext.webapp import template
import webapp2
from app.migraine_statistics import generate_statistics_from_events
from app.model import attack, account

__author__ = 'simonhutton'

class Report(webapp2.RequestHandler):
    def get(self):

        acc = account.Account.get_or_create_account()

        if acc:
            query = db.query_descendants(acc)

            attacks = query.run()

            events = [{'Start': attack.start_time, 'Duration': attack.duration, 'Comment': attack.comment} for attack in attacks]

            if len(events) > 0:
                response = {'data': simplejson.dumps(generate_statistics_from_events(events))}
            else:
                response = {}

            path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
            self.response.out.write(template.render(path, response))
        else:
            self.redirect('/')

