from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Max
from apps.authentication.models import User
from apps.authentication.serializers import UserSerializer
from apps.orders.models import Order


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


class CustomerListView(APIView):
    """
    Clients filtrés par boutique.
    - Superadmin : tous les clients, ou ?store=<id> pour filtrer
    - Gérant     : uniquement les clients de sa boutique
    Retourne inscrits + invités (identifiés par téléphone).
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        user = request.user

        # --- Déterminer le filtre boutique ---
        if user.is_superuser:
            store_id = request.query_params.get('store')
            order_qs = Order.objects.filter(store_id=store_id) if store_id else Order.objects.all()
        else:
            if not getattr(user, 'store', None):
                return Response([])
            order_qs = Order.objects.filter(store=user.store)

        results = []

        # --- Clients inscrits ayant commandé dans cette boutique ---
        user_ids = (
            order_qs.filter(user__isnull=False)
            .values_list('user_id', flat=True)
            .distinct()
        )
        for u in User.objects.filter(id__in=user_ids).order_by('-created_at'):
            u_orders = order_qs.filter(user=u)
            last_city = (
                u_orders.order_by('-created_at')
                .values_list('city', flat=True)
                .first() or ''
            )
            results.append({
                'id': f'user-{u.id}',
                'type': 'registered',
                'name': f'{u.first_name} {u.last_name}'.strip() or u.username,
                'email': u.email,
                'phone': u.phone,
                'city': last_city,
                'orders_count': u_orders.count(),
                'created_at': u.created_at.isoformat(),
            })

        # --- Clients invités (sans compte, identifiés par téléphone) ---
        registered_phones = set(
            User.objects.filter(id__in=user_ids)
            .exclude(phone='')
            .values_list('phone', flat=True)
        )
        guest_qs = (
            order_qs.filter(user__isnull=True)
            .values('phone', 'full_name', 'city')
            .annotate(orders_count=Count('id'), last_order=Max('created_at'))
            .order_by('-last_order')
        )
        seen_phones = set(registered_phones)
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
                'created_at': g['last_order'].isoformat() if g['last_order'] else None,
            })

        results.sort(key=lambda x: x['created_at'] or '', reverse=True)
        return Response(results)


class CustomerDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
