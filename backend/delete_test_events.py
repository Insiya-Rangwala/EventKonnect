import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from events.models import Event

# Find events with 'test' or 'flow' in the title (case-insensitive)
test_events = Event.objects.filter(title__icontains='test') | Event.objects.filter(title__icontains='flow')

count = test_events.count()
print(f"Found {count} test events. Deleting...")
test_events.delete()
print("Deletion complete.")
