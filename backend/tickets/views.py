from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Ticket
from .serializers import TicketSerializer
from django.core.mail import send_mail
from django.conf import settings

class BookTicketView(generics.CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        event_id = request.data.get('event')
        
        # 1. Check Duplicates
        if Ticket.objects.filter(attendee=request.user, event_id=event_id).exclude(status='cancelled').exists():
            return Response({"error": "You have already registered for this event."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Check Capacity
        try:
            from events.models import Event
            event = Event.objects.get(pk=event_id)
            booked_count = event.tickets.exclude(status='cancelled').count()
            if booked_count >= event.capacity:
                return Response({"error": "Event is fully booked."}, status=status.HTTP_400_BAD_REQUEST)
        except Event.DoesNotExist:
             return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        ticket = serializer.save(attendee=self.request.user)
        # Generate verification code and QR Code
        ticket.generate_verification_code()
        ticket.generate_qr()
        
        # Send Email (Mocked/Console)
        try:
            send_mail(
                subject=f"Ticket Confirmed: {ticket.event.title}",
                message=f"Hi {ticket.attendee.username},\n\nYour ticket for {ticket.event.title} is confirmed.\nDate: {ticket.event.date}\nTicket ID: {ticket.id}\n\nThank you!",
                from_email=None, 
                recipient_list=[ticket.attendee.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email failed: {e}")
            
        # Create In-App Notification
        try:
            from core.models import Notification
            Notification.objects.create(
                user=ticket.attendee,
                title="Registration Confirmed",
                message=f"You successfully registered for '{ticket.event.title}'. Check 'My Tickets' for your QR code.",
                type='success'
            )
        except Exception as e:
            print(f"Notification failed: {e}")

class MyTicketsView(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(attendee=self.request.user)

class VerifyTicketView(APIView):
    # Organizer or Admin
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ticket_id = request.data.get('ticket_id')
        verification_code = request.data.get('verification_code')
        
        try:
            if verification_code:
                ticket = Ticket.objects.get(verification_code=verification_code)
            elif ticket_id:
                ticket = Ticket.objects.get(id=ticket_id)
            else:
                return Response({'status': 'error', 'message': 'Provide ticket_id or verification_code'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Check permissions: User must be admin or organizer of the event
            if request.user.role == 'admin' or ticket.event.organizer == request.user:
                if ticket.status == 'cancelled':
                    return Response({'status': 'invalid', 'message': 'Ticket cancelled'})
                
                # Verify that today is the event date
                from django.utils import timezone
                # Check based on event's start date and end date if available, or just date
                event_date = ticket.event.date.date()
                today = timezone.localtime(timezone.now()).date()
                
                if event_date != today:
                    return Response({'status': 'invalid', 'message': f'Check-in is only allowed on the day of the event ({event_date}).'})
                
                if ticket.check_in_status:
                    return Response({'status': 'used', 'message': 'Ticket already checked in'})
                
                # Mark as checked in
                from django.utils import timezone
                ticket.check_in_status = True
                ticket.check_in_time = timezone.now()
                ticket.status = 'used'
                ticket.save()
                return Response({'status': 'valid', 'message': 'Check-in successful'})
            else:
                return Response({'status': 'error', 'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        except Ticket.DoesNotExist:
            return Response({'status': 'error', 'message': 'Invalid or not found ticket'}, status=status.HTTP_404_NOT_FOUND)

class CancelTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
            # Permission: Only attendee can cancel their own ticket
            if ticket.attendee != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            if ticket.status == 'cancelled':
                return Response({'error': 'Ticket already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
            
            if ticket.status == 'used':
                return Response({'error': 'Cannot cancel a used ticket'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Allow cancellation based on global System Settings Policy
            from django.utils import timezone
            from datetime import timedelta
            from core.models import SystemSettings
            
            if ticket.event.date <= timezone.now():
                return Response({'error': 'Cannot cancel ticket for past event'}, status=status.HTTP_400_BAD_REQUEST)

            sys_settings = SystemSettings.load()
            policy = sys_settings.cancellation_policy
            time_until = ticket.event.date - timezone.now()
            
            refund_msg = ""
            if policy == 'strict':
                return Response({'error': 'System Policy (Strict): No cancellations or refunds allowed.'}, status=status.HTTP_400_BAD_REQUEST)
            elif policy == 'flexible':
                if time_until < timedelta(hours=24):
                    return Response({'error': 'System Policy (Flexible): Cancellations are only permitted up to 24 hours before the event.'}, status=status.HTTP_400_BAD_REQUEST)
                refund_msg = " (100% Refund)"
            elif policy == 'moderate':
                refund_msg = " (50% Refund Applied)"

            ticket.status = 'cancelled'
            ticket.save()
            
            # TODO: Notify Organizer
            
            return Response({'status': 'cancelled', 'message': f'Ticket cancelled successfully{refund_msg}'})
        except Ticket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
