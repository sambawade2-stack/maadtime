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
    store_name = serializers.CharField(source='store.name', read_only=True, default=None)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'total',
            'items_count', 'city', 'full_name', 'phone', 'store_name', 'created_at'
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
        # Tous les produits doivent appartenir à la même boutique
        product_ids = [item['product_id'] for item in value]
        from apps.products.models import Product as P
        stores = set(
            P.objects.filter(id__in=product_ids, is_active=True)
            .values_list('store_id', flat=True)
            .distinct()
        )
        if len(stores) > 1:
            raise serializers.ValidationError(
                'Tous les produits doivent appartenir à la même boutique.'
            )
        return value

    def create(self, validated_data):
        from django.db import transaction
        from apps.stores.models import Store
        items_data = validated_data.pop('items')
        request = self.context['request']
        user = request.user if request.user.is_authenticated else None
        # Detect store from the first product ordered
        store = None
        if items_data:
            from apps.products.models import Product as P
            first = P.objects.filter(id=items_data[0]['product_id']).select_related('store').first()
            if first:
                store = first.store

        with transaction.atomic():
            product_ids = [item['product_id'] for item in items_data]
            products = {
                p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids, is_active=True)
            }

            subtotal = 0
            order_items = []

            for item_data in items_data:
                product = products.get(item_data['product_id'])
                if not product:
                    raise serializers.ValidationError(
                        f"Produit introuvable ou indisponible (id={item_data['product_id']})."
                    )
                if product.stock < item_data['quantity']:
                    raise serializers.ValidationError(
                        f"Stock insuffisant pour {product.name}. Disponible: {product.stock}"
                    )
                subtotal += product.price * item_data['quantity']
                order_items.append((product, item_data['quantity']))

            delivery_fee = 1000 if subtotal < 20000 else 0
            total = subtotal + delivery_fee

            order = Order.objects.create(
                user=user,
                store=store,
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total=total,
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
                product.stock -= quantity
                product.save()

        return order
