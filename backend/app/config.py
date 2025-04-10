import os
import datetime
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "a_secret_key_here")
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USERNAME = "ecootp1@gmail.com"
    MAIL_PASSWORD = os.getenv("GMAIL_PW")
    MAIL_DEFAULT_SENDER = "ecootp1@gmail.com"
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    UPLOAD_FOLDER = "uploads"
