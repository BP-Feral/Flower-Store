import sqlite3
import json
from werkzeug.security import generate_password_hash


admin_avatar = "static/images/admin.png"

# Create/connect to database
conn = sqlite3.connect('database.db')
c = conn.cursor()
# Insert default admin user with avatar
c.execute('''
INSERT INTO users (username, password_hash, profile_picture, permissions, force_password_change)
VALUES (?, ?, ?, ?, ?)
''', (
    "admin",
    generate_password_hash("admin"),  # Default password
    admin_avatar,
    json.dumps({
        "adauga_produs": True,
        "modifica_produs": True,
        "sterge_produs": True,
        "citire_tag": True,
        "adauga_tag": True,
        "sterge_tag": True,
        "modifica_tag": True,
        "administreaza_personal": True,
        "acces_camere": True,
        "customizare_magazin": True
    }),
    True
))
conn.commit()
conn.close()