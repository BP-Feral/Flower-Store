from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from utils import get_db_connection, UPLOAD_FOLDER, allowed_file

bp_settings = Blueprint("bp_settings", __name__, url_prefix="/settings")

@bp_settings.route("/branding", methods=["POST"])
def update_branding():
    if 'Authorization' not in request.headers:
        return jsonify({"error": "Unauthorized"}), 401

    store_title = request.form.get("store_title")
    favicon = request.files.get("favicon")
    bg_color = request.form.get("bg_color")
    navbar_color = request.form.get("navbar_color")
    card_color = request.form.get("card_color")
    bg_image = request.form.get("bg_image")
    navbar_image = request.form.get("navbar_image")
    card_image = request.form.get("card_image")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if store_title:
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ("store_title", store_title))
        if favicon and allowed_file(favicon.filename):
            filename = secure_filename(favicon.filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            path = os.path.join(UPLOAD_FOLDER, filename)
            favicon.save(path)
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ("favicon", filename))

        for key, value in [
            ("bg_color", bg_color),
            ("navbar_color", navbar_color),
            ("card_color", card_color),
            ("bg_image", bg_image),
            ("navbar_image", navbar_image),
            ("card_image", card_image),
        ]:
            if value:
                cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))

        conn.commit()
        conn.close()
        return jsonify({"message": "Branding updated successfully"})
    except Exception as e:
        print("Branding update error:", e)
        return jsonify({"error": "Server error"}), 500

@bp_settings.route("", methods=["GET"])
def get_settings():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        rows = cursor.execute("SELECT key, value FROM settings").fetchall()
        conn.close()
        return jsonify({row["key"]: row["value"] for row in rows})
    except Exception as e:
        print("Error fetching settings:", e)
        return jsonify({"error": "Server error"}), 500

# In your Flask backend, e.g., in the existing bp_product or a dedicated bp_settings
@bp_settings.route("/theme", methods=["POST"])
def update_theme():
    if 'Authorization' not in request.headers:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    theme = data.get("theme")
    bg_color = data.get("bg_color")

    if not isinstance(theme, int) or theme not in range(1, 6):
        return jsonify({"error": "Invalid theme ID"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Save theme
        cursor.execute(
            "INSERT INTO settings (key, value) VALUES (?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            ("theme", str(theme))
        )

        # Save background color if provided
        if bg_color:
            cursor.execute(
                "INSERT INTO settings (key, value) VALUES (?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                ("bg_color", bg_color)
            )

        conn.commit()
        conn.close()
        return jsonify({"message": "Theme saved"})
    except Exception as e:
        print("Error saving theme:", e)
        return jsonify({"error": "Server error"}), 500
