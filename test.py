import bcrypt
import os

# Password to hash
password = "123456"

# Generate salt
salt = bcrypt.gensalt()

# Hash the password
hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

# Print the hashed password
print(hashed_password.decode('utf-8'))