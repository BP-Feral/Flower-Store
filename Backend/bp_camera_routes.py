from flask import Blueprint, request, jsonify
from utils import get_db_connection

bp_camera = Blueprint("bp_camera", __name__, url_prefix="")

camera_enabled = False

@bp_camera.route("/cameras", methods=["GET"])
def get_cameras():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM cameras WHERE is_enabled = 1").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp_camera.route("/cameras", methods=["POST"])
def add_camera():
    data = request.json
    name = data.get("name")
    rtsp_url = data.get("rtsp_url")
    if not name or not rtsp_url:
        return jsonify({"error": "Missing fields"}), 400
    conn = get_db_connection()
    conn.execute("INSERT INTO cameras (name, rtsp_url) VALUES (?, ?)", (name, rtsp_url))
    conn.commit()
    conn.close()
    return jsonify({"message": "Camera added successfully"})

@bp_camera.route("/cameras/<int:camera_id>", methods=["DELETE"])
def delete_camera(camera_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM cameras WHERE id = ?", (camera_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Camera removed successfully"})

@bp_camera.route("/camera-feature", methods=["GET", "PUT"])
def camera_feature_toggle():
    global camera_enabled

    if request.method == "GET":
        return jsonify({"enabled": camera_enabled})

    if request.method == "PUT":
        data = request.json
        camera_enabled = data.get("enabled", False)
        return jsonify({"message": "Camera feature updated", "enabled": camera_enabled})