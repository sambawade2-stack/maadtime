from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, AddressViewSet, OrderTrackView

router = DefaultRouter()
router.register('addresses', AddressViewSet, basename='address')
router.register('', OrderViewSet, basename='order')

urlpatterns = [
    path('track/', OrderTrackView.as_view(), name='order-track'),
    path('', include(router.urls)),
]
