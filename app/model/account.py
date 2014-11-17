from google.appengine.api import users
from google.appengine.ext import db

__author__ = 'simonhutton'


class Account(db.Model):
    user_id = db.StringProperty()

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

                db.put(new_account)

                return new_account

        return None

