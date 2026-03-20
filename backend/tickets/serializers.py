from rest_framework import serializers
from .models import Ticket
from events.models import Event

class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source='event.title')
    attendee_name = serializers.ReadOnlyField(source='attendee.username')
    attendee_email = serializers.ReadOnlyField(source='attendee.email')
    event_date = serializers.ReadOnlyField(source='event.date')

    class Meta:
        model = Ticket
        fields = ['id', 'event', 'event_title', 'attendee', 'attendee_name', 'attendee_email', 'qr_code', 'status', 'verification_code', 'check_in_status', 'check_in_time', 'created_at', 'event_date']
        read_only_fields = ['attendee', 'qr_code', 'status', 'verification_code', 'check_in_status', 'check_in_time', 'created_at']

    def validate(self, data):
        event = data['event']
        if event.tickets.filter(status='booked').count() >= event.capacity:
            raise serializers.ValidationError("Event is full")
        return data
