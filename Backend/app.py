from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allow requests from frontend

# Dummy user data
users = {
    "admin": "password123"
}

@app.route("/login", methods=["POST"])
def login():
    data = request.json

@app.route("/")
def home():
    return jsonify({"message": "Welcome to Flower Store API!"})

if __name__ == "__main__":
    app.run(debug=True)