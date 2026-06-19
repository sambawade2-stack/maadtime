"""
Supprime toutes les données métier sans toucher aux comptes admin/superuser.
Efface : commandes, produits, catégories, clients.
"""
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = "Remet la base à zéro (données seulement — les admins sont conservés)"

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirmer la suppression sans prompt interactif',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.WARNING(
                "\n⚠️  Cette commande supprime TOUTES les données (commandes, produits, clients).\n"
                "    Les comptes admin/superuser sont conservés.\n\n"
                "    Relancez avec --confirm pour exécuter.\n"
            ))
            return

        from apps.orders.models import Order, OrderItem, Address
        from apps.products.models import (
            Product, ProductImage, Wishlist, ProductReview, Category,
        )
        from apps.authentication.models import User

        with transaction.atomic():
            # Commandes
            n_items = OrderItem.objects.all().delete()[0]
            n_orders = Order.objects.all().delete()[0]
            n_addr = Address.objects.all().delete()[0]

            # Produits
            n_img = ProductImage.objects.all().delete()[0]
            n_reviews = ProductReview.objects.all().delete()[0]
            n_wish = Wishlist.objects.all().delete()[0]
            n_prod = Product.objects.all().delete()[0]
            n_cat = Category.objects.all().delete()[0]

            # Clients (role=client uniquement — admins conservés)
            n_clients = User.objects.filter(role='client').delete()[0]

        self.stdout.write(self.style.SUCCESS("\n✅ Base nettoyée :"))
        self.stdout.write(f"   Commandes       : {n_orders} ({n_items} articles)")
        self.stdout.write(f"   Adresses        : {n_addr}")
        self.stdout.write(f"   Produits        : {n_prod} ({n_img} images)")
        self.stdout.write(f"   Catégories      : {n_cat}")
        self.stdout.write(f"   Clients         : {n_clients}")
        self.stdout.write(f"   Avis / Favoris  : {n_reviews + n_wish}")
        self.stdout.write(self.style.WARNING("\n   Comptes admin conservés.\n"))
