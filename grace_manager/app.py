import json, os, sqlite3
from flask import Flask, request, redirect, url_for
from flask_oauthlib.client import OAuth
from flask_socketio import SocketIO, emit
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from oauthlib.oauth2 import WebApplicationClient
import requests

# configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', None)
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', None)
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

# Create the flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or os.urandom(24)

# User session management setup
# https://flask-login.readthedocs.io/en/latest
login_manager = LoginManager()
login_manager.init_app(app)

# OAuth 2 client setup
client = WebApplicationClient(GOOGLE_CLIENT_ID)

# Flask-Login helper to retrieve a user from our db
@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)

# Secret key for session management
app.config['SECRET_KEY'] = 'secret!'

# OAuth credentials
app.config['OAUTH_CREDENTIALS'] = {
    'google': {
        'id': 'client_id',
        'secret': 'client_secret'
    }
}

# Initialize the extensions
oauth = OAuth(app)
socketio = SocketIO(app)

google = oauth.remote_app(
    'google',
    consumer_key='google-client-id',
    consumer_secret='google-client-secret',
    request_token_params={
        'scope': 'email'
    },
    base_url='https://www.googleapis.com/oauth2/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth'
)


@app.route('/oauth/login')
def login():
    callback_url = url_for('oauth_authorized', provider='google', _external=True)
    return oauth.authorize_redirect(callback=callback_url, provider='google')


@app.route('/oauth/authorized')
def oauth_authorized():
    response = oauth.authorized_response()
    if response is None:
        return 'Access denied: reason={0} error={1}'.format(
            request.args['error_reason'],
            request.args['error_description']
        )
    access_token = response['access_token']
    return 'Access granted!'


@app.route('/v1/chat', methods=['POST'])
@oauth.require_oauth('google')
def send_message():
    # Get the message form the request
    # message = request.json['message']
    message = request.json

    # Stream the message to all connected clients
    socketio.emit('message', {'message': message})

    # Return a success response
    return {'status': 'success'}


# stream all previous messages to the client by emitting a message event for each message in the message_history list
message_history = []


@app.route('/v1/chat', methods=['GET'])
@oauth.require_oauth('google')
def receive_message():
    # Stream all messages to the client
    @socketio.on('connect')
    def on_connect():
        for message in message_history:
            emit('message', {'message': message})

    # Return a success response
    return {'status': 'success'}


# run the app
if __name__ == '__main__':
    socketio.run(app, debug=True)
