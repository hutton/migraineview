import os
from google.appengine.ext.ndb import Query
from app.authentication import BaseRequestHandler
from google.appengine.ext.webapp import template
from app.model import tweet
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

class Tweets(BaseRequestHandler):
    def get(self):

        if self.logged_in and self.current_user.admin:

            query = Query(kind="Tweet")

            tweets = query.fetch()

            tweets = reversed(sorted(tweets, key=lambda tweet: tweet.created))

            tweet_list = []

            for t in tweets:
                tweet_list.append({'message': t.message,
                                   'priority': t.priority,
                                   'created': t.created,
                                   'id': t.key.id()})

            template_values = {'tweets': tweet_list}

            path = os.path.join(os.path.join(os.path.dirname(__file__), 'html'), '../../templates/admin/tweets.html')
            self.response.out.write(template.render(path, template_values))

        else:
            self.redirect('/')

    def post(self):

        new_tweet = tweet.Tweet()

        new_tweet.message = self.request.POST['message']
        new_tweet.priority = int(self.request.POST['priority'])

        new_tweet.put()

        self.redirect('/admin/tweets')