import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import models
from django.db.models import Count, Q
from events.models import Event
from django.contrib.auth import get_user_model

User = get_user_model()
try:
    organizer = User.objects.get(email='organizer@example.com') # Verify this email exists or use first organizer
    my_events = Event.objects.filter(organizer=organizer)
    
    print("Testing annotation...")
    registrations_by_event = my_events.annotate(
        ticket_count=Count('tickets'),
        checkin_count=Count('tickets', filter=models.Q(tickets__status='used'))
    ).values('id', 'title', 'ticket_count', 'checkin_count')
    
    print(list(registrations_by_event))
    
    print("Testing popular event...")
    # This was the likely culprit line in the view:
    # popular_event = my_events.order_by('-tickets__count').first().title
    
    # Let's try to reproduce the error
    try:
        pop = my_events.annotate(count=Count('tickets')).order_by('-count').first()
        print(f"Popular: {pop.title if pop else 'None'}")
    except Exception as e:
        print(f"Popular Event Error: {e}")

except Exception as e:
    print(f"General Error: {e}")
    import traceback
    traceback.print_exc()
