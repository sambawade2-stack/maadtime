from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Maadtime', max_length=200)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='site/')),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('whatsapp', models.CharField(blank=True, max_length=20)),
                ('address', models.CharField(blank=True, max_length=300)),
            ],
            options={
                'verbose_name': 'Configuration du site',
                'verbose_name_plural': 'Configuration du site',
            },
        ),
    ]
