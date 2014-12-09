from google.appengine.api import users
from google.appengine.ext import db
from app.helper import generate_string
from app.model.attack import Attack

__author__ = 'simonhutton'


class Account(db.Model):
    user_id = db.StringProperty()

    share_report_key = db.StringProperty()
    share_report_and_list_key = db.StringProperty()

    @staticmethod
    def get_or_create_account():
        user = users.get_current_user()

        if user:
            query = Account.gql("WHERE user_id = :user_id", user_id=user.user_id())
            accounts = query.fetch(1)
            if accounts:
                return accounts[0]
            else:
                new_account = Account()

                new_account.user_id = user.user_id()
                new_account.share_report_key = generate_string(8)
                new_account.share_report_and_list_key = generate_string(7)

                db.put(new_account)

                return new_account

        return None

    @staticmethod
    def get_account():
        user = users.get_current_user()

        if user:
            query = Account.gql("WHERE user_id = :user_id", user_id=user.user_id())
            accounts = query.fetch(1)
            if accounts:
                return accounts[0]
            else:
                return None

        return None

    @staticmethod
    def get_account_from_share_link_report_and_list(key):

        query = Account.gql("WHERE share_report_and_list_key = :key", key=key)
        accounts = query.fetch(1)

        if accounts:
            return accounts[0]
        else:
            return None

    @staticmethod
    def get_account_from_share_link_report_only(key):

        query = Account.gql("WHERE share_report_key = :key", key=key)
        accounts = query.fetch(1)

        if accounts:
            return accounts[0]
        else:
            return None

    def get_attacks(self):
        query = db.Query(Attack)
        query.ancestor(self)
        query.order('start_time')

        return query.run()

    def get_attacks_as_dict(self):
        attacks = self.get_attacks()

        return [{'Start': attack.start_time, 'Duration': attack.duration, 'Comment': attack.comment,
                 'StartText': attack.start_text,
                 'DurationText': attack.duration_text} for attack in
                attacks]


