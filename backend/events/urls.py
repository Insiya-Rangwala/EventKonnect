from django.urls import path
from .views import (PublicEventList, EventCreateView, OrganizerMyEvents, 
                    EventDetailView, AdminEventList, ApproveEventView, MemoryBookCreateView, MemoryBookListView,
                    EventCancelView, EventCompleteView, EventAttendeesView, MemoryCommentCreateView)

urlpatterns = [
    path('public/', PublicEventList.as_view(), name='public_events'),
    path('create/', EventCreateView.as_view(), name='create_event'),
    path('my-events/', OrganizerMyEvents.as_view(), name='my_events'),
    path('<int:pk>/', EventDetailView.as_view(), name='event_detail'),
    path('all/', AdminEventList.as_view(), name='admin_all_events'),
    path('approve/<int:pk>/', ApproveEventView.as_view(), name='approve_event'),
    path('memory/create/', MemoryBookCreateView.as_view(), name='create_memory'),
    path('memory/comment/', MemoryCommentCreateView.as_view(), name='create_memory_comment'),
    path('memory/<int:event_id>/', MemoryBookListView.as_view(), name='list_memory'),
    path('cancel/<int:pk>/', EventCancelView.as_view(), name='cancel_event'),
    path('complete/<int:pk>/', EventCompleteView.as_view(), name='complete_event'),
    path('attendees/<int:pk>/', EventAttendeesView.as_view(), name='event_attendees'),
]
