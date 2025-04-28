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

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()

    if user and check_password_hash(user["password_hash"], password):
        # login success
        return jsonify({
            "token": "dummy-token",
            "force_password_change": user["force_password_change"],
            "permissions": user["permissions"],
            "username": user["username"]
        })
    else:
        return jsonify({"error": "Invalid username or password"}), 401

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

@app.route('/create-user', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    permissions = data.get('permissions', '{}')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    password_hash = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            'INSERT INTO users (username, password_hash, permissions) VALUES (?, ?, ?)',
            (username, password_hash, permissions)
        )
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

    conn.close()
    return jsonify({"message": "User created successfully"})

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Flower Store API!"})

if __name__ == "__main__":
    app.run(debug=True)
