import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from events.models import Event

# Get an approved event
event = Event.objects.filter(status='approved').first()
if event:
    print(f"Testing PATCH on event {event.id} ({event.title})")
    
    # Get organizer token
    from rest_framework.authtoken.models import Token
    token = Token.objects.get(user=event.organizer)
    
    url = f"http://127.0.0.1:8000/api/events/{event.id}/"
    headers = {"Authorization": f"Token {token.key}"}
    data = {"status": "completed"}
    
    response = requests.patch(url, headers=headers, json=data)
    print(response.status_code)
    print(response.text)
else:
    print("No approved events found.")
