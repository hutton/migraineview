from google.appengine.api import users
from google.appengine.ext import db
from app.model.attack import Attack

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


