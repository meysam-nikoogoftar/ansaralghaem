from django.contrib import admin
from django.urls import path, include, re_path
from accounts.documents import profile_document
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    re_path(r'^media/(?P<directory>national_cards|student_cards|passports|commitments)/(?P<name>.*)$', profile_document),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/trips/', include('trips.urls')),
    path('api/financial/', include('financial.urls')),
    path('api/content/', include('content.urls')),
    path('api/interactive/', include('interactive.urls')),
    path('api/shop/', include('shop.urls')),
    path('api/tickets/', include('tickets.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
