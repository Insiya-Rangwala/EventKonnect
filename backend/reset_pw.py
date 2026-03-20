import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    org_user = User.objects.get(username='organizer')
    org_user.set_password('password123')
    org_user.save()
    print("Password reset for organizer@example.com to password123")
except User.DoesNotExist:
    print("Organizer user not found")

try:
    att_user = User.objects.get(username='attendee')
    att_user.set_password('password123')
    att_user.save()
    print("Password reset for attendee@example.com to password123")
except User.DoesNotExist:
    print("Attendee user not found")
