from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stores', '0002_seed_default_store'),
    ]

    operations = [
        migrations.AddField(
            model_name='store',
            name='regions',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
