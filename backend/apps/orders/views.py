from rest_framework import generics, viewsets, permissions, status
from django.db import models
from apps.stores.mixins import StoreFilterMixin
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Order, Address
from .serializers import (
    OrderListSerializer, OrderDetailSerializer,
    CreateOrderSerializer, AddressSerializer
)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


class OrderViewSet(StoreFilterMixin, viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['order_number', 'full_name', 'phone']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'patch']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        if user.is_admin_user:
            qs = Order.objects.all().prefetch_related('items')
            return self.filter_queryset_by_store(qs)
        return Order.objects.filter(user=user).prefetch_related('items')

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        if self.action == 'list':
            return OrderListSerializer
        return OrderDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        from django.db import transaction
        from apps.products.models import Product
        order = self.get_object()
        if order.status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'Cette commande ne peut plus être annulée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        with transaction.atomic():
            order.status = 'cancelled'
            order.save()
            if order.store:
                from apps.products.models import StoreInventory
                for item in order.items.all():
                    if item.product_id:
                        StoreInventory.objects.filter(
                            store=order.store, product_id=item.product_id
                        ).update(stock=models.F('stock') + item.quantity)
        return Response({'detail': 'Commande annulée.'})


class OrderTrackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        number = request.query_params.get('number', '').strip().upper()
        if not number:
            return Response({'error': 'Numéro de commande requis.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            order = Order.objects.prefetch_related('items').get(order_number=number)
        except Order.DoesNotExist:
            return Response({'error': 'Commande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        from .serializers import OrderDetailSerializer
        data = OrderDetailSerializer(order).data
        # Masquer les données personnelles sensibles pour le tracking public
        data['phone'] = '****' + data['phone'][-2:] if data.get('phone') else ''
        data.pop('address_line', None)
        data.pop('neighborhood', None)
        data.pop('notes', None)
        return Response(data)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
