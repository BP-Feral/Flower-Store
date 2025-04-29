import jwt
import json
import datetime

import sqlite3
from sqlite3 import IntegrityError

from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from flask import Flask, request, jsonify, send_from_directory

from flask_cors import CORS
import os

SECRET_KEY = "COOKIEMONSTER123"
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn



app = Flask(__name__)
CORS(app)

###
###  LOGIN
###
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

        # 🔥 Create JWT token
        payload = {
            "user_id": user["id"],
            "username": user["username"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)  # 8 hours session
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "token": token,
            "force_password_change": user["force_password_change"],
            "permissions": permissions,
            "username": user["username"]
        })
    else:
        return jsonify({"error": "Invalid username or password"}), 401

##
## VALIDATE TOKEN
##
@app.route("/validate-token", methods=["GET"])
def validate_token():
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"error": "Missing token"}), 401

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({
            "valid": True,
            "user_id": payload["user_id"],
            "username": payload["username"]
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

##
## CHANGE PASSWORD
##
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


##
## RESET PASSWORD
##
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

##
## USERS
##
@app.route('/users', methods=['GET'])
def get_users():
    payload, error_response, status = verify_token(require_admin=True)
    if error_response:
        return error_response, status

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

##
## DELETE USERS
##
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

##
## CREATE USERS
##
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

##
## TAGS
##
@app.route("/tags", methods=["GET"])
def get_tags():
    conn = get_db_connection()
    tags = conn.execute("SELECT * FROM tags").fetchall()
    conn.close()
    return jsonify([dict(tag) for tag in tags])

@app.route("/tags", methods=["POST"])
def create_tag():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"error": "Tag name is required"}), 400

    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO tags (name) VALUES (?)", (name,))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Tag already exists"}), 400
    finally:
        conn.close()

    return jsonify({"message": "Tag created successfully"})

@app.route("/tags/<int:tag_id>", methods=["DELETE"])
def delete_tag(tag_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Tag deleted successfully"})

##
## PRODUCTS
##
@app.route("/products", methods=["POST"])
def create_product():
    if 'Authorization' not in request.headers:
        return jsonify({"error": "Unauthorized"}), 401

    name = request.form.get("name")
    description = request.form.get("description")
    stock = request.form.get("stock") or 0
    price = request.form.get("price")
    tags_json = request.form.get("tags")
    file = request.files.get("image")

    if not name or not description or not price:
        return jsonify({"error": "Missing required fields"}), 400

    filename = None
    if file:
        filename = secure_filename(file.filename)
        upload_folder = "uploads"
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        file.save(os.path.join(upload_folder, filename))

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO products (name, description, stock, price, image_url, tags)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (name, description, stock, price, filename, tags_json)
        )

        conn.commit()
        conn.close()

        return jsonify({"message": "Product created successfully!"})

    except Exception as e:
        print("Error creating product:", e)
        return jsonify({"error": "Server error"}), 500

@app.route("/products", methods=["GET"])
def get_products():
    try:
        conn = get_db_connection()
        products = conn.execute('SELECT * FROM products').fetchall()
        conn.close()

        product_list = []
        for product in products:
            product_list.append({
                "id": product["id"],
                "name": product["name"],
                "description": product["description"],
                "stock": product["stock"],
                "price": product["price"],
                "image_url": product["image_url"],
                "tags": json.loads(product["tags"]) if product["tags"] else []
            })

        return jsonify(product_list)

    except Exception as e:
        print("Error fetching products:", e)
        return jsonify({"error": "Server error"}), 500


@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)


@app.route('/')
def home():
    return jsonify({"message": "Welcome to Flower Store API!"})



if __name__ == "__main__":
    app.run(debug=True)
