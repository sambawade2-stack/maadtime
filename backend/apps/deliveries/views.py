from rest_framework import viewsets, permissions
from .models import Delivery, DeliveryZone
from .serializers import DeliverySerializer, DeliveryZoneSerializer


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


class DeliveryZoneViewSet(viewsets.ModelViewSet):
    queryset = DeliveryZone.objects.filter(is_active=True)
    serializer_class = DeliveryZoneSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.AllowAny()]


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all().select_related('order', 'zone')
    serializer_class = DeliverySerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['status']
    ordering = ['-created_at']
