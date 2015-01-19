from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext.ndb import Query
from webapp2_extras.appengine.auth.models import User as Webapp2User
from app.helper import generate_string
from app.model.attack import Attack

__author__ = 'simonhutton'


class User(Webapp2User):

    @staticmethod
    def get_account_from_share_link_report_and_list(key):

        query = User.gql("WHERE share_report_and_list_key = :key", key=key)
        accounts = query.fetch(1)

        if accounts:
            return accounts[0]
        else:
            return None

    @staticmethod
    def get_account_from_share_link_report_only(key):

        query = User.gql("WHERE share_report_key = :key", key=key)
        accounts = query.fetch(1)

        if accounts:
            return accounts[0]
        else:
            return None

    def get_username(self):

        return 'Not set'

    def get_attacks(self):

        query = Query(kind="Attack", ancestor=self.key)

        return query.fetch()

    def get_attacks_as_dict(self):
        attacks = self.get_attacks()

        return [{'Start': attack.start_time, 'Duration': attack.duration, 'Comment': attack.comment,
                 'StartText': attack.start_text,
                 'DurationText': attack.duration_text} for attack in
                attacks]


