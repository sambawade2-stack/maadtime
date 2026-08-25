from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('new_order', 'Nouvelle commande')], default='new_order', max_length=50)),
                ('title', models.CharField(max_length=200)),
                ('message', models.CharField(max_length=500)),
                ('order_id', models.IntegerField(blank=True, db_index=True, null=True)),
                ('order_number', models.CharField(blank=True, max_length=30)),
                ('customer_name', models.CharField(blank=True, max_length=200)),
                ('total', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('read', models.BooleanField(db_index=True, default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['-created_at'], 'verbose_name': 'Notification', 'verbose_name_plural': 'Notifications'},
        ),
    ]
