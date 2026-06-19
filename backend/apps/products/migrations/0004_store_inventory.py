# Historique : créait à l'origine StoreInventory (stock par boutique) et
# retirait category.store / product.store / product.stock. L'app stores a
# été supprimée depuis (boutique unique, voir conversation du 2026-06-19) ;
# la table products_storeinventory reste intacte en base sur les
# environnements où elle a déjà été créée (rien n'est supprimé).
# Seul le retrait de product.stock (qui ne dépend pas de l'app stores) est
# conservé : le champ revient sur Product via la migration 0006.
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_store_fk'),
    ]

    operations = [
        migrations.RemoveField(model_name='product', name='stock'),
    ]
