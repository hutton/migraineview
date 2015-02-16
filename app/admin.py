import sys
import traceback
import tweepy

sys.path.insert(0, 'libs')

import logging
import os
from random import randint
import datetime
from google.appengine.ext.ndb import Query
from app.authentication import BaseRequestHandler
from google.appengine.ext.webapp import template
from app.model import tweet
from app.model.configuration import Configuration
from app.model.mr_user import User
from app.model.tweet import Tweet


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
                                   'sent': t.sent,
                                   'id': t.key.id()})

            sent_tweets = [t for t in tweet_list if t['sent'] != None]

            template_values = {'total': len(tweet_list),
                               'sent_tweets': len(sent_tweets),
                               'unsent_tweets': len(tweet_list) - len(sent_tweets),
                               'frequency': Configuration.get_instance().tweet_frequency,
                               'tweets': tweet_list}

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


class TweetDelete(BaseRequestHandler):
    def post(self):
        tweet_id = int(self.request.POST['id'])

        found_tweet = Tweet.get_by_id(tweet_id)

        if found_tweet:
            found_tweet.key.delete()

        self.redirect('/admin/tweets')


def post_tweet(message):
    consumer_key = Configuration.get_instance().consumer_key
    consumer_secret = Configuration.get_instance().consumer_secret

    access_token_key = Configuration.get_instance().access_token_key
    access_token_secret = Configuration.get_instance().access_token_secret

    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token_key, access_token_secret)

    api = tweepy.API(auth)

    return api.update_status(status=message)


class TweetPost(BaseRequestHandler):
    def get(self):

        try:
            tweet_frequency = Configuration.get_instance().tweet_frequency

            if randint(1, tweet_frequency) == 2:
                qry = Tweet.query(Tweet.sent == None).order(Tweet.priority, -Tweet.priority)

                found_tweets = qry.fetch(1)

                if found_tweets and len(found_tweets) > 0:
                    found_tweet = found_tweets[0]

                    post_tweet(found_tweet.message)

                    found_tweet.sent = datetime.datetime.now()

                    found_tweet.put()

                    logging.info("Tweet posted")
                else:
                    logging.info("No tweets to send")
            else:
                logging.info("Decided not to tweet, frequency " + str(tweet_frequency) + ".")

            self.response.status = 200
        except Exception as e:
            self.response.status = 500

            trace = traceback.format_exc()

            logging.error(e.message)
            logging.error(trace)


