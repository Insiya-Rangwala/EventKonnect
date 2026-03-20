from django.urls import path
from .views import AdminDashboardView, OrganizerDashboardView, AttendeeDashboardView, SystemAnalyticsView
from .export_views import (
    ExportSystemAnalyticsView, ExportUserActivityView, ExportOrganizerReportView,
    ExportEventRegistrationsView, ExportAttendanceVsRegistrationView, ExportEventParticipationView
)

urlpatterns = [
    path('admin/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('organizer/', OrganizerDashboardView.as_view(), name='organizer_dashboard'),
    path('attendee/', AttendeeDashboardView.as_view(), name='attendee_dashboard'),
    path('system/', SystemAnalyticsView.as_view(), name='system_analytics'),

    # Export Endpoints
    path('export/system/', ExportSystemAnalyticsView.as_view(), name='export_system_analytics'),
    path('export/users/', ExportUserActivityView.as_view(), name='export_user_activity'),
    path('export/organizer/', ExportOrganizerReportView.as_view(), name='export_organizer_report'),
    path('export/event/<int:event_id>/registrations/', ExportEventRegistrationsView.as_view(), name='export_event_registrations'),
    path('export/event/<int:event_id>/attendance-summary/', ExportAttendanceVsRegistrationView.as_view(), name='export_event_attendance_summary'),
    path('export/event/<int:event_id>/participation/', ExportEventParticipationView.as_view(), name='export_event_participation'),
]
