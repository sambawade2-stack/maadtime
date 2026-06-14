from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_store_inventory'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='order',
            field=models.PositiveIntegerField(default=0, db_index=True),
        ),
        migrations.AlterModelOptions(
            name='product',
            options={
                'ordering': ['order', '-created_at'],
                'verbose_name': 'Produit',
                'verbose_name_plural': 'Produits',
            },
        ),
    ]
