import sqlite3
import json
from werkzeug.security import generate_password_hash


admin_avatar = "static/images/admin.png"

# Create/connect to database
conn = sqlite3.connect('database.db')
c = conn.cursor()

# Create users table
c.execute('''
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_picture TEXT,
    permissions TEXT,
    force_password_change BOOLEAN DEFAULT 1
)
''')

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


c.execute('''
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  stock INTEGER DEFAULT 0,
  price REAL DEFAULT 0,
  image_url TEXT,
  tags TEXT -- JSON array of tag IDs
)
'''
)

c.execute('''
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
)'''
)

c.execute('''
CREATE TABLE product_tags (
  product_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (product_id, tag_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
)'''
)

c.execute('''
CREATE TABLE cameras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rtsp_url TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT 1
)'''
)

c.execute('''
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
)'''
)

c.execute('''
INSERT INTO settings (key, value) VALUES ('camera_enabled', '1'\
)'''
)

c.execute('''
CREATE TABLE product_specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    key TEXT,
    value TEXT
)'''
)

c.execute('''
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    username TEXT,
    rating INTEGER,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)'''
)

conn.commit()
conn.close()

print("✅ Database created and default admin user added.")
