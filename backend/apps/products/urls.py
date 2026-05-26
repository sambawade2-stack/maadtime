from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, WishlistViewSet, StoreInventoryViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('inventory', StoreInventoryViewSet, basename='inventory')
router.register('', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
