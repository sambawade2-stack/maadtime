from rest_framework import serializers
from .models import Category, Product, ProductImage, Wishlist, ProductReview


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'order', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_main', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'price', 'compare_price',
            'category_name', 'main_image', 'in_stock', 'is_active', 'stock', 'discount_percent',
            'is_featured', 'is_new', 'weight', 'created_at'
        ]

    def get_main_image(self, obj):
        img = obj.images.filter(is_main=True).first()
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'compare_price', 'stock', 'weight', 'category',
            'images', 'in_stock', 'discount_percent', 'is_featured', 'is_new',
            'reviews_count', 'average_rating', 'created_at', 'updated_at'
        ]

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
            'price', 'compare_price', 'stock', 'weight',
            'is_active', 'is_featured', 'is_new'
        ]


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
