from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth, TruncDate
from django.conf import settings
from django.utils import timezone
from datetime import timedelta, date as date_type
from apps.orders.models import Order
from apps.products.models import Product
from apps.authentication.models import User
from .models import PushSubscription
from apps.stores.models import Store


def parse_date(value):
    try:
        return date_type.fromisoformat(value)
    except Exception:
        return None


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


def _get_store_filter(request):
    """Retourne le dict de filtre store selon le rôle."""
    user = request.user
    if user.is_superuser:
        store_id = request.query_params.get('store')
        if store_id:
            try:
                return {'store': Store.objects.get(pk=store_id)}
            except Store.DoesNotExist:
                pass
        return {}  # tout voir
    if getattr(user, 'store', None):
        return {'store': user.store}
    return {}


class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)
        last_7 = today - timedelta(days=7)

        date_from = parse_date(request.query_params.get('date_from', '')) or None
        date_to = parse_date(request.query_params.get('date_to', '')) or None

        active_statuses = ['confirmed', 'processing', 'shipped', 'delivered']
        sf = _get_store_filter(request)

        base_qs = Order.objects.filter(status__in=active_statuses, **sf)
        all_qs = Order.objects.filter(**sf)

        if date_from:
            base_qs = base_qs.filter(created_at__date__gte=date_from)
            all_qs = all_qs.filter(created_at__date__gte=date_from)
        if date_to:
            base_qs = base_qs.filter(created_at__date__lte=date_to)
            all_qs = all_qs.filter(created_at__date__lte=date_to)

        total_revenue = base_qs.aggregate(t=Sum('total'))['t'] or 0
        monthly_revenue = base_qs.filter(created_at__date__gte=last_30).aggregate(t=Sum('total'))['t'] or 0
        daily_revenue = Order.objects.filter(status__in=active_statuses, created_at__date=today, **sf).aggregate(t=Sum('total'))['t'] or 0

        orders_today = Order.objects.filter(created_at__date=today, **sf).count()
        orders_week = Order.objects.filter(created_at__date__gte=last_7, **sf).count()

        guest_phones = Order.objects.filter(user__isnull=True, **sf).values('phone').distinct().count()
        total_customers = User.objects.filter(role='client').count() + guest_phones
        new_customers_month = (
            User.objects.filter(role='client', date_joined__date__gte=last_30).count() +
            Order.objects.filter(user__isnull=True, created_at__date__gte=last_30, **sf).values('phone').distinct().count()
        )

        from apps.products.models import StoreInventory
        store_obj = sf.get('store')
        if store_obj:
            inv_qs = StoreInventory.objects.filter(store=store_obj, product__is_active=True)
        else:
            inv_qs = StoreInventory.objects.filter(product__is_active=True)

        return Response({
            'revenue': {
                'total': float(total_revenue),
                'monthly': float(monthly_revenue),
                'daily': float(daily_revenue),
            },
            'orders': {
                'today': orders_today,
                'week': orders_week,
                'total': Order.objects.filter(**sf).count(),
                'period': all_qs.count(),
                'by_status': list(all_qs.values('status').annotate(count=Count('id'))),
            },
            'customers': {
                'total': total_customers,
                'new_month': new_customers_month,
            },
            'products': {
                'total': Product.objects.filter(is_active=True).count(),
                'low_stock': inv_qs.filter(stock__lte=5, stock__gt=0).count(),
                'out_of_stock': inv_qs.filter(stock=0).count(),
            },
        })


class SalesChartView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        today = timezone.now().date()
        date_from = parse_date(request.query_params.get('date_from', '')) or None
        date_to = parse_date(request.query_params.get('date_to', '')) or None
        active_statuses = ['confirmed', 'processing', 'shipped', 'delivered']
        sf = _get_store_filter(request)

        if period == 'week' or (date_from and date_to and (date_to - date_from).days <= 31):
            start_date = date_from or (today - timedelta(days=6))
            end_date = date_to or today
            qs = Order.objects.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status__in=active_statuses,
                **sf,
            )
            data = (
                qs.annotate(day=TruncDate('created_at'))
                .values('day')
                .annotate(revenue=Sum('total'), orders=Count('id'))
                .order_by('day')
            )
            return Response([{'date': i['day'], 'revenue': float(i['revenue'] or 0), 'orders': i['orders']} for i in data])
        else:
            start_date = date_from or (today - timedelta(days=365))
            end_date = date_to or today
            qs = Order.objects.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status__in=active_statuses,
                **sf,
            )
            data = (
                qs.annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(revenue=Sum('total'), orders=Count('id'))
                .order_by('month')
            )
            return Response([{'date': i['month'], 'revenue': float(i['revenue'] or 0), 'orders': i['orders']} for i in data])


class TopProductsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.orders.models import OrderItem
        date_from = parse_date(request.query_params.get('date_from', '')) or None
        date_to = parse_date(request.query_params.get('date_to', '')) or None
        sf = _get_store_filter(request)

        qs = OrderItem.objects.filter(**{f'order__{k}': v for k, v in sf.items()})
        if date_from:
            qs = qs.filter(order__created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(order__created_at__date__lte=date_to)

        top = (
            qs.values('product__id', 'product__name')
            .annotate(total_sold=Sum('quantity'), revenue=Sum('total'))
            .order_by('-total_sold')[:10]
        )
        return Response(list(top))


class RecentOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.orders.serializers import OrderListSerializer
        sf = _get_store_filter(request)
        orders = Order.objects.filter(**sf).select_related('user').order_by('-created_at')[:10]
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)


class AdminCreateOrderView(APIView):
    """
    Création d'une commande manuelle par l'admin / gérant (commande téléphonique).
    L'utilisateur final est traité comme invité (user=None).
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        from apps.orders.serializers import CreateOrderSerializer
        from apps.orders.serializers import OrderDetailSerializer

        user = request.user

        # Injecter le store dans les données si gérant (pas superadmin)
        data = request.data.copy()
        if not user.is_superuser:
            store = getattr(user, 'store', None)
            if store:
                data['store_slug'] = store.slug
            else:
                return Response({'detail': 'Aucune boutique associée à ce compte.'}, status=400)

        serializer = CreateOrderSerializer(
            data=data,
            context={'request': request, 'admin_order': True},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        order = serializer.save()
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)


class VapidPublicKeyView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'public_key': settings.VAPID_PUBLIC_KEY})


class PushSubscribeView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        endpoint = request.data.get('endpoint')
        p256dh = request.data.get('keys', {}).get('p256dh')
        auth = request.data.get('keys', {}).get('auth')
        if not all([endpoint, p256dh, auth]):
            return Response({'detail': 'Données manquantes.'}, status=400)
        PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={'user': request.user, 'p256dh': p256dh, 'auth': auth},
        )
        return Response({'detail': 'Abonné.'}, status=201)

    def delete(self, request):
        endpoint = request.data.get('endpoint')
        PushSubscription.objects.filter(endpoint=endpoint).delete()
        return Response(status=204)
