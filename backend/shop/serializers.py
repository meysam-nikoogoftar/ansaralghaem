from rest_framework import serializers
from .models import ProductCategory, Product, Order


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    final_price = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('buyer', 'order_number', 'final_price', 'created_at')


class CreateOrderSerializer(serializers.ModelSerializer):
    quantity = serializers.IntegerField(min_value=1, max_value=10000, default=1)
    address = serializers.CharField(max_length=2000)
    postal_code = serializers.RegexField(r'^[0-9]{10}$')

    class Meta:
        model = Order
        fields = ('product', 'quantity', 'address', 'postal_code')

    def create(self, validated_data):
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)
        final_price = product.final_price * quantity
        order = Order.objects.create(
            buyer=self.context['request'].user,
            final_price=final_price,
            **validated_data
        )
        return order