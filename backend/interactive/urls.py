from django.urls import path
from . import views

urlpatterns = [
    path('react/', views.ReactView.as_view(), name='react'),
    path('reactions/<str:content_type>/<int:content_id>/', views.ContentReactionsView.as_view(), name='content_reactions'),
    path('comments/', views.CommentListView.as_view(), name='comment_list'),
    path('comments/create/', views.CreateCommentView.as_view(), name='create_comment'),
    path('love-wall/', views.LoveWallListView.as_view(), name='love_wall_list'),
    path('love-wall/create/', views.CreateLoveWallView.as_view(), name='create_love_wall'),
    path('poll/active/', views.ActivePollView.as_view(), name='active_poll'),
    path('poll/vote/', views.VotePollView.as_view(), name='vote_poll'),
    path('timeline/', views.TripTimelineListView.as_view(), name='timeline_list'),
    path('timeline/create/', views.CreateTripTimelineView.as_view(), name='create_timeline'),
    path('my-badges/', views.MyBadgesView.as_view(), name='my_badges'),
    path('locations/', views.PilgrimLocationListView.as_view(), name='pilgrim_locations'),
    path('locations/create/', views.CreatePilgrimLocationView.as_view(), name='create_location'),
]