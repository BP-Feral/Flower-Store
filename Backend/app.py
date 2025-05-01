from flask import Flask
from flask_cors import CORS
from utils import get_db_connection

from bp_auth import bp_auth
from bp_user_routes import bp_user
from bp_product_routes import bp_product
from bp_camera_routes import bp_camera

app = Flask(__name__)
CORS(app)

app.register_blueprint(bp_auth)
app.register_blueprint(bp_user)
app.register_blueprint(bp_product)
app.register_blueprint(bp_camera)

@app.route('/')
def home():
    return {"message": "Welcome to Flower Store API!"}

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
