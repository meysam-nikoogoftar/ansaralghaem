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
        queryset = Product.objects.filter(is_published=True)
        category = self.request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(is_published=True)


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.validated_data['product']
            quantity = serializer.validated_data.get('quantity', 1)
            if product.stock < quantity:
                return Response(
                    {'error': 'موجودی کافی نیست'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            order = serializer.save()
            product.stock -= quantity
            product.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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