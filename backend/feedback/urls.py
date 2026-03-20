from django.urls import path
from .views import CreateFeedbackView, EventFeedbackList

urlpatterns = [
    path('create/', CreateFeedbackView.as_view(), name='create_feedback'),
    path('event/<int:event_id>/', EventFeedbackList.as_view(), name='event_feedback'),
]
