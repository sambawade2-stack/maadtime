from django.core.management.base import BaseCommand
from apps.products.models import Product, StoreInventory
from apps.stores.models import Store


class Command(BaseCommand):
    help = "Crée les entrées StoreInventory manquantes pour tous les produits et boutiques actives"

    def handle(self, *args, **options):
        stores = list(Store.objects.filter(is_active=True))
        products = list(Product.objects.all())

        if not stores:
            self.stdout.write(self.style.WARNING("Aucune boutique active trouvée."))
            return

        created = 0
        for product in products:
            for store in stores:
                _, was_created = StoreInventory.objects.get_or_create(
                    store=store, product=product, defaults={"stock": 0}
                )
                if was_created:
                    created += 1

        self.stdout.write(self.style.SUCCESS(
            f"{created} entrée(s) créée(s) — {StoreInventory.objects.count()} inventaires au total."
        ))
