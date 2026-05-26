from rest_framework import serializers
from .models import Order, OrderItem, Address
from apps.products.models import Product, StoreInventory
from apps.stores.models import Store


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
    store_slug = serializers.CharField(max_length=100, required=False, default='maadtime')
    items = OrderItemWriteSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('La commande doit contenir au moins un article.')
        return value

    def create(self, validated_data):
        from django.db import transaction

        items_data = validated_data.pop('items')
        store_slug = validated_data.pop('store_slug', None)
        request = self.context['request']
        # admin_order=True → commande téléphonique, user=None (invité)
        admin_order = self.context.get('admin_order', False)
        user = None if admin_order else (request.user if request.user.is_authenticated else None)

        # Déterminer la boutique
        # 1. Si store_slug explicite (admin), on l'utilise directement
        # 2. Sinon, on cherche par région du client (city)
        # 3. Fallback : boutique par défaut
        store = None
        if store_slug:
            store = Store.objects.filter(slug=store_slug, is_active=True).first()

        if not store:
            city = validated_data.get('city', '')
            if city:
                # Cherche la boutique qui couvre cette région
                for s in Store.objects.filter(is_active=True):
                    if city in (s.regions or []):
                        store = s
                        break

        if not store:
            store = Store.objects.filter(is_active=True, slug='maadtime').first() \
                    or Store.objects.filter(is_active=True).first()

        with transaction.atomic():
            product_ids = [item['product_id'] for item in items_data]
            products = {
                p.id: p for p in Product.objects.filter(id__in=product_ids, is_active=True)
            }

            # Vérifier le stock dans l'inventaire de la boutique
            inventories = {}
            if store:
                inventories = {
                    inv.product_id: inv
                    for inv in StoreInventory.objects.select_for_update().filter(
                        store=store, product_id__in=product_ids
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
                inv = inventories.get(product.id)

                if inv is not None:
                    if inv.stock < quantity:
                        raise serializers.ValidationError(
                            f"Stock insuffisant pour {product.name}. Disponible : {inv.stock}"
                        )
                # Si pas d'entrée StoreInventory → pas de vérification de stock (tolérance)

                subtotal += product.price * quantity
                order_items.append((product, quantity, inv))

            order = Order.objects.create(
                user=user,
                store=store,
                subtotal=subtotal,
                delivery_fee=0,
                total=subtotal,
                **validated_data
            )

            for product, quantity, inv in order_items:
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
                # Déduire du stock boutique
                if inv is not None:
                    inv.stock = max(0, inv.stock - quantity)
                    inv.save()

        return order
