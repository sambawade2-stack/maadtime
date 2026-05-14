from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth, TruncDate
from django.utils import timezone
from datetime import timedelta, date as date_type
from apps.orders.models import Order
from apps.products.models import Product
from apps.authentication.models import User


def parse_date(value):
    try:
        return date_type.fromisoformat(value)
    except Exception:
        return None


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)
        last_7 = today - timedelta(days=7)

        # Filtre date optionnel
        date_from = parse_date(request.query_params.get('date_from', '')) or None
        date_to = parse_date(request.query_params.get('date_to', '')) or None

        active_statuses = ['confirmed', 'processing', 'shipped', 'delivered']

        base_qs = Order.objects.filter(status__in=active_statuses)
        all_qs = Order.objects.all()

        if date_from:
            base_qs = base_qs.filter(created_at__date__gte=date_from)
            all_qs = all_qs.filter(created_at__date__gte=date_from)
        if date_to:
            base_qs = base_qs.filter(created_at__date__lte=date_to)
            all_qs = all_qs.filter(created_at__date__lte=date_to)

        total_revenue = base_qs.aggregate(total=Sum('total'))['total'] or 0
        monthly_revenue = base_qs.filter(created_at__date__gte=last_30).aggregate(total=Sum('total'))['total'] or 0
        daily_revenue = Order.objects.filter(status__in=active_statuses, created_at__date=today).aggregate(total=Sum('total'))['total'] or 0

        orders_today = Order.objects.filter(created_at__date=today).count()
        orders_week = Order.objects.filter(created_at__date__gte=last_7).count()
        orders_period = all_qs.count()

        registered_customers = User.objects.filter(role='client').count()
        guest_phones = Order.objects.filter(user__isnull=True).values('phone').distinct().count()
        total_customers = registered_customers + guest_phones
        new_customers_month = User.objects.filter(role='client', date_joined__date__gte=last_30).count() + \
            Order.objects.filter(user__isnull=True, created_at__date__gte=last_30).values('phone').distinct().count()

        total_products = Product.objects.filter(is_active=True).count()
        low_stock = Product.objects.filter(is_active=True, stock__lte=5, stock__gt=0).count()
        out_of_stock = Product.objects.filter(is_active=True, stock=0).count()

        orders_by_status = all_qs.values('status').annotate(count=Count('id'))

        return Response({
            'revenue': {
                'total': float(total_revenue),
                'monthly': float(monthly_revenue),
                'daily': float(daily_revenue),
            },
            'orders': {
                'today': orders_today,
                'week': orders_week,
                'total': Order.objects.count(),
                'period': orders_period,
                'by_status': list(orders_by_status),
            },
            'customers': {
                'total': total_customers,
                'new_month': new_customers_month,
            },
            'products': {
                'total': total_products,
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
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

        if period == 'week' or (date_from and date_to and (date_to - date_from).days <= 31):
            start_date = date_from or (today - timedelta(days=6))
            end_date = date_to or today
            qs = Order.objects.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status__in=active_statuses,
            )
            data = (
                qs.annotate(day=TruncDate('created_at'))
                .values('day')
                .annotate(revenue=Sum('total'), orders=Count('id'))
                .order_by('day')
            )
            return Response([{
                'date': item['day'],
                'revenue': float(item['revenue'] or 0),
                'orders': item['orders'],
            } for item in data])
        else:
            start_date = date_from or (today - timedelta(days=365))
            end_date = date_to or today
            qs = Order.objects.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status__in=active_statuses,
            )
            data = (
                qs.annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(revenue=Sum('total'), orders=Count('id'))
                .order_by('month')
            )
            return Response([{
                'date': item['month'],
                'revenue': float(item['revenue'] or 0),
                'orders': item['orders'],
            } for item in data])


class TopProductsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.orders.models import OrderItem
        date_from = parse_date(request.query_params.get('date_from', '')) or None
        date_to = parse_date(request.query_params.get('date_to', '')) or None

        qs = OrderItem.objects.all()
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
        orders = Order.objects.select_related('user').order_by('-created_at')[:10]
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)
