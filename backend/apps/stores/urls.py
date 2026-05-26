from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreViewSet, StoreUserViewSet

router = DefaultRouter()
router.register('', StoreViewSet, basename='store')
router.register('users', StoreUserViewSet, basename='store-user')

urlpatterns = [path('', include(router.urls))]
