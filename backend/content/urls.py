from django.urls import path
from . import views

urlpatterns = [
    path('articles/', views.ArticleListView.as_view(), name='article_list'),
    path('articles/<int:pk>/', views.ArticleDetailView.as_view(), name='article_detail'),
    path('articles/create/', views.CreateArticleView.as_view(), name='create_article'),
    path('articles/my/', views.MyArticlesView.as_view(), name='my_articles'),
    path('news/', views.NewsListView.as_view(), name='news_list'),
    path('news/<int:pk>/', views.NewsDetailView.as_view(), name='news_detail'),
    path('gallery/', views.GalleryListView.as_view(), name='gallery_list'),
    path('gallery/create/', views.CreateGalleryView.as_view(), name='create_gallery'),
    path('gallery/my/', views.MyGalleryView.as_view(), name='my_gallery'),
    path('downloads/', views.DownloadListView.as_view(), name='download_list'),
    path('sliders/', views.SliderListView.as_view(), name='slider_list'),
    path('announcements/', views.ActiveAnnouncementView.as_view(), name='announcements'),
]