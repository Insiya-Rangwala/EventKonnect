from django.urls import path
from .views import BookTicketView, MyTicketsView, VerifyTicketView, CancelTicketView

urlpatterns = [
    path('book/', BookTicketView.as_view(), name='book_ticket'),
    path('my-tickets/', MyTicketsView.as_view(), name='my_tickets'),
    path('verify/', VerifyTicketView.as_view(), name='verify_ticket'),
    path('cancel/<int:pk>/', CancelTicketView.as_view(), name='cancel_ticket'),
]
