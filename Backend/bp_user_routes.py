from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from sqlite3 import IntegrityError
import json, random

from utils import get_db_connection, DEFAULT_AVATARS
from bp_auth import verify_token

bp_user = Blueprint("bp_user", __name__, url_prefix="")

@bp_user.route("/users", methods=["GET"])
def get_users():
    payload, error_response, status = verify_token(require_admin=True)
    if error_response:
        return error_response, status

    conn = get_db_connection()
    users = conn.execute('SELECT id, username, profile_picture, permissions FROM users').fetchall()
    conn.close()

    user_list = []
    for user in users:
        picture_url = request.host_url.rstrip('/') + '/' + user["profile_picture"]
        user_list.append({
            "id": user["id"],
            "username": user["username"],
            "profile_picture": picture_url,
            "permissions": user["permissions"]
        })

    return jsonify(user_list)

@bp_user.route("/create-user", methods=["POST"])
def create_user():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    permissions = data.get("permissions")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    password_hash = generate_password_hash(password)
    avatar_filename = random.choice(DEFAULT_AVATARS)
    avatar_path = f"static/images/default_avatars/{avatar_filename}"

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, profile_picture, permissions) VALUES (?, ?, ?, ?)",
            (username, password_hash, avatar_path, permissions),
        )
        conn.commit()
        return jsonify({"message": "Utilizator creat cu success!"})
    except IntegrityError as e:
        conn.rollback()
        if "UNIQUE constraint" in str(e):
            return jsonify({"error": "Username already exists!"}), 400
        return jsonify({"error": "Failed to create user."}), 500
    finally:
        conn.close()

@bp_user.route("/update-user/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.json
    username = data.get('username')
    password = data.get('password')
    permissions = data.get('permissions')

    conn = get_db_connection()
    cursor = conn.cursor()

    if password:
        password_hash = generate_password_hash(password)
        cursor.execute(
            'UPDATE users SET username = ?, password_hash = ?, permissions = ? WHERE id = ?',
            (username, password_hash, permissions, user_id)
        )
    else:
        cursor.execute(
            'UPDATE users SET username = ?, permissions = ? WHERE id = ?',
            (username, permissions, user_id)
        )
    conn.commit()
    conn.close()

    return jsonify({"message": "Utilizator actualizat"})

@bp_user.route("/reset-password/<int:user_id>", methods=['PUT'])
def reset_password(user_id):
    data = request.json
    new_password = data.get('password')
    password_hash = generate_password_hash(new_password)

    conn = get_db_connection()
    conn.execute(
        'UPDATE users SET password_hash = ?, force_password_change = 0 WHERE id = ?',
        (password_hash, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Parola schimbata!"})

@bp_user.route("/delete-user/<int:user_id>", methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    user = conn.execute('SELECT username FROM users WHERE id = ?', (user_id,)).fetchone()

    if user and user['username'] == 'admin':
        conn.close()
        return jsonify({"error": "Cannot delete admin account"}), 403

    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Utilizator sters cu success!"})

@bp_user.route("/change-password", methods=["POST"])
def change_password():
    data = request.json
    username = data.get("username")
    new_password = data.get("new_password")

    if not username or not new_password:
        return jsonify({"error": "Username and new password are required"}), 400

    password_hash = generate_password_hash(new_password)
    conn = get_db_connection()
    conn.execute(
        'UPDATE users SET password_hash = ?, force_password_change = 0 WHERE username = ?',
        (password_hash, username)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Parola schimbata"})