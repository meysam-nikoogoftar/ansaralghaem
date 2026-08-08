from django.contrib import admin
from .models import Reaction, Comment, LoveWall, Poll, PollOption, PollVote, TripTimeline, Badge, UserBadge, PilgrimLocation


@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'content_id', 'reaction_type', 'created_at')
    list_filter = ('content_type', 'reaction_type')
    search_fields = ('user__first_name', 'user__last_name')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'content_id', 'text', 'status', 'created_at')
    list_filter = ('content_type', 'status')
    search_fields = ('user__first_name', 'user__last_name', 'text')
    list_editable = ('status',)


@admin.register(LoveWall)
class LoveWallAdmin(admin.ModelAdmin):
    list_display = ('user', 'text', 'created_at')
    search_fields = ('user__first_name', 'user__last_name', 'text')


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ('question', 'is_active', 'start_date', 'end_date')
    list_editable = ('is_active',)


@admin.register(PollOption)
class PollOptionAdmin(admin.ModelAdmin):
    list_display = ('poll', 'text')


@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'option', 'created_at')


@admin.register(TripTimeline)
class TripTimelineAdmin(admin.ModelAdmin):
    list_display = ('user', 'trip', 'title', 'event_date', 'created_at')
    list_filter = ('trip',)
    search_fields = ('user__first_name', 'user__last_name', 'title')


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon', 'required_trips')


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'awarded_at')
    search_fields = ('user__first_name', 'user__last_name')


@admin.register(PilgrimLocation)
class PilgrimLocationAdmin(admin.ModelAdmin):
    list_display = ('user', 'latitude', 'longitude', 'recorded_at')
    search_fields = ('user__first_name', 'user__last_name')