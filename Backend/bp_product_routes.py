from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os, json

from utils import get_db_connection, allowed_file, UPLOAD_FOLDER

bp_product = Blueprint("bp_product", __name__, url_prefix="")

# ------------------------
# GET all products
# ------------------------
@bp_product.route("/products", methods=["GET"])
def get_products():
    try:
        conn = get_db_connection()
        products = conn.execute("SELECT * FROM products").fetchall()

        product_list = []
        for product in products:
            reviews = conn.execute(
                "SELECT rating FROM reviews WHERE product_id = ?", (product["id"],)
            ).fetchall()

            if reviews:
                avg_rating = round(sum(r["rating"] for r in reviews) / len(reviews), 1)
                review_count = len(reviews)
            else:
                avg_rating = 0
                review_count = 0

            product_list.append({
                "id": product["id"],
                "name": product["name"],
                "description": product["description"],
                "stock": product["stock"],
                "price": product["price"],
                "image_url": product["image_url"],
                "tags": json.loads(product["tags"]) if product["tags"] else [],
                "avg_rating": avg_rating,
                "review_count": review_count
            })

        conn.close()
        return jsonify(product_list)
    except Exception as e:
        print("Error fetching products:", e)
        return jsonify({"error": "Server error"}), 500

# ------------------------
# GET single product by ID
# ------------------------
@bp_product.route("/products/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    try:
        conn = get_db_connection()

        product = conn.execute(
            "SELECT * FROM products WHERE id = ?", (product_id,)
        ).fetchone()

        if not product:
            conn.close()
            return jsonify({"error": "Product not found"}), 404

        specs = conn.execute(
            "SELECT key, value FROM product_specs WHERE product_id = ?", (product_id,)
        ).fetchall()

        reviews = conn.execute(
            "SELECT username, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
            (product_id,)
        ).fetchall()

        conn.close()

        return jsonify({
            "id": product["id"],
            "name": product["name"],
            "description": product["description"],
            "stock": product["stock"],
            "price": product["price"],
            "image_url": product["image_url"],
            "tags": json.loads(product["tags"]) if product["tags"] else [],
            "specs": [dict(s) for s in specs],
            "reviews": [dict(r) for r in reviews],
        })
    except Exception as e:
        print("Error fetching product:", e)
        return jsonify({"error": "Server error"}), 500

# ------------------------
# POST create new product
# ------------------------
@bp_product.route("/products", methods=["POST"])
def create_product():
    if 'Authorization' not in request.headers:
        return jsonify({"error": "Unauthorized"}), 401

    name = request.form.get("name")
    description = request.form.get("description")
    stock = request.form.get("stock") or 0
    price = request.form.get("price")
    tags_json = request.form.get("tags")
    specs_json = request.form.get("specs")
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
        product_id = cursor.lastrowid

        specs = json.loads(specs_json) if specs_json else []
        for spec in specs:
            key = spec.get("key")
            value = spec.get("value")
            if key and value:
                cursor.execute(
                    "INSERT INTO product_specs (product_id, key, value) VALUES (?, ?, ?)",
                    (product_id, key, value)
                )

        conn.commit()
        conn.close()

        return jsonify({"message": "Product created successfully!"})
    except Exception as e:
        print("Error creating product:", e)
        return jsonify({"error": "Server error"}), 500

# ------------------------
# Update a product
# ------------------------
@bp_product.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    if 'Authorization' not in request.headers:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.form
    file = request.files.get("image")

    fields = ["name", "description", "stock", "price", "tags"]
    updates = {field: data.get(field) for field in fields if data.get(field) is not None}

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        updates["image_url"] = filename

    if not updates:
        return jsonify({"error": "No fields to update"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        set_clause = ", ".join(f"{key} = ?" for key in updates)
        values = list(updates.values())
        values.append(product_id)

        cursor.execute(f"UPDATE products SET {set_clause} WHERE id = ?", values)

        specs_json = data.get("specs")
        specs = json.loads(specs_json) if specs_json else []

        cursor.execute("DELETE FROM product_specs WHERE product_id = ?", (product_id,))
        for spec in specs:
            key = spec.get("key")
            value = spec.get("value")
            if key and value:
                cursor.execute(
                    "INSERT INTO product_specs (product_id, key, value) VALUES (?, ?, ?)",
                    (product_id, key, value)
                )

        conn.commit()
        conn.close()
        return jsonify({"message": "Product updated"})
    except Exception as e:
        print("Error updating product:", e)
        return jsonify({"error": "Server error"}), 500


# ------------------------
# Delete a product
# ------------------------
@bp_product.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    if 'Authorization' not in request.headers:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        conn = get_db_connection()
        conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Product deleted"})
    except Exception as e:
        print("Error deleting product:", e)
        return jsonify({"error": "Server error"}), 500

# ------------------------
# Serve uploaded image files
# ------------------------
@bp_product.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)

# ------------------------
# GET all tags
# ------------------------
@bp_product.route("/tags", methods=["GET"])
def get_tags():
    try:
        conn = get_db_connection()
        tags = conn.execute("SELECT * FROM tags").fetchall()
        conn.close()
        return jsonify([dict(tag) for tag in tags])
    except Exception as e:
        print("Error fetching tags:", e)
        return jsonify({"error": "Server error"}), 500

# ------------------------
# POST create a new tag
# ------------------------
@bp_product.route("/tags", methods=["POST"])
def create_tag():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"error": "Tag name is required"}), 400

    try:
        conn = get_db_connection()
        conn.execute("INSERT INTO tags (name) VALUES (?)", (name,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Tag created successfully"})
    except Exception as e:
        return jsonify({"error": "Tag already exists or DB error"}), 400

# ------------------------
# DELETE a tag by ID
# ------------------------
@bp_product.route("/tags/<int:tag_id>", methods=["DELETE"])
def delete_tag(tag_id):
    try:
        conn = get_db_connection()
        conn.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Tag deleted successfully"})
    except Exception as e:
        return jsonify({"error": "Error deleting tag"}), 500

# ------------------------
# GET all specs for a product
# ------------------------
@bp_product.route("/products/<int:product_id>/specs", methods=["GET"])
def get_specs(product_id):
    conn = get_db_connection()
    specs = conn.execute("SELECT key, value FROM product_specs WHERE product_id = ?", (product_id,)).fetchall()
    conn.close()
    return jsonify([dict(spec) for spec in specs])

# ------------------------
# Add a spec
# ------------------------
@bp_product.route("/products/<int:product_id>/specs", methods=["POST"])
def add_spec(product_id):
    data = request.json
    key = data.get("key")
    value = data.get("value")
    if not key or not value:
        return jsonify({"error": "Both key and value required"}), 400

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO product_specs (product_id, key, value) VALUES (?, ?, ?)",
        (product_id, key, value)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Spec added"})

# ------------------------
# GET reviews for a product
# ------------------------
@bp_product.route("/products/<int:product_id>/reviews", methods=["GET"])
def get_reviews(product_id):
    conn = get_db_connection()
    reviews = conn.execute(
        "SELECT username, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
        (product_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in reviews])

# ------------------------
# Add a review for a product
# ------------------------
@bp_product.route("/products/<int:product_id>/reviews", methods=["POST"])
def add_review(product_id):
    data = request.json
    username = data.get("username")
    rating = data.get("rating")
    comment = data.get("comment")

    if not username or not rating or not comment:
        return jsonify({"error": "Missing review fields"}), 400

    if not (1 <= int(rating) <= 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400
    
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO reviews (product_id, username, rating, comment) VALUES (?, ?, ?, ?)",
        (product_id, username, rating, comment)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Review added"})

# -----------------------
# Get review
#
