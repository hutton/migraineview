import logging
import sys
from google.appengine.api import users
from google.appengine.ext import db
import webob
from app.helper import generate_string
from app.model.mr_user import User

sys.path.insert(0, 'libs')

import webapp2
from app import secrets
from libs.simpleauth import SimpleAuthHandler
from webapp2_extras import auth, sessions
import webob.multidict

__author__ = 'simonhutton'

DEFAULT_AVATAR_URL = '/img/missing-avatar.png'
FACEBOOK_AVATAR_URL = 'https://graph.facebook.com/{0}/picture?type=large'
FOURSQUARE_USER_LINK = 'http://foursquare.com/user/{0}'


class BaseRequestHandler(webapp2.RequestHandler):
    def dispatch(self):
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)

        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        """Returns a session using the default cookie key"""
        return self.session_store.get_session()

    @webapp2.cached_property
    def auth(self):
        return auth.get_auth()

    @webapp2.cached_property
    def current_user(self):
        """Returns currently logged in user"""
        user_dict = self.auth.get_user_by_session()

        if self.auth.get_user_by_session() is not None:
            return self.auth.store.user_model.get_by_id(user_dict['user_id'])
        elif users.get_current_user() is not None:
            return self.get_debug_user()

        return None

    @webapp2.cached_property
    def logged_in(self):
        """Returns true if a user is currently logged in, false otherwise"""
        return self.auth.get_user_by_session() is not None or users.get_current_user() is not None

    def head(self, *args):
        """Head is used by Twitter. If not there the tweet button shows 0"""
        pass

    def get_logout(self):
        if self.auth.get_user_by_session() is not None:
            return '/logout'
        elif users.get_current_user() is not None:
            return users.create_logout_url('/')

    def get_debug_user(self):
        user = users.get_current_user()

        if user:
            query = User.gql("WHERE auth_ids = :auth_ids", auth_ids="debug:" + user.user_id())
            all_users = query.fetch(1)

            if all_users:
                return all_users[0]
            else:
                _attrs = {}

                _attrs['name'] = users.get_current_user().nickname()
                _attrs['share_report_key'] = generate_string(8)
                _attrs['share_report_and_list_key'] = generate_string(7)

                ok, user = User.create_user("debug:" + user.user_id(), **_attrs)

                return user

        return None


class AuthHandler(BaseRequestHandler, SimpleAuthHandler):
    """Authentication handler for all kinds of auth."""

    USER_ATTRS = {
        'facebook': {
            'id': lambda id: ('avatar_url', FACEBOOK_AVATAR_URL.format(id)),
            'name': 'name',
            'link': 'link'
        },
        'google': {
            'picture': 'avatar_url',
            'name': 'name',
            'profile': 'link'
        },
        'googleplus': {
            'image': lambda img: ('avatar_url', img.get('url', DEFAULT_AVATAR_URL)),
            'displayName': 'name',
            'url': 'link'
        },
        'windows_live': {
            'avatar_url': 'avatar_url',
            'name': 'name',
            'link': 'link'
        },
        'twitter': {
            'profile_image_url': 'avatar_url',
            'screen_name': 'name',
            'link': 'link'
        },
        'linkedin': {
            'picture-url': 'avatar_url',
            'first-name': 'name',
            'public-profile-url': 'link'
        },
        'linkedin2': {
            'picture-url': 'avatar_url',
            'first-name': 'name',
            'public-profile-url': 'link'
        },
        'foursquare': {
            'photo': lambda photo: ('avatar_url', photo.get('prefix') + '100x100' \
                                    + photo.get('suffix')),
            'firstName': 'firstName',
            'lastName': 'lastName',
            'contact': lambda contact: ('email', contact.get('email')),
            'id': lambda id: ('link', FOURSQUARE_USER_LINK.format(id))
        },
        'openid': {
            'id': lambda id: ('avatar_url', DEFAULT_AVATAR_URL),
            'nickname': 'name',
            'email': 'link'
        }
    }

    def _on_signin(self, data, auth_info, provider, extra=None):
        """Callback whenever a new or existing user is logging in.
        data is a user info dictionary.
        auth_info contains access token or oauth token and secret.
        extra is a dict with additional params passed to the auth init handler.

        See what's in it with e.g. logging.info(auth_info)
        """

        logging.info(data)
        auth_id = '%s:%s' % (provider, data['id'])

        user = self.auth.store.user_model.get_by_auth_id(auth_id)
        _attrs = self._to_user_model_attrs(data, self.USER_ATTRS[provider])

        if user:
            logging.debug('Found existing user to log in')
            # Existing users might've changed their profile data so we update our
            # local model anyway. This might result in quite inefficient usage
            # of the Datastore, but we do this anyway for demo purposes.
            #
            # In a real app you could compare _attrs with user's properties fetched
            # from the datastore and update local user in case something's changed.
            user.populate(**_attrs)
            user.put()
            self.auth.set_session(self.auth.store.user_to_dict(user))

        else:
            # check whether there's a user currently logged in
            # then, create a new user if nobody's signed in,
            # otherwise add this auth_id to currently logged in user.

            if self.auth.get_user_by_session() is not None:
                logging.debug('Updating currently logged in user')

                u = self.current_user
                u.populate(**_attrs)
                # The following will also do u.put(). Though, in a real app
                # you might want to check the result, which is
                # (boolean, info) tuple where boolean == True indicates success
                # See webapp2_extras.appengine.auth.models.User for details.
                u.add_auth_id(auth_id)

            else:
                logging.debug('Creating a brand new user')

                _attrs['share_report_key'] = generate_string(8)
                _attrs['share_report_and_list_key'] = generate_string(7)

                ok, user = self.auth.store.user_model.create_user(auth_id, **_attrs)

                if ok:
                    self.auth.set_session(self.auth.store.user_to_dict(user))

        # Remember auth data during redirect, just for this demo. You wouldn't
        # normally do this.
        self.session.add_flash(auth_info, 'auth_info')
        self.session.add_flash({'extra': extra}, 'extra')

        destination_url = '/report'

        if extra is not None:
            params = webob.multidict.MultiDict(extra)
            destination_url = str(params.get('destination_url', '/report'))

        return self.redirect(destination_url)

    def logout(self):
        self.auth.unset_session()
        self.redirect('/')

    def _callback_uri_for(self, provider):
        return self.uri_for('auth_callback', provider=provider, _full=True)

    def _get_consumer_info_for(self, provider):
        """Should return a tuple (key, secret) for auth init requests.
        For OAuth 2.0 you should also return a scope, e.g.
        ('my app/client id', 'my app/client secret', 'email,user_about_me')

        The scope depends solely on the provider.
        See example/secrets.py.template
        """
        return secrets.AUTH_CONFIG[provider]

    def _get_optional_params_for(self, provider):
        """Returns optional parameters for auth init requests."""
        return secrets.AUTH_OPTIONAL_PARAMS.get(provider)

    def _to_user_model_attrs(self, data, attrs_map):
        """Get the needed information from the provider dataset."""
        user_attrs = {}

        for k, v in attrs_map.iteritems():
            attr = (v, data.get(k)) if isinstance(v, str) else v(data.get(k))
            user_attrs.setdefault(*attr)

        return user_attrs
