from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_alter_product_description'),
        ('stores', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='store',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='categories',
                to='stores.store',
            ),
        ),
        migrations.AddField(
            model_name='product',
            name='store',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='products',
                to='stores.store',
            ),
        ),
    ]
