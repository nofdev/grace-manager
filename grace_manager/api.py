import os
from dotenv import load_dotenv
from flask import Flask, render_template, redirect, url_for
from flask_dance.contrib.google import make_google_blueprint, google
import logging
from . import chat_stream

# Load environment variables from .env file
load_dotenv()
api = Flask(__name__)
client_id = os.getenv('GOOGLE_CLIENT_ID')
client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
api.secret_key = os.getenv('FLASK_SECRET_KEY')
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Configure Google OAuth
blueprint = make_google_blueprint(
    client_id=client_id,
    client_secret=client_secret,
    scope=["profile", "email"]
)
api.register_blueprint(blueprint, url_prefix="/login")

# Routes
@api.route("/")
def index():
    google_data = None
    user_info_endpoint = "https://www.googleapis.com/oauth2/v2/userinfo"
    if google.authorized:
        google_data = google.get(user_info_endpoint).json()
    else:
        return redirect(url_for("google.login"))
    resp = google.get("/oauth2/v2/userinfo")
    assert resp.ok, resp.text
    return "You are {email} on Google".format(email=resp.json()["email"])

@api.route("/login")
def login():
    return redirect(url_for("google.login"))

@api.route("/logout")
def logout():
    return redirect(url_for("google.logout"))

@api.route("/profile")
def profile():
    if not google.authorized:
        return redirect(url_for("google.login"))
    resp = google.get("/oauth2/v2/userinfo")
    assert resp.ok, resp.text
    return "You are {email} on Google".format(email=resp.json()["email"])

