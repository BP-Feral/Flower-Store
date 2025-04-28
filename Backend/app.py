from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()

    if user and check_password_hash(user['password_hash'], password):
        return jsonify({
            "token": "dummy-token-for-now",
            "user": username,
            "force_password_change": bool(user['force_password_change'])
        })

    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    new_password = data.get('new_password')

    # Here you should identify which user is changing (right now assume "admin")
    conn = get_db_connection()
    conn.execute('''
        UPDATE users
        SET password_hash = ?, force_password_change = 0
        WHERE username = ?
    ''', (generate_password_hash(new_password), "admin"))  # 👈 later change to use real token

    conn.commit()
    conn.close()

    return jsonify({"message": "Password changed successfully"})


@app.route('/')
def home():
    return jsonify({"message": "Welcome to Flower Store API!"})

if __name__ == "__main__":
    app.run(debug=True)
