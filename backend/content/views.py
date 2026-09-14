from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Article, News, Gallery, Download, Slider, Announcement
from .serializers import (
    ArticleSerializer, CreateArticleSerializer, NewsSerializer,
    GallerySerializer, DownloadSerializer, SliderSerializer, AnnouncementSerializer
)


class ArticleListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        queryset = Article.objects.filter(status='approved')
        category = self.request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class ArticleDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            article = Article.objects.get(pk=pk, status='approved')
            article.views_count += 1
            article.save()
            return Response(ArticleSerializer(article).data)
        except Article.DoesNotExist:
            return Response({'error': 'دلنوشته یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class CreateArticleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateArticleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyArticlesView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        return Article.objects.filter(author=self.request.user)


class NewsListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = NewsSerializer

    def get_queryset(self):
        return News.objects.filter(is_published=True)


class NewsDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            news = News.objects.get(pk=pk, is_published=True)
            news.views_count += 1
            news.save()
            return Response(NewsSerializer(news).data)
        except News.DoesNotExist:
            return Response({'error': 'خبر یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class GalleryListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = GallerySerializer

    def get_queryset(self):
        return Gallery.objects.filter(status='approved')


class CreateGalleryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = GallerySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploader=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyGalleryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GallerySerializer

    def get_queryset(self):
        return Gallery.objects.filter(uploader=self.request.user)


class DownloadListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = DownloadSerializer

    def get_queryset(self):
        queryset = Download.objects.all()
        category = self.request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class SliderListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SliderSerializer

    def get_queryset(self):
        return Slider.objects.filter(is_active=True)


class ActiveAnnouncementView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        now = timezone.now()
        return Announcement.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        )


# این بلاک‌ها رو به انتهای backend/content/views.py اضافه کن
# (بالای فایل باید IsAdminOrSuperAdmin ایمپورت بشه، پایین آورده شده)

from accounts.permissions import IsAdminOrSuperAdmin
from django.utils import timezone


class AdminArticleListView(generics.ListAPIView):
    """لیست همه‌ی دلنوشته‌ها (هر وضعیتی) برای بررسی ادمین."""
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        queryset = Article.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status', '')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


class AdminArticleActionView(APIView):
    """تایید یا رد یک دلنوشته. body: { "action": "approve" | "reject" }"""
    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request, pk):
        try:
            article = Article.objects.get(pk=pk)
        except Article.DoesNotExist:
            return Response({'error': 'دلنوشته یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            article.status = 'approved'
            article.approved_by = request.user
            article.approved_at = timezone.now()
        elif action == 'reject':
            article.status = 'rejected'
        else:
            return Response({'error': 'عملیات نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
        article.save()
        return Response(ArticleSerializer(article).data)


class AdminGalleryListView(generics.ListAPIView):
    """لیست همه‌ی تصاویر گالری (هر وضعیتی) برای بررسی ادمین."""
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = GallerySerializer

    def get_queryset(self):
        queryset = Gallery.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status', '')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


class AdminGalleryActionView(APIView):
    """تایید یا رد یک تصویر گالری. body: { "action": "approve" | "reject" }"""
    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request, pk):
        try:
            image = Gallery.objects.get(pk=pk)
        except Gallery.DoesNotExist:
            return Response({'error': 'تصویر یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            image.status = 'approved'
            image.approved_by = request.user
            image.approved_at = timezone.now()
        elif action == 'reject':
            image.status = 'rejected'
        else:
            return Response({'error': 'عملیات نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
        image.save()
        return Response(GallerySerializer(image).data)


class AdminNewsListView(generics.ListCreateAPIView):
    """لیست/ایجاد اخبار توسط ادمین (بدون نیاز به تایید، مستقیم منتشر می‌شه)."""
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = NewsSerializer
    queryset = News.objects.all().order_by('-created_at')


class AdminNewsDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ویرایش/حذف یک خبر."""
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = NewsSerializer
    queryset = News.objects.all()