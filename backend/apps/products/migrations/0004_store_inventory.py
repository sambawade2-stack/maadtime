"""
Migration vers le catalogue global :
- Supprime store FK de Category et Product
- Supprime stock de Product
- Crée StoreInventory (store × product × stock)
- Data migration : crée les entrées StoreInventory à partir du stock actuel
"""
from django.db import migrations, models
import django.db.models.deletion


def create_inventories(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    Store = apps.get_model('stores', 'Store')
    StoreInventory = apps.get_model('products', 'StoreInventory')

    stores = list(Store.objects.all())
    if not stores:
        return

    for product in Product.objects.all():
        for store in stores:
            StoreInventory.objects.get_or_create(
                store=store,
                product=product,
                defaults={'stock': product.stock},
            )


def reverse_inventories(apps, schema_editor):
    StoreInventory = apps.get_model('products', 'StoreInventory')
    StoreInventory.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_store_fk'),
        ('stores', '0001_initial'),
    ]

    operations = [
        # 1. Créer StoreInventory AVANT de supprimer les champs source
        migrations.CreateModel(
            name='StoreInventory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stock', models.PositiveIntegerField(default=0)),
                ('store', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inventory', to='stores.store')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inventory', to='products.product')),
            ],
            options={
                'verbose_name': 'Stock boutique',
                'verbose_name_plural': 'Stocks boutiques',
                'unique_together': {('store', 'product')},
            },
        ),

        # 2. Data migration : copier stock → StoreInventory
        migrations.RunPython(create_inventories, reverse_inventories),

        # 3. Supprimer store FK de Category
        migrations.RemoveField(model_name='category', name='store'),

        # 4. Supprimer store FK de Product
        migrations.RemoveField(model_name='product', name='store'),

        # 5. Supprimer stock de Product (maintenant dans StoreInventory)
        migrations.RemoveField(model_name='product', name='stock'),
    ]
