import datetime
from google.appengine.ext.ndb import Model, DateTimeProperty, IntegerProperty, TextProperty, BooleanProperty, \
    StringProperty

__author__ = 'simonhutton'


class Configuration(Model):
    CACHE_TIME = datetime.timedelta(minutes=5)

    _INSTANCE = None
    _INSTANCE_AGE = None

    web_debug = BooleanProperty()
    debug_login = BooleanProperty()
    public_stripe_key = StringProperty()

    consumer_key = StringProperty()
    consumer_secret = StringProperty()
    access_token_key = StringProperty()
    access_token_secret = StringProperty()

    tweet_frequency = IntegerProperty()

    @classmethod
    def get_instance(cls):
        now = datetime.datetime.now()

        if not cls._INSTANCE or cls._INSTANCE_AGE + cls.CACHE_TIME < now:
            cls._INSTANCE = cls.get_or_insert('config')

            if not cls._INSTANCE.public_stripe_key or not cls._INSTANCE.consumer_key or not cls._INSTANCE.tweet_frequency:
                cls._INSTANCE.public_stripe_key = 'public key'

                cls._INSTANCE.web_debug = True
                cls._INSTANCE.debug_login = True

                cls._INSTANCE.consumer_key = "Key"
                cls._INSTANCE.consumer_secret = "Key"
                cls._INSTANCE.access_token_key = "Key"
                cls._INSTANCE.access_token_secret = "Key"

                cls._INSTANCE.tweet_frequency = 4

                cls._INSTANCE.put()

            cls._INSTANCE_AGE = now
        return cls._INSTANCE

