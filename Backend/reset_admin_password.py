import sqlite3
from werkzeug.security import generate_password_hash

def reset_admin_password(new_password):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    password_hash = generate_password_hash(new_password)

    cursor.execute('''
        UPDATE users
        SET password_hash = ?, force_password_change = 1
        WHERE username = ?
    ''', (password_hash, "admin"))

    conn.commit()
    conn.close()
    print(f"✅ Admin password reset to '{new_password}'. Next login will force password change.")

if __name__ == "__main__":
    reset_admin_password("admin")
