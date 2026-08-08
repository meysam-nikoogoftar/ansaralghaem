from django.contrib import admin
from .models import Ticket, TicketMessage


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'priority', 'status', 'created_at')
    list_filter = ('priority', 'status')
    search_fields = ('user__first_name', 'user__last_name', 'title')
    list_editable = ('status',)


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'sender', 'created_at')
    search_fields = ('sender__first_name', 'sender__last_name', 'ticket__title')