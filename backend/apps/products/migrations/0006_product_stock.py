from django.db import migrations, models


def copy_stock_from_inventory(apps, schema_editor):
    """Copie le stock de products_storeinventory (boutique unique) vers
    Product.stock, si la table existe encore. Utilise du SQL brut pour ne
    dépendre d'aucun état Django (le modèle StoreInventory n'est plus géré).
    Ne supprime ni ne modifie la table d'origine."""
    if 'products_storeinventory' not in schema_editor.connection.introspection.table_names():
        return

    Product = apps.get_model('products', 'Product')
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            "SELECT product_id, SUM(stock) FROM products_storeinventory GROUP BY product_id"
        )
        stock_by_product = dict(cursor.fetchall())

    for product in Product.objects.all():
        product.stock = stock_by_product.get(product.id, 0) or 0
        product.save(update_fields=['stock'])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_product_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.RunPython(copy_stock_from_inventory, noop),
    ]
