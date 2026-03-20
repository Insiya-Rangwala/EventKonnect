import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import permissions
from django.contrib.auth import get_user_model
from events.models import Event
from tickets.models import Ticket
from django.utils import timezone
from django.db.models import Count, Q

User = get_user_model()

class IsAdminOrOrganizer(permissions.BasePermission):
    """
    Custom permission to only allow admins or organizers of the event to access it.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.role == User.ADMIN or request.user.is_staff:
            return True
        # Organizers can only access their own events
        if isinstance(obj, Event):
            return obj.organizer == request.user
        return False

# 1. System Analytics Report (Admin Only)
class ExportSystemAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="system_analytics.csv"'},
        )
        writer = csv.writer(response)
        
        # We can put some general stats at the top
        total_users = User.objects.count()
        total_events = Event.objects.count()
        total_tickets = Ticket.objects.count()
        
        writer.writerow(['Metric', 'Count'])
        writer.writerow(['Total Users', total_users])
        writer.writerow(['Total Events', total_events])
        writer.writerow(['Total Tickets', total_tickets])
        
        writer.writerow([]) # Blank line
        writer.writerow(['Event Category', 'Event Count'])
        
        events_by_category = Event.objects.values('category').annotate(count=Count('id'))
        for category in events_by_category:
            writer.writerow([category['category'], category['count']])

        return response


# 2. User Activity Report (Admin Only)
class ExportUserActivityView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="user_activity.csv"'},
        )
        writer = csv.writer(response)
        writer.writerow(['User ID', 'Username', 'Email', 'Role', 'Date Joined', 'Is Active'])
        
        users = User.objects.all().order_by('-date_joined')
        for user in users:
            writer.writerow([
                user.id,
                user.username,
                user.email,
                user.get_role_display(),
                user.date_joined.strftime('%Y-%m-%d %H:%M'),
                user.is_active
            ])
            
        return response


# 3. Organizer Event Report (Organizer or Admin)
class ExportOrganizerReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="organizer_events.csv"'},
        )
        writer = csv.writer(response)
        writer.writerow(['Event ID', 'Title', 'Date', 'Status', 'Capacity', 'Tickets Sold', 'Checked In'])
        
        if request.user.role == User.ADMIN or request.user.is_staff:
            events = Event.objects.all().order_by('-date')
        else:
            events = Event.objects.filter(organizer=request.user).order_by('-date')
            
        events = events.annotate(
            tickets_sold=Count('tickets', filter=~Q(tickets__status='cancelled')),
            checked_in=Count('tickets', filter=Q(tickets__status='used'))
        )
        
        for event in events:
            writer.writerow([
                event.id,
                event.title,
                event.date.strftime('%Y-%m-%d %H:%M'),
                event.get_status_display(),
                event.capacity,
                event.tickets_sold,
                event.checked_in
            ])
            
        return response


# 4. Event Registration Report
class ExportEventRegistrationsView(APIView):
    permission_classes = [IsAdminOrOrganizer]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            self.check_object_permissions(request, event)
        except Event.DoesNotExist:
            return HttpResponse("Event not found", status=404)
            
        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': f'attachment; filename="event_{event.id}_registrations.csv"'},
        )
        writer = csv.writer(response)
        writer.writerow(['Ticket ID', 'Attendee Name', 'Attendee Email', 'Booking Date', 'Ticket Status', 'Checked In'])
        
        tickets = Ticket.objects.filter(event=event).select_related('attendee').order_by('-created_at')
        for ticket in tickets:
            writer.writerow([
                ticket.id,
                ticket.attendee.get_full_name() or ticket.attendee.username,
                ticket.attendee.email,
                ticket.created_at.strftime('%Y-%m-%d %H:%M'),
                ticket.get_status_display(),
                'Yes' if ticket.check_in_status else 'No'
            ])
            
        return response


# 5. Attendance vs Registration Report
class ExportAttendanceVsRegistrationView(APIView):
    permission_classes = [IsAdminOrOrganizer]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            self.check_object_permissions(request, event)
        except Event.DoesNotExist:
            return HttpResponse("Event not found", status=404)
            
        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': f'attachment; filename="event_{event.id}_attendance_summary.csv"'},
        )
        writer = csv.writer(response)
        
        tickets = Ticket.objects.filter(event=event)
        total_registered = tickets.exclude(status='cancelled').count()
        total_checked_in = tickets.filter(status='used').count()
        no_shows = total_registered - total_checked_in
        
        writer.writerow(['Event Title', 'Capacity', 'Total Registered', 'Total Checked In', 'No Shows', 'Attendance Rate'])
        
        attendance_rate = f"{((total_checked_in / total_registered) * 100):.1f}%" if total_registered > 0 else "0%"
        
        writer.writerow([
            event.title,
            event.capacity,
            total_registered,
            total_checked_in,
            no_shows,
            attendance_rate
        ])
            
        return response


# 6. Event Participation / Attendance Report
class ExportEventParticipationView(APIView):
    permission_classes = [IsAdminOrOrganizer]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            self.check_object_permissions(request, event)
        except Event.DoesNotExist:
            return HttpResponse("Event not found", status=404)
            
        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': f'attachment; filename="event_{event.id}_participation.csv"'},
        )
        writer = csv.writer(response)
        writer.writerow(['Ticket ID', 'Attendee Name', 'Attendee Email', 'Check-in Time'])
        
        # Only get users who actually checked in (participated)
        tickets = Ticket.objects.filter(event=event, status='used').select_related('attendee').order_by('check_in_time')
        for ticket in tickets:
            writer.writerow([
                ticket.id,
                ticket.attendee.get_full_name() or ticket.attendee.username,
                ticket.attendee.email,
                ticket.check_in_time.strftime('%Y-%m-%d %H:%M') if ticket.check_in_time else 'Unknown'
            ])
            
        return response
