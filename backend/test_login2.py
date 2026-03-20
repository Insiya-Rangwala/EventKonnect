import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(username='admin')
user.set_password('password123')
user.save()
print("Password updated for admin user.")

url = "http://127.0.0.1:8000/api/users/login/"
data = {"username": "admin@example.com", "password": "password123"}
response = requests.post(url, json=data)
print(f"Login Response: {response.text}")
