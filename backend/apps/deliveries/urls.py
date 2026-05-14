from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryViewSet, DeliveryZoneViewSet

router = DefaultRouter()
router.register('zones', DeliveryZoneViewSet, basename='delivery-zone')
router.register('', DeliveryViewSet, basename='delivery')

urlpatterns = [path('', include(router.urls))]
