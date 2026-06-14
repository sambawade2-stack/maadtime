from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters import rest_framework as filters
from django.core.cache import cache
from django.db.models import Count
import hashlib
from .models import Category, Product, Wishlist, ProductImage, ProductReview, StoreInventory
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductWriteSerializer, WishlistSerializer, ProductReviewSerializer,
    StoreInventorySerializer,
)
from apps.stores.models import Store


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_admin_user


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
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
            return queryset.filter(inventory__stock__gt=0).distinct()
        return queryset.filter(inventory__stock=0).distinct()


class CategoryViewSet(viewsets.ModelViewSet):
    """Catalogue global — toutes les boutiques partagent les mêmes catégories."""
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        from django.db.models import Q
        # annotate pour éviter le N+1 dans CategorySerializer.get_product_count
        return Category.objects.filter(is_active=True).annotate(
            active_product_count=Count('products', filter=Q(products__is_active=True))
        )


class ProductViewSet(viewsets.ModelViewSet):
    """
    Catalogue global — produits visibles dans toutes les boutiques.
    Le stock est par boutique (voir StoreInventoryViewSet).
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def _get_store_context(self):
        """Retourne la boutique du contexte (gérant ou ?store=slug)."""
        user = self.request.user
        if user.is_authenticated and not user.is_superuser:
            return getattr(user, 'store', None)
        slug = self.request.query_params.get('store_slug')
        if slug:
            return Store.objects.filter(slug=slug).first()
        return None

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductDetailSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['store'] = self._get_store_context()
        return ctx

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_user:
            return Product.objects.all().select_related('category').prefetch_related('images', 'inventory')
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'inventory')

    def list(self, request, *args, **kwargs):
        cache_key = 'products_list_' + hashlib.md5(request.get_full_path().encode()).hexdigest()
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=60)
        return response

    def _invalidate_list_cache(self):
        try:
            cache.delete_pattern('products_list_*')
        except Exception:
            cache.clear()

    def create(self, request, *args, **kwargs):
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        for store in Store.objects.filter(is_active=True):
            StoreInventory.objects.get_or_create(store=store, product=product, defaults={'stock': 0})

        self._invalidate_list_cache()
        ctx = self.get_serializer_context()
        return Response(
            ProductDetailSerializer(product, context=ctx).data,
            status=status.HTTP_201_CREATED,
        )

    def perform_update(self, serializer):
        serializer.save()
        self._invalidate_list_cache()

    def perform_destroy(self, instance):
        instance.delete()
        self._invalidate_list_cache()

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """Reçoit [{slug, order}, …] et met à jour l'ordre de chaque produit."""
        items = request.data
        if not isinstance(items, list):
            return Response({'detail': 'Liste attendue.'}, status=400)
        from django.db import transaction
        with transaction.atomic():
            for item in items:
                slug = item.get('slug')
                order = item.get('order')
                if slug is not None and order is not None:
                    Product.objects.filter(slug=slug).update(order=int(order))
        self._invalidate_list_cache()
        return Response({'detail': 'Ordre mis à jour.'})

    @action(detail=False, methods=['get'])
    def featured(self, request):
        products = self.get_queryset().filter(is_featured=True)[:8]
        ctx = self.get_serializer_context()
        return Response(ProductListSerializer(products, many=True, context=ctx).data)

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        products = self.get_queryset().filter(is_new=True)[:8]
        ctx = self.get_serializer_context()
        return Response(ProductListSerializer(products, many=True, context=ctx).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def add_image(self, request, slug=None):
        from PIL import Image as PILImage
        product = self.get_object()
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'Image requise.'}, status=status.HTTP_400_BAD_REQUEST)
        if image.size > 5 * 1024 * 1024:
            return Response({'error': 'Image trop volumineuse (max 5 Mo).'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            pil_img = PILImage.open(image)
            pil_img.verify()
            if pil_img.format not in ('JPEG', 'PNG', 'WEBP', 'GIF'):
                raise ValueError('Format non supporté')
            image.seek(0)
        except Exception:
            return Response({'error': 'Fichier image invalide. Utilisez JPEG, PNG ou WebP.'}, status=status.HTTP_400_BAD_REQUEST)
        is_main = not product.images.exists()
        ProductImage.objects.create(product=product, image=image, is_main=is_main)
        return Response({'detail': 'Image ajoutée.'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        product = self.get_object()
        reviews = ProductReview.objects.filter(product=product, is_approved=True)
        return Response(ProductReviewSerializer(reviews, many=True).data)

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
        ctx = self.get_serializer_context()
        return Response(ProductListSerializer(qs[:4], many=True, context=ctx).data)


class StoreInventoryViewSet(viewsets.ViewSet):
    """
    Gestion du stock par boutique.
    - Gérant : voit et modifie uniquement son inventaire
    - Superadmin : voit tout, peut filtrer par ?store_id=<id>
    """
    permission_classes = [IsAdminUser]

    def _get_store(self):
        user = self.request.user
        if user.is_superuser:
            store_id = self.request.query_params.get('store_id') or self.request.data.get('store_id')
            if store_id:
                return Store.objects.filter(pk=store_id).first()
            return None
        return getattr(user, 'store', None)

    def list(self, request):
        store = self._get_store()
        if store:
            qs = StoreInventory.objects.filter(store=store).select_related('product', 'product__category').prefetch_related('product__images')
        elif request.user.is_superuser:
            qs = StoreInventory.objects.all().select_related('store', 'product', 'product__category').prefetch_related('product__images')
        else:
            return Response([])
        serializer = StoreInventorySerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        try:
            inv = StoreInventory.objects.get(pk=pk)
        except StoreInventory.DoesNotExist:
            return Response({'detail': 'Introuvable.'}, status=404)

        user = request.user
        if not user.is_superuser and getattr(user, 'store', None) != inv.store:
            return Response({'detail': 'Accès refusé.'}, status=403)

        stock = request.data.get('stock')
        if stock is None or int(stock) < 0:
            return Response({'detail': 'Stock invalide.'}, status=400)
        inv.stock = int(stock)
        inv.save()
        return Response(StoreInventorySerializer(inv, context={'request': request}).data)


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
