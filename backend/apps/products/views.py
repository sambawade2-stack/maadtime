from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters import rest_framework as filters
from .models import Category, Product, Wishlist, ProductImage, ProductReview
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductWriteSerializer, WishlistSerializer, ProductReviewSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_admin_user


class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    in_stock = filters.BooleanFilter(method='filter_in_stock')
    category_slug = filters.CharFilter(field_name='category__slug')

    class Meta:
        model = Product
        fields = ['category', 'is_featured', 'is_new', 'is_active']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(
            ProductDetailSerializer(product, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_admin_user:
            return Product.objects.all().select_related('category').prefetch_related('images')
        return qs

    @action(detail=False, methods=['get'])
    def featured(self, request):
        products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        products = self.get_queryset().filter(is_new=True)[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def add_image(self, request, slug=None):
        product = self.get_object()
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'Image requise.'}, status=status.HTTP_400_BAD_REQUEST)
        is_main = not product.images.exists()
        ProductImage.objects.create(product=product, image=image, is_main=is_main)
        return Response({'detail': 'Image ajoutée.'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        product = self.get_object()
        reviews = ProductReview.objects.filter(product=product, is_approved=True)
        serializer = ProductReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_review(self, request, slug=None):
        product = self.get_object()
        serializer = ProductReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def similar(self, request):
        category_id = request.query_params.get('category')
        exclude_id = request.query_params.get('exclude')
        qs = self.get_queryset()
        if category_id:
            qs = qs.filter(category_id=category_id)
        if exclude_id:
            qs = qs.exclude(id=exclude_id)
        products = qs[:4]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['delete'])
    def remove(self, request):
        product_id = request.data.get('product_id')
        Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
