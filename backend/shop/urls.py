from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.ProductCategoryListView.as_view(), name='category_list'),
    path('products/', views.ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('orders/create/', views.CreateOrderView.as_view(), name='create_order'),
    path('orders/my/', views.MyOrdersView.as_view(), name='my_orders'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order_detail'),
]