import sys
import webob

sys.path.insert(0, 'libs')

import webapp2
from app import secrets
from libs.simpleauth import SimpleAuthHandler
from webapp2_extras import auth, sessions

__author__ = 'simonhutton'

class BaseRequestHandler(webapp2.RequestHandler):

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
    return self.auth.store.user_model.get_by_id(user_dict['user_id'])

  @webapp2.cached_property
  def logged_in(self):
    """Returns true if a user is currently logged in, false otherwise"""
    return self.auth.get_user_by_session() is not None

  def head(self, *args):
    """Head is used by Twitter. If not there the tweet button shows 0"""
    pass


class AuthHandler(BaseRequestHandler, SimpleAuthHandler):
  """Authentication handler for all kinds of auth."""

  def _on_signin(self, data, auth_info, provider, extra=None):
      """Callback whenever a new or existing user is logging in.
      data is a user info dictionary.
      auth_info contains access token or oauth token and secret.
      extra is a dict with additional params passed to the auth init handler.

      See what's in it with e.g. logging.info(auth_info)
      """

      auth_id = '%s:%s' % (provider, data['id'])

      # Possible flow:
      #
      # 1. check whether user exist, e.g.
      #    User.get_by_auth_id(auth_id)
      #
      # 2. create a new user if it doesn't
      #    User(**data).put()
      #
      # 3. sign in the user
      #    self.session['_user_id'] = auth_id
      #
      # 4. redirect somewhere, e.g. self.redirect('/profile')
      #
      # See more on how to work the above steps here:
      # http://webapp-improved.appspot.com/api/webapp2_extras/auth.html
      # http://code.google.com/p/webapp-improved/issues/detail?id=20

      destination_url = '/report'

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