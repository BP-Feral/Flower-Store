import sqlite3, os

SECRET_KEY = "COOKIEMONSTER123"
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
DEFAULT_AVATAR_FOLDER = "static/images/default_avatars"
DEFAULT_AVATARS = [f for f in os.listdir(DEFAULT_AVATAR_FOLDER) if f.endswith(".png")]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn