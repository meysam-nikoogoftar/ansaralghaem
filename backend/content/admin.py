from django.contrib import admin
from .models import Article, News, Gallery, Download, Slider, Announcement


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'views_count', 'created_at')
    list_filter = ('category', 'status')
    search_fields = ('title', 'author__first_name', 'author__last_name')
    readonly_fields = ('views_count', 'created_at')
    list_editable = ('status',)


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'views_count', 'published_at', 'created_at')
    list_filter = ('is_published',)
    search_fields = ('title',)
    list_editable = ('is_published',)


@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('uploader', 'title', 'category', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('uploader__first_name', 'uploader__last_name', 'title')
    list_editable = ('status',)


@admin.register(Download)
class DownloadAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('title',)


@admin.register(Slider)
class SliderAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'order', 'created_at')
    list_editable = ('is_active', 'order')


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('text', 'announcement_type', 'is_active', 'start_date', 'end_date')
    list_filter = ('announcement_type', 'is_active')
    list_editable = ('is_active',)