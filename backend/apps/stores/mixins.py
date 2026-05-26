"""
StoreFilterMixin — injecte automatiquement le filtre boutique dans tous les ViewSets.

  • Superadmin (is_superuser=True) : voit tout, peut filtrer via ?store=<id>
  • Gérant (role=admin, store!=None) : voit uniquement sa boutique
  • Anonyme / client : voit uniquement les boutiques actives (lecture seule)
"""
from apps.stores.models import Store


class StoreFilterMixin:

    def get_current_store(self):
        user = self.request.user
        if not user.is_authenticated:
            return None
        if user.is_superuser:
            store_id = self.request.query_params.get('store')
            if store_id:
                try:
                    return Store.objects.get(pk=store_id)
                except Store.DoesNotExist:
                    return None
            return None  # superadmin sans filtre → tout voir
        return getattr(user, 'store', None)

    def filter_queryset_by_store(self, queryset, store_field='store'):
        user = self.request.user
        if not user.is_authenticated:
            return queryset
        if user.is_superuser:
            store = self.get_current_store()
            if store:
                return queryset.filter(**{store_field: store})
            return queryset  # tout voir
        store = self.get_current_store()
        if store:
            return queryset.filter(**{store_field: store})
        return queryset.none()
