import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from events.models import Event
from django.contrib.auth import get_user_model
User = get_user_model()

events = Event.objects.all()
print(f"Total events: {events.count()}")
for event in events:
    print(f"Event: {event.title}, Organizer: {event.organizer.username}, Status: {event.status}")
