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
        "manage_users": True
    }),
    True
))

conn.commit()
conn.close()

print("✅ Database created and default admin user added.")
