import sqlite3

conn = sqlite3.connect('database.db')
c = conn.cursor()

# Set force_password_change = 1 for admin
c.execute('UPDATE users SET force_password_change = 1 WHERE username = ?', ("admin",))

conn.commit()
conn.close()

print("✅ Admin account reset: Force password change ON.")
