from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
import jwt, json, datetime
from utils import SECRET_KEY, get_db_connection

bp_auth = Blueprint("bp_auth", __name__, url_prefix="")

@bp_auth.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()

    if user and check_password_hash(user["password_hash"], password):
        try:
            permissions = json.loads(user["permissions"])
        except json.JSONDecodeError:
            permissions = {}

        payload = {
            "user_id": user["id"],
            "username": user["username"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "token": token,
            "force_password_change": user["force_password_change"],
            "permissions": permissions,
            "username": user["username"],
            "profile_picture": request.host_url.rstrip('/') + '/' + user["profile_picture"]
        })
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@bp_auth.route("/validate-token", methods=["GET"])
def validate_token():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Missing token"}), 401

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["user_id"]

        conn = get_db_connection()
        user = conn.execute("SELECT username, profile_picture, permissions FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()

        if user is None:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "valid": True,
            "user_id": user_id,
            "username": user["username"],
            "profile_picture": request.host_url.rstrip('/') + '/' + user["profile_picture"],
            "permissions": json.loads(user["permissions"]) if user["permissions"] else {},
        })

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

def verify_token(require_admin=False):
    token = request.headers.get("Authorization")
    if not token:
        return None, jsonify({"error": "Missing token"}), 401
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if require_admin and payload["username"] != "admin":
            return None, jsonify({"error": "Unauthorized"}), 403
        return payload, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({"error": "Invalid token"}), 401