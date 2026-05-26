from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import Store
from .serializers import StoreSerializer
from apps.orders.models import Order
from apps.products.models import Product
from apps.authentication.models import User


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


def store_stats(store, request):
    today = timezone.now().date()
    last_30 = today - timedelta(days=30)
    active = ['confirmed', 'processing', 'shipped', 'delivered']

    orders = Order.objects.filter(store=store)
    revenue = orders.filter(status__in=active).aggregate(t=Sum('total'))['t'] or 0
    monthly = orders.filter(status__in=active, created_at__date__gte=last_30).aggregate(t=Sum('total'))['t'] or 0

    logo_url = None
    if store.logo:
        try:
            logo_url = request.build_absolute_uri(store.logo.url)
        except Exception:
            pass

    return {
        'id': store.id,
        'name': store.name,
        'slug': store.slug,
        'logo': logo_url,
        'is_active': store.is_active,
        'phone': store.phone,
        'whatsapp': store.whatsapp,
        'address': store.address,
        'orders_total': orders.count(),
        'orders_pending': orders.filter(status='pending').count(),
        'orders_today': orders.filter(created_at__date=today).count(),
        'revenue_total': float(revenue),
        'revenue_monthly': float(monthly),
        'products_total': Product.objects.filter(store=store, is_active=True).count(),
        'low_stock': Product.objects.filter(store=store, is_active=True, stock__lte=5, stock__gt=0).count(),
        'out_of_stock': Product.objects.filter(store=store, is_active=True, stock=0).count(),
    }


class StoreViewSet(viewsets.ModelViewSet):
    serializer_class = StoreSerializer
    permission_classes = [IsSuperAdmin]
    queryset = Store.objects.all()
    lookup_value_regex = r'\d+'

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        store = self.get_object()
        return Response(store_stats(store, request))

    @action(detail=False, methods=['get'])
    def overview(self, request):
        stores = Store.objects.all()
        return Response([store_stats(s, request) for s in stores])

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public(self, request):
        slug = request.query_params.get('slug', 'maadtime')
        try:
            store = Store.objects.get(slug=slug, is_active=True)
        except Store.DoesNotExist:
            return Response({'error': 'Store not found'}, status=404)
        logo_url = None
        if store.logo:
            try:
                logo_url = request.build_absolute_uri(store.logo.url)
            except Exception:
                pass
        return Response({
            'name': store.name,
            'phone': store.phone,
            'whatsapp': store.whatsapp,
            'address': store.address,
            'logo': logo_url,
        })


class StoreUserViewSet(viewsets.ViewSet):
    """Gérants de boutiques — CRUD réservé au superadmin."""
    permission_classes = [IsSuperAdmin]

    def list(self, request):
        users = User.objects.filter(role='admin', is_superuser=False).select_related('store')
        data = [_user_data(u) for u in users]
        return Response(data)

    def create(self, request):
        from apps.authentication.serializers import RegisterSerializer
        email = request.data.get('email')
        password = request.data.get('password')
        store_id = request.data.get('store_id')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not all([email, password, store_id]):
            return Response({'detail': 'email, password et store_id sont requis.'}, status=400)

        try:
            store = Store.objects.get(id=store_id)
        except Store.DoesNotExist:
            return Response({'detail': 'Boutique introuvable.'}, status=404)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Cet email est déjà utilisé.'}, status=400)

        user = User.objects.create_user(
            email=email,
            username=email.split('@')[0],
            password=password,
            role='admin',
            store=store,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
        )
        return Response(_user_data(user), status=201)

    def destroy(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk, role='admin', is_superuser=False)
        except User.DoesNotExist:
            return Response({'detail': 'Gérant introuvable.'}, status=404)
        user.delete()
        return Response(status=204)

    def partial_update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk, role='admin', is_superuser=False)
        except User.DoesNotExist:
            return Response({'detail': 'Gérant introuvable.'}, status=404)

        for field in ['first_name', 'last_name', 'phone']:
            if field in request.data:
                setattr(user, field, request.data[field])

        store_id = request.data.get('store_id')
        if store_id:
            try:
                user.store = Store.objects.get(id=store_id)
            except Store.DoesNotExist:
                return Response({'detail': 'Boutique introuvable.'}, status=404)

        new_pwd = request.data.get('password')
        if new_pwd:
            user.set_password(new_pwd)

        user.save()
        return Response(_user_data(user))


def _user_data(user):
    return {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'store': {'id': user.store.id, 'name': user.store.name, 'slug': user.store.slug} if user.store else None,
    }
