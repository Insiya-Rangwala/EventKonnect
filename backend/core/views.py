from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from events.models import Event

class ChatbotView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        message = request.data.get('message', '').lower()
        
        response_text = "I'm sorry, I didn't quite catch that. You can ask me about events, registration, or your dashboard."
        links = []

        if 'hello' in message or 'hi' in message:
            response_text = "Hello! I'm your EventKonnect assistant. How can I help you today?"
            
        elif 'what is eventkonnect' in message or ('about' in message and 'eventkonnect' in message):
            response_text = "EventKonnect is a smart event management system that allows organizers to create events and attendees to register and participate seamlessly."
            
        elif 'how do i register' in message or ('register' in message and 'how' in message):
            response_text = "Click on the Register button on the homepage, fill in your details, select your role, and submit the form."
            links = [{'text': 'Register Now', 'url': '/register'}]
            
        elif 'how do i login' in message or ('login' in message and 'how' in message):
            response_text = "Click Login on the homepage and enter your registered email and password."
            links = [{'text': 'Login', 'url': '/login'}]
            
        elif 'is registration free' in message or 'free registration' in message:
            response_text = "Yes, event registration on EventKonnect is free unless specified by the organizer."
        
        elif 'register' in message or 'book' in message or 'ticket' in message:
            response_text = "To register for an event, browse our events page, select an event, and click 'Register Now'. You can view your tickets in 'My Tickets'."
            links = [{'text': 'Browse Events', 'url': '/events'}, {'text': 'My Tickets', 'url': '/my-ticket'}]

        elif 'create event' in message or 'host' in message:
            response_text = "If you are an organizer, you can create new events from your dashboard."
            links = [{'text': 'Create Event', 'url': '/create-event'}]

        elif 'dashboard' in message:
            response_text = "You can access your dashboard based on your role."
            links = [{'text': 'Go to Dashboard', 'url': '/login'}] # Redirects to correct dashboard

        elif 'contact' in message or 'support' in message:
            response_text = "You can reach our support team at support@eventkonnect.com."

        elif 'event' in message:
            # Simple recommendation logic
            upcoming_event = Event.objects.filter(status='approved').order_by('date').first()
            if upcoming_event:
                response_text = f"We have some great events coming up! For example, check out '{upcoming_event.title}' on {upcoming_event.date.strftime('%B %d')}."
                links = [{'text': 'View Event', 'url': f'/event-details/{upcoming_event.id}'}]
            else:
                response_text = "You can see all our upcoming events on the public events page."
                links = [{'text': 'Browse Events', 'url': '/events'}]

        return Response({
            "response": response_text,
            "links": links
        })

from .models import SystemSettings
from .serializers import SystemSettingsSerializer

class SystemSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        settings_obj = SystemSettings.load()
        serializer = SystemSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        settings_obj = SystemSettings.load()
        serializer = SystemSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
