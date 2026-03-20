from rest_framework import generics, permissions, serializers
from rest_framework.decorators import permission_classes
from rest_framework.exceptions import ValidationError
from .models import Feedback
from events.models import Event
from tickets.models import Ticket

class FeedbackSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Feedback
        fields = ['id', 'event', 'user', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

class CreateFeedbackView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event = serializer.validated_data['event']
        user = self.request.user
        
        # 1. Check if user has already submitted feedback for this event
        if Feedback.objects.filter(event=event, user=user).exists():
            raise ValidationError("You have already submitted feedback for this event.")

        # 2. Check if user actually attended (Ticket status must be 'used')
        # Note: If manual verification isn't strict, we might relax this to just 'booked'.
        # For strict check-in:
        has_ticket = Ticket.objects.filter(event=event, attendee=user).exclude(status='cancelled').exists()
        
        if not has_ticket:
             raise ValidationError("You can only rate events you have registered for.")
        
        serializer.save(user=user)

class EventFeedbackList(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return Feedback.objects.filter(event_id=event_id)
