from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os, json

from utils import get_db_connection, allowed_file, UPLOAD_FOLDER

bp_product = Blueprint("bp_product", __name__, url_prefix="")

@bp_product.route("/products", methods=["GET"])
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

@bp_product.route("/products", methods=["POST"])
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
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(os.path.join(UPLOAD_FOLDER, filename))

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

@bp_product.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)

@bp_product.route("/tags", methods=["GET"])
def get_tags():
    conn = get_db_connection()
    tags = conn.execute("SELECT * FROM tags").fetchall()
    conn.close()
    return jsonify([dict(tag) for tag in tags])

@bp_product.route("/tags", methods=["POST"])
def create_tag():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"error": "Tag name is required"}), 400

    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO tags (name) VALUES (?)", (name,))
        conn.commit()
    except Exception as e:
        return jsonify({"error": "Tag already exists"}), 400
    finally:
        conn.close()

    return jsonify({"message": "Tag created successfully"})

@bp_product.route("/tags/<int:tag_id>", methods=["DELETE"])
def delete_tag(tag_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Tag deleted successfully"})