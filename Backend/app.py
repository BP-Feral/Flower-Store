from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from sqlite3 import IntegrityError
import json

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()

    if user and check_password_hash(user["password_hash"], password):
        # Parse permissions string into a real Python dict
        try:
            permissions = json.loads(user["permissions"])
        except json.JSONDecodeError:
            permissions = {}

        return jsonify({
            "token": "dummy-token",
            "force_password_change": user["force_password_change"],
            "permissions": permissions,  # real dict now
            "username": user["username"]
        })
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route("/change-password", methods=["POST"])
def change_password():
    data = request.json
    username = data.get("username")
    new_password = data.get("new_password")

    if not username or not new_password:
        return jsonify({"error": "Username and new password are required"}), 400

    password_hash = generate_password_hash(new_password)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        'UPDATE users SET password_hash = ?, force_password_change = 0 WHERE username = ?',
        (password_hash, username)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Password changed successfully"})

@app.route('/reset-password/<int:user_id>', methods=['PUT'])
def reset_password(user_id):
    data = request.json
    new_password = data.get('password')

    if not new_password:
        return jsonify({"error": "New password is required."}), 400
    
    password_hash = generate_password_hash(new_password)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE users SET password_hash = ?, force_password_change = 0 WHERE id = ?',
        (password_hash, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Password reset successfully!"})

@app.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    users = conn.execute('SELECT id, username, permissions FROM users').fetchall()
    conn.close()

    user_list = []
    for user in users:
        user_list.append({
            "id": user["id"],
            "username": user["username"],
            "permissions": user["permissions"]
        })
    
    return jsonify(user_list)

@app.route('/delete-user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    user = cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,)).fetchone()

    if user and user['username'] == 'admin':
        conn.close()
        return jsonify({"error": "Cannot delete admin account"}), 403

    cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "User deleted successfully"})

@app.route("/create-user", methods=["POST"])
def create_user():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    permissions = data.get("permissions")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    password_hash = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, permissions) VALUES (?, ?, ?)",
            (username, password_hash, permissions),
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "User created successfully."})
    except IntegrityError as e:
        conn.rollback()
        conn.close()
        if "UNIQUE constraint" in str(e):
            return jsonify({"error": "Username already exists!"}), 400
        return jsonify({"error": "Failed to create user."}), 500

@app.route('/update-user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    username = data.get('username')
    password = data.get('password')  # Optional
    permissions = data.get('permissions')

    conn = get_db_connection()
    cursor = conn.cursor()

    if password:  # if a new password was provided
        password_hash = generate_password_hash(password)
        cursor.execute(
            'UPDATE users SET username = ?, password_hash = ?, permissions = ? WHERE id = ?',
            (username, password_hash, permissions, user_id)
        )
    else:  # no password change
        cursor.execute(
            'UPDATE users SET username = ?, permissions = ? WHERE id = ?',
            (username, permissions, user_id)
        )

    conn.commit()
    conn.close()

    return jsonify({"message": "User updated successfully"})

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Flower Store API!"})

if __name__ == "__main__":
    app.run(debug=True)
