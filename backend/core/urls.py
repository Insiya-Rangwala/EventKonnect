from django.urls import path
from .views import ChatbotView, SystemSettingsView

urlpatterns = [
    path('chatbot/', ChatbotView.as_view(), name='chatbot'),
    path('settings/', SystemSettingsView.as_view(), name='system-settings'),
]
