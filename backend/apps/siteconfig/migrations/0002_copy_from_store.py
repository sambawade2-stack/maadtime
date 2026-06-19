from django.db import migrations


def copy_store_data(apps, schema_editor):
    """Copie les infos de l'ancienne table stores_store (boutique unique) vers
    SiteSettings, si elle existe. Utilise du SQL brut pour ne dépendre d'aucune
    app Django (la table physique peut exister même si apps.stores n'est plus
    installée). Ne supprime ni ne modifie la table d'origine."""
    if 'stores_store' not in schema_editor.connection.introspection.table_names():
        return

    SiteSettings = apps.get_model('siteconfig', 'SiteSettings')
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("SELECT name, phone, whatsapp, address, logo FROM stores_store ORDER BY id LIMIT 1")
        row = cursor.fetchone()

    if not row:
        return

    name, phone, whatsapp, address, logo = row
    SiteSettings.objects.update_or_create(
        pk=1,
        defaults={
            'name': name or 'Maadtime',
            'phone': phone or '',
            'whatsapp': whatsapp or '',
            'address': address or '',
            'logo': logo or '',
        },
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('siteconfig', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(copy_store_data, noop),
    ]
