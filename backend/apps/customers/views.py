from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Max
from apps.authentication.models import User
from apps.orders.models import Order


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


class CustomerListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        results = []

        # Registered clients with order counts
        registered = (
            User.objects.filter(role='client')
            .annotate(orders_count=Count('orders'), last_order=Max('orders__created_at'))
            .order_by('-date_joined')
        )
        for u in registered:
            results.append({
                'id': f'user-{u.id}',
                'type': 'registered',
                'name': f'{u.first_name} {u.last_name}'.strip() or u.username,
                'email': u.email,
                'phone': u.phone,
                'city': '',
                'orders_count': u.orders_count,
                'created_at': u.created_at.isoformat(),
            })

        # Guest customers (ordered without account), unique by phone
        seen_phones = set(u.phone for u in registered if u.phone)
        guest_qs = (
            Order.objects.filter(user__isnull=True)
            .values('phone', 'full_name', 'city')
            .annotate(orders_count=Count('id'), created_at=Max('created_at'))
            .order_by('-created_at')
        )
        for g in guest_qs:
            phone = g['phone']
            if phone in seen_phones:
                continue
            seen_phones.add(phone)
            results.append({
                'id': f'guest-{phone}',
                'type': 'guest',
                'name': g['full_name'],
                'email': '',
                'phone': phone,
                'city': g['city'],
                'orders_count': g['orders_count'],
                'created_at': g['created_at'].isoformat() if g['created_at'] else None,
            })

        results.sort(key=lambda x: x['created_at'] or '', reverse=True)
        return Response(results)
