from django.core.management.base import BaseCommand
from apps.products.models import ProductImage, Category
from apps.products.imaging import compress_image_field

# Ne retraite que les fichiers au-delà de ce seuil — évite de re-compresser
# inutilement des images déjà optimisées (perte de qualité cumulative).
SIZE_THRESHOLD = 300 * 1024  # 300 Ko


class Command(BaseCommand):
    help = "Redimensionne/compresse les images de produits et catégories déjà en ligne (> 300 Ko)."

    def handle(self, *args, **options):
        total_before = 0
        total_after = 0
        processed = 0

        querysets = [
            ('Produit', ProductImage.objects.exclude(image='')),
            ('Catégorie', Category.objects.exclude(image='')),
        ]

        for label, qs in querysets:
            for obj in qs:
                if not obj.image or not obj.image.storage.exists(obj.image.name):
                    continue
                try:
                    size_before = obj.image.size
                except Exception:
                    continue
                if size_before <= SIZE_THRESHOLD:
                    continue

                compressed = compress_image_field(obj.image)
                old_name = obj.image.name
                obj.image.save(compressed.name, compressed, save=True)
                obj.image.storage.delete(old_name)

                size_after = obj.image.size
                total_before += size_before
                total_after += size_after
                processed += 1
                self.stdout.write(
                    f"  {label} #{obj.pk} : {size_before / 1024:.0f} Ko → {size_after / 1024:.0f} Ko"
                )

        if processed == 0:
            self.stdout.write(self.style.SUCCESS("Aucune image à compresser (toutes < 300 Ko)."))
            return

        saved = total_before - total_after
        self.stdout.write(self.style.SUCCESS(
            f"\n{processed} image(s) compressée(s) — "
            f"{total_before / 1024 / 1024:.1f} Mo → {total_after / 1024 / 1024:.1f} Mo "
            f"(-{saved / 1024 / 1024:.1f} Mo, {saved / total_before * 100:.0f}%)"
        ))
