from rest_framework import serializers
from .models import Order, OrderItem, Address
from apps.products.models import Product


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'full_name', 'phone', 'address_line', 'city', 'neighborhood', 'is_default', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'price', 'quantity', 'total']


class OrderItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'total',
            'items_count', 'city', 'full_name', 'phone', 'created_at'
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'payment_method',
            'payment_method_display', 'full_name', 'phone', 'country', 'address_line',
            'city', 'neighborhood', 'notes', 'subtotal', 'delivery_fee',
            'total', 'items', 'created_at', 'updated_at'
        ]


class CreateOrderSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, required=False, default='Sénégal')
    address_line = serializers.CharField(max_length=300)
    city = serializers.CharField(max_length=100)
    neighborhood = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemWriteSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('La commande doit contenir au moins un article.')
        return value

    def create(self, validated_data):
        from django.db import transaction

        items_data = validated_data.pop('items')
        request = self.context['request']
        # admin_order=True → commande téléphonique, user=None (invité)
        admin_order = self.context.get('admin_order', False)
        user = None if admin_order else (request.user if request.user.is_authenticated else None)

        with transaction.atomic():
            product_ids = [item['product_id'] for item in items_data]
            products = {
                p.id: p for p in Product.objects.select_for_update().filter(
                    id__in=product_ids, is_active=True
                )
            }

            subtotal = 0
            order_items = []

            for item_data in items_data:
                product = products.get(item_data['product_id'])
                if not product:
                    raise serializers.ValidationError(
                        f"Produit introuvable ou indisponible (id={item_data['product_id']})."
                    )

                quantity = item_data['quantity']
                if product.stock < quantity:
                    raise serializers.ValidationError(
                        f"Stock insuffisant pour {product.name}. Disponible : {product.stock}"
                    )

                subtotal += product.price * quantity
                order_items.append((product, quantity))

            order = Order.objects.create(
                user=user,
                subtotal=subtotal,
                delivery_fee=0,
                total=subtotal,
                **validated_data
            )

            for product, quantity in order_items:
                main_img = product.images.filter(is_main=True).first()
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_image=main_img.image.url if main_img else '',
                    price=product.price,
                    quantity=quantity,
                    total=product.price * quantity,
                )
                product.stock = max(0, product.stock - quantity)
                product.save(update_fields=['stock'])

        return order
