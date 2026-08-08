from django.contrib import admin
from .models import ProductCategory, Product, Order


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'category', 'price', 'discounted_price', 'stock', 'is_published')
    list_filter = ('category', 'is_published')
    search_fields = ('code', 'title')
    list_editable = ('is_published', 'stock')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'buyer', 'product', 'quantity', 'final_price', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('order_number', 'buyer__first_name', 'buyer__last_name')
    readonly_fields = ('order_number', 'created_at')