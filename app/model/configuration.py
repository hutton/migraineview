import datetime
from google.appengine.ext.ndb import Model, DateTimeProperty, IntegerProperty, TextProperty, BooleanProperty

__author__ = 'simonhutton'


class Configuration(Model):
    CACHE_TIME = datetime.timedelta(minutes=5)

    _INSTANCE = None
    _INSTANCE_AGE = None

    web_debug = BooleanProperty()


    @classmethod
    def get_instance(cls):
        now = datetime.datetime.now()
        if not cls._INSTANCE or cls._INSTANCE_AGE + cls.CACHE_TIME < now:
            cls._INSTANCE = cls.get_or_insert('config')

            if not cls._INSTANCE.web_debug:
                cls._INSTANCE.web_debug = True

                cls._INSTANCE.put()

            cls._INSTANCE_AGE = now
        return cls._INSTANCE

