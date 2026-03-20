from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from events.models import Event
from tickets.models import Ticket
from django.db import models
from django.db.models import Count
from django.db.models.functions import TruncMonth

User = get_user_model()

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_events = Event.objects.count()
        pending_approvals = Event.objects.filter(status='pending').count()
        
        # Events by Category (Pie Chart)
        events_by_category = Event.objects.values('category').annotate(count=Count('id'))
        
        # Registrations over time (Simple Example: Tickets created per month)
        registrations_over_time = Ticket.objects.annotate(month=TruncMonth('created_at')).values('month').annotate(count=Count('id')).order_by('month')

        return Response({
            "total_users": total_users,
            "total_events": total_events,
            "pending_approvals": pending_approvals,
            "events_by_category": events_by_category,
            "registrations_over_time": registrations_over_time
        })

class OrganizerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        my_events = Event.objects.filter(organizer=request.user)
        total_created = my_events.count()
        
        # Registrations per Event (Bar Chart)
        registrations_by_event = my_events.annotate(
            ticket_count=Count('tickets'),
            checkin_count=Count('tickets', filter=models.Q(tickets__status='used'))
        ).values('id', 'title', 'status', 'ticket_count', 'checkin_count')
        
        total_registrations = Ticket.objects.filter(event__in=my_events).exclude(status='cancelled').count()
        total_checkins = Ticket.objects.filter(event__in=my_events, status='used').count() # Assuming 'used' means checked-in

        return Response({
            "total_created": total_created,
            "total_registrations": total_registrations,
            "total_checkins": total_checkins,
            "registrations_by_event": registrations_by_event,
            "popular_event": my_events.annotate(ticket_count=Count('tickets')).order_by('-ticket_count').first().title if my_events.exists() else None
        })

class AttendeeDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        my_tickets = Ticket.objects.filter(attendee=request.user).exclude(status='cancelled')
        registered_count = my_tickets.count()
        
        from django.utils import timezone
        upcoming_count = my_tickets.filter(event__date__gte=timezone.now()).count()

        return Response({
            "registered_events": registered_count,
            "upcoming_events": upcoming_count,
            "notifications": 0 
        })

class SystemAnalyticsView(APIView):
    # Depending on requirements, could be IsAdminUser. Using IsAuthenticated to match existing app patterns if Admin is just a role.
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_events = Event.objects.count()
        total_registrations = Ticket.objects.count()
        total_organizers = User.objects.filter(role='organizer').count()
        total_attendees = User.objects.filter(role='attendee').count()

        from django.db.models.functions import TruncMonth
        from django.db.models import Count

        # Real historical data logic
        monthly_registrations = (
            Ticket.objects
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        registrations_trend = []
        for entry in monthly_registrations:
            if entry['month']:
                month_name = entry['month'].strftime('%b') # e.g., 'Jan', 'Feb'
                # If there are multiple years, you might want '%b %Y'
                registrations_trend.append({'date': month_name, 'count': entry['count']})
        
        # If no tickets yet, provide a flatline so the chart doesn't break
        if not registrations_trend:
            from django.utils import timezone
            current_month = timezone.now().strftime('%b')
            registrations_trend = [{'date': current_month, 'count': 0}]

        from core.models import SystemSettings
        from users.models import College
        
        college_wise_stats = []
        if SystemSettings.load().college_mode:
            for c in College.objects.all():
                students = User.objects.filter(college=c, role='attendee', is_college_verified=True).count()
                evts = Event.objects.filter(college=c).count()
                college_wise_stats.append({
                    'name': c.name,
                    'student_count': students,
                    'event_count': evts
                })

        return Response({
            "total_events": total_events,
            "total_registrations": total_registrations,
            "total_organizers": total_organizers,
            "total_attendees": total_attendees,
            "registrations_trend": registrations_trend,
            "college_wise_stats": college_wise_stats
        })
