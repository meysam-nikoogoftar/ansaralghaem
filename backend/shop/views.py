from django.db import transaction
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ProductCategory, Product, Order
from .serializers import (
    ProductCategorySerializer, ProductSerializer,
    OrderSerializer, CreateOrderSerializer
)


class ProductCategoryListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductCategorySerializer
    queryset = ProductCategory.objects.all()


class ProductListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related('category').filter(is_published=True)
        category = self.request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductSerializer
    queryset = Product.objects.select_related('category').filter(is_published=True)


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        product = Product.objects.select_for_update().get(pk=serializer.validated_data['product'].pk)
        quantity = serializer.validated_data.get('quantity', 1)
        if not product.is_published or product.stock < quantity:
            return Response({'error': 'موجودی کافی نیست'}, status=400)
        order = serializer.save(product=product)
        product.stock -= quantity
        product.save(update_fields=['stock'])
        return Response(OrderSerializer(order).data, status=201)


class MyOrdersView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)