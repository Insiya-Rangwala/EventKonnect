import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

users = User.objects.all()
print(f"Total Users: {users.count()}")
for user in users:
    print(f"User: {user.username}, Email: {user.email}, Role: {user.role}, Is Active: {user.is_active}")
