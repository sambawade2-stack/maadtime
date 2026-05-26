"""
Data migration: creates the default 'Maadtime' store and assigns all existing
products, categories and orders to it.
"""
from django.db import migrations


def create_default_store(apps, schema_editor):
    Store = apps.get_model('stores', 'Store')
    Product = apps.get_model('products', 'Product')
    Category = apps.get_model('products', 'Category')
    Order = apps.get_model('orders', 'Order')

    store, _ = Store.objects.get_or_create(
        slug='maadtime',
        defaults={
            'name': 'Maadtime',
            'phone': '+221 77 304 34 53',
            'whatsapp': '+221773043453',
            'is_active': True,
        },
    )
    Product.objects.filter(store__isnull=True).update(store=store)
    Category.objects.filter(store__isnull=True).update(store=store)
    Order.objects.filter(store__isnull=True).update(store=store)


def reverse_seed(apps, schema_editor):
    pass  # non-destructive reverse


class Migration(migrations.Migration):

    dependencies = [
        ('stores', '0001_initial'),
        ('products', '0003_store_fk'),
        ('orders', '0003_store_fk'),
    ]

    operations = [
        migrations.RunPython(create_default_store, reverse_seed),
    ]
