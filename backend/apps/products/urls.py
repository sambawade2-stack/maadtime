from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, WishlistViewSet, ProductStockViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('inventory', ProductStockViewSet, basename='inventory')
router.register('', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
