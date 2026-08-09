from rest_framework import serializers
from .models import Article, News, Gallery, Download, Slider, Announcement


class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_image = serializers.ImageField(source='author.profile_image', read_only=True)

    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ('author', 'status', 'approved_by', 'approved_at', 'views_count', 'created_at')


class CreateArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ('title', 'content', 'category', 'main_image', 'extra_image1', 'extra_image2', 'extra_image3', 'aparat_link', 'is_featured')


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'


class GallerySerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source='uploader.full_name', read_only=True)

    class Meta:
        model = Gallery
        fields = '__all__'
        read_only_fields = ('uploader', 'status', 'approved_by', 'approved_at', 'created_at')


class DownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Download
        fields = '__all__'


class SliderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slider
        fields = '__all__'


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'