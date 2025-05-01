from flask import Blueprint, request, jsonify
from utils import get_db_connection
from flask import Response
import cv2


bp_camera = Blueprint("bp_camera", __name__, url_prefix="")

camera_enabled = False

@bp_camera.route("/debug-cameras")
def debug_cameras():
    conn = get_db_connection()
    rows = conn.execute("SELECT id, name, rtsp_url FROM cameras").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

def generate_mjpeg(rtsp_url):
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        print(f"Could not open {rtsp_url}")
        return

    try:
        while True:
            success, frame = cap.read()
            if not success:
                print("Stream read failed. Stopping.")
                break

            frame = cv2.resize(frame, (1024, 576))
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n'
            )
    except GeneratorExit:
        print("Client disconnected. Stopping stream.")
    finally:
        cap.release()
        print("RTSP connection closed.")


@bp_camera.route("/cameras/<int:camera_id>/stream")
def stream_camera(camera_id):
    conn = get_db_connection()
    row = conn.execute("SELECT rtsp_url FROM cameras WHERE id = ?", (camera_id,)).fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Camera not found"}), 404

    return Response(generate_mjpeg(row["rtsp_url"]),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@bp_camera.route("/camera-feature", methods=["GET", "PUT"])
def camera_feature():
    global camera_enabled
    if request.method == "GET":
        return jsonify({"enabled": camera_enabled})
    data = request.json
    camera_enabled = data.get("enabled", False)
    return jsonify({"message": "Camera feature updated", "enabled": camera_enabled})

@bp_camera.route("/cameras", methods=["GET", "POST"])
def handle_cameras():
    conn = get_db_connection()
    if request.method == "GET":
        rows = conn.execute("SELECT * FROM cameras").fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])
    
    data = request.json
    name = data.get("name")
    rtsp_url = data.get("rtsp_url")
    if not name or not rtsp_url:
        return jsonify({"error": "Missing fields"}), 400

    conn.execute("INSERT INTO cameras (name, rtsp_url) VALUES (?, ?)", (name, rtsp_url))
    conn.commit()
    conn.close()
    return jsonify({"message": "Camera added"})

@bp_camera.route("/cameras/<int:camera_id>", methods=["DELETE"])
def delete_camera(camera_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM cameras WHERE id = ?", (camera_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Camera deleted"})
