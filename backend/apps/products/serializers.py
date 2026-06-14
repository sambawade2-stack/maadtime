from rest_framework import serializers
from .models import Category, Product, ProductImage, StoreInventory, Wishlist, ProductReview


class CategorySerializer(serializers.ModelSerializer):
    # Utilise l'annotation active_product_count injectée par la vue (0 requête extra)
    product_count = serializers.IntegerField(source='active_product_count', read_only=True, default=0)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'order', 'product_count']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_main', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    discount_percent = serializers.IntegerField(read_only=True, allow_null=True)
    stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'price', 'compare_price',
            'category_name', 'main_image', 'in_stock', 'is_active', 'stock',
            'discount_percent', 'is_featured', 'is_new', 'weight', 'order', 'created_at'
        ]

    def get_main_image(self, obj):
        # Utilise le prefetch_related('images') — pas de requête supplémentaire
        for img in obj.images.all():
            if img.is_main:
                request = self.context.get('request')
                return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None

    def get_in_stock(self, obj):
        # Utilise le prefetch_related('inventory') — pas de requête supplémentaire
        return any(inv.stock > 0 for inv in obj.inventory.all())

    def get_stock(self, obj):
        store = self.context.get('store')
        # Utilise le prefetch_related('inventory') — pas de requête supplémentaire
        if store:
            for inv in obj.inventory.all():
                if inv.store_id == store.id:
                    return inv.stock
            return 0
        return sum(inv.stock for inv in obj.inventory.all())


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True, allow_null=True)
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'compare_price', 'stock', 'weight', 'category',
            'images', 'in_stock', 'discount_percent', 'is_featured', 'is_new',
            'is_active', 'reviews_count', 'average_rating', 'created_at', 'updated_at'
        ]

    def get_stock(self, obj):
        store = self.context.get('store')
        if store:
            inv = obj.inventory.filter(store=store).first()
            return inv.stock if inv else 0
        return obj.total_stock

    def get_reviews_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()

    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'category', 'description', 'short_description',
            'price', 'compare_price', 'weight',
            'is_active', 'is_featured', 'is_new', 'order'
        ]


class StoreInventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    main_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='product.category.name', read_only=True, default='')

    class Meta:
        model = StoreInventory
        fields = ['id', 'product', 'product_name', 'product_slug', 'main_image', 'category_name', 'stock']
        read_only_fields = ['id', 'product', 'product_name', 'product_slug', 'main_image', 'category_name']

    def get_main_image(self, obj):
        img = obj.product.images.filter(is_main=True).first()
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'created_at']


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    comment = serializers.CharField(max_length=1000)

    class Meta:
        model = ProductReview
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']
