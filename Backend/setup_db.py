import sqlite3
import json
from werkzeug.security import generate_password_hash

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

# Insert default admin user
c.execute('''
INSERT INTO users (username, password_hash, permissions, force_password_change)
VALUES (?, ?, ?, ?)
''', (
    "admin",
    generate_password_hash("admin"),  # Default password
    json.dumps({
        "add_product": True,
        "edit_product": True,
        "delete_product": True,
        "view_tags": True,
        "create_tags": True,
        "delete_tags": True,
        "edit_tags": True,
        "manage_users": True,
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

conn.commit()
conn.close()

print("✅ Database created and default admin user added.")
