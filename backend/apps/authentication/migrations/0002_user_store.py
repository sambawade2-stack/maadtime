# Historique : ajoutait à l'origine User.store (FK vers l'app stores, supprimée
# depuis — boutique unique, voir conversation du 2026-06-19). La colonne
# correspondante reste intacte en base sur les environnements où elle a déjà
# été créée ; ce fichier est conservé vide pour ne pas casser l'historique
# des migrations déjà appliquées (django_migrations).
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = []
