import os
import datetime
from google.appengine._internal.django.utils import simplejson
from google.appengine.ext import db
from google.appengine.ext.webapp import template
import webapp2
from app.migraine_statistics import generate_statistics_from_events
from app.model import attack, account
from app.model.account import Account

__author__ = 'simonhutton'


class Report(webapp2.RequestHandler):

    def show_main(self, acc):
        query = db.query_descendants(acc)
        attacks = query.run()
        events = [{'Start': attack.start_time, 'Duration': attack.duration, 'Comment': attack.comment} for attack in
                  attacks]
        if len(events) > 0:
            response = {'data': simplejson.dumps(generate_statistics_from_events(events))}
        else:
            response = {}
        path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/main.html')
        self.response.out.write(template.render(path, response))

    def get(self):

        acc = account.Account.get_or_create_account()

        if acc:
            self.show_main(acc)
        else:
            self.redirect('/')

    def post(self):

        acc = Account.get_or_create_account()

        if acc:
            started = datetime.datetime.strptime(self.request.POST['started'] + " " + self.request.POST['started-time'], "%Y-%m-%d %H:%M")
            ended = datetime.datetime.strptime(self.request.POST['ended'] + " " + self.request.POST['ended-time'], "%Y-%m-%d %H:%M")

            duration_delta = ended - started

            new_attack = attack.Attack(parent=acc)

            new_attack.start_time = started
            new_attack.duration = duration_delta.seconds
            new_attack.comment = self.request.POST['comment']

            db.put(new_attack)

            self.show_main(acc)
        else:
            self.redirect('/')


