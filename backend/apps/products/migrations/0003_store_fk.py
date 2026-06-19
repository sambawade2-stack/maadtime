# Historique : ajoutait à l'origine category.store / product.store (FK vers
# l'app stores, supprimée depuis — boutique unique, voir conversation du
# 2026-06-19). Neutralisé pour ne pas casser l'historique des migrations
# déjà appliquées (django_migrations).
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_alter_product_description'),
    ]

    operations = []
