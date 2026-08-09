from django.urls import path
from . import views

urlpatterns = [
    path('my/', views.MyTicketsView.as_view(), name='my_tickets'),
    path('create/', views.CreateTicketView.as_view(), name='create_ticket'),
    path('<int:pk>/', views.TicketDetailView.as_view(), name='ticket_detail'),
    path('<int:pk>/reply/', views.ReplyTicketView.as_view(), name='reply_ticket'),
    path('all/', views.AllTicketsView.as_view(), name='all_tickets'),
    path('<int:pk>/admin-reply/', views.AdminReplyTicketView.as_view(), name='admin_reply_ticket'),
    path('<int:pk>/close/', views.CloseTicketView.as_view(), name='close_ticket'),
]