from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Event, MemoryBook, MemoryComment
from .serializers import EventSerializer, MemoryBookSerializer, MemoryCommentSerializer
from django.db.models import Q
from users.permissions import IsOrganizerOrAdmin, IsAdmin, IsOrganizer # Import shared permissions
from users.permissions import IsOrganizerOrAdmin, IsAdmin, IsOrganizer # Import shared permissions

class PublicEventList(generics.ListAPIView):
    # Publicly list approved events
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Event.objects.filter(status='approved')
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        date_sort = self.request.query_params.get('sort', None) # 'date' or '-date'
        req_visibility = self.request.query_params.get('visibility', None)
        
        from core.models import SystemSettings
        settings = SystemSettings.load()
        if settings.college_mode:
            user = self.request.user
            if user.is_authenticated and user.role == 'attendee' and getattr(user, 'is_college_verified', False) and getattr(user, 'college', None):
                if req_visibility == 'COLLEGE':
                    queryset = queryset.filter(visibility='COLLEGE', college=user.college)
                else:
                    queryset = queryset.filter(
                        Q(visibility='PUBLIC') | 
                        Q(visibility='COLLEGE', college=user.college)
                    )
            else:
                queryset = queryset.filter(visibility='PUBLIC')
        else:
             if req_visibility == 'COLLEGE':
                 queryset = queryset.none()
        
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(venue__icontains=search))
        
        if category and category != 'All':
            queryset = queryset.filter(category=category)

        if date_sort == 'upcoming':
            queryset = queryset.order_by('date')
        elif date_sort == 'newest':
            queryset = queryset.order_by('-created_at')

        return queryset

class EventCreateView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsOrganizerOrAdmin]
    # File upload verification handled by DRF Parser classes implicitly but good to be explicit if needed
    # parser_classes = (MultiPartParser, FormParser) 

class OrganizerMyEvents(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsOrganizer] # STRICTER: Only organizers

    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user).order_by('-created_at')

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Event.objects.all()
        from core.models import SystemSettings
        settings = SystemSettings.load()
        user = self.request.user
        
        # Don't restrict organizers viewing their own event, or admins
        if user.is_authenticated and user.role in ['admin', 'organizer']:
            return queryset
            
        if settings.college_mode:
            if user.is_authenticated and user.role == 'attendee' and getattr(user, 'is_college_verified', False) and user.college:
                queryset = queryset.filter(Q(visibility='PUBLIC') | Q(visibility='COLLEGE', college=user.college))
            else:
                queryset = queryset.filter(visibility='PUBLIC')
        return queryset

    # Check object permission (only organizer can edit their own) needs custom permission or check in perform_update

    def perform_destroy(self, instance):
        if instance.status == 'approved' or instance.status == 'completed':
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Approved or completed events cannot be securely deleted.")
        super().perform_destroy(instance)

class AdminEventList(generics.ListAPIView):
    # List all events (pending included)
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    permission_classes = [IsAdmin]

class ApproveEventView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
            action = request.data.get('action') # approve or reject
            reason = request.data.get('reason', '')
            
            from core.models import Notification  # Import locally to avoid circular import

            if action == 'approve':
                event.status = 'approved'
                event.rejection_reason = None # Clear reason if approved
                # Notify Organizer
                Notification.objects.create(
                    user=event.organizer,
                    title="Event Approved",
                    message=f"Your event '{event.title}' has been approved and is now live!",
                    type='success'
                )
            elif action == 'reject':
                event.status = 'rejected'
                event.rejection_reason = reason
                # Notify Organizer
                Notification.objects.create(
                    user=event.organizer,
                    title="Event Rejected",
                    message=f"Your event '{event.title}' was rejected. Reason: {reason}",
                    type='alert'
                )
            
            event.save()
            return Response({'status': event.status})
        except Event.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class MemoryBookCreateView(generics.CreateAPIView):
    queryset = MemoryBook.objects.all()
    serializer_class = MemoryBookSerializer
    permission_classes = [IsOrganizerOrAdmin]

    def perform_create(self, serializer):
        # Validate that the organizer creating this memory book actually owns the event
        event_id = self.request.data.get('event')
        event = Event.objects.get(id=event_id)
        
        if self.request.user.role != 'admin' and event.organizer != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only upload memories to your own events.")
            
        serializer.save(uploaded_by=self.request.user)

class MemoryCommentCreateView(generics.CreateAPIView):
    queryset = MemoryComment.objects.all()
    serializer_class = MemoryCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        event = Event.objects.get(id=event_id)

        # Validate that the user actually registered for this event before commenting
        from tickets.models import Ticket
        has_ticket = Ticket.objects.filter(event=event, attendee=self.request.user).exclude(status='cancelled').exists()
        
        if not has_ticket and self.request.user.role != 'admin' and event.organizer != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be registered for this event to leave a memory comment.")

        serializer.save(user=self.request.user)

class MemoryBookListView(generics.ListAPIView):
    serializer_class = MemoryBookSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return MemoryBook.objects.filter(event_id=event_id).order_by('-created_at')

class EventCancelView(APIView):
    permission_classes = [IsOrganizerOrAdmin]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
            # Check permission: Organizer owns it OR Admin
            if request.user.role != 'admin' and event.organizer != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            if event.status == 'approved' or event.status == 'completed':
                return Response({'error': 'Approved or completed events cannot be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

            if event.status == 'cancelled':
                return Response({'error': 'Event already cancelled'}, status=status.HTTP_400_BAD_REQUEST)

            event.status = 'cancelled'
            event.save()
            
            # TODO: Add notification logic here to notify all attendees
            
            return Response({'status': 'cancelled', 'message': 'Event cancelled successfully'})
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

class EventCompleteView(APIView):
    permission_classes = [IsOrganizerOrAdmin]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
            # Check permission: Organizer owns it OR Admin
            if request.user.role != 'admin' and event.organizer != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            if event.status != 'approved':
                return Response({'error': 'Only approved events can be marked as completed.'}, status=status.HTTP_400_BAD_REQUEST)

            event.status = 'completed'
            event.save()
            return Response({'status': 'completed', 'message': 'Event marked as completed successfully'})
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

class EventAttendeesView(generics.ListAPIView):
    serializer_class = EventSerializer # Need a TicketSerializer or UserSerializer? Probably Ticket to see status.
    permission_classes = [IsOrganizerOrAdmin]

    def get_queryset(self):
        event_id = self.kwargs['pk']
        try:
            event = Event.objects.get(pk=event_id)
            if self.request.user.role != 'admin' and event.organizer != self.request.user:
                 return Event.objects.none() # Or raise PermissionDenied
            
            # Return tickets for this event
            from tickets.models import Ticket
            return Ticket.objects.filter(event=event).select_related('attendee')
        except Event.DoesNotExist:
             return []

    def list(self, request, *args, **kwargs):
        # Override list to use TicketSerializer
        queryset = self.get_queryset()
        from tickets.serializers import TicketSerializer
        serializer = TicketSerializer(queryset, many=True)
        return Response(serializer.data)
