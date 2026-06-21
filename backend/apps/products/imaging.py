"""Redimensionnement/compression des images uploadées (produits, catégories).

Les photos envoyées depuis un téléphone font souvent plusieurs Mo en 4000px+
de large, alors qu'elles ne sont jamais affichées au-delà de ~1600px sur le
site. Sans ce traitement, ces fichiers sont stockés et servis tels quels,
ce qui ralentit fortement le chargement du catalogue.
"""
import io
from PIL import Image as PILImage
from django.core.files.base import ContentFile

MAX_DIMENSION = 1600
JPEG_QUALITY = 82


def compress_image_field(image_field_file, max_dimension=MAX_DIMENSION, quality=JPEG_QUALITY):
    """Retourne un ContentFile prêt à assigner à un ImageField, redimensionné
    et compressé. Préserve la transparence (PNG) si présente, sinon JPEG."""
    image_field_file.seek(0)
    img = PILImage.open(image_field_file)
    img.load()
    has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)

    width, height = img.size
    if max(width, height) > max_dimension:
        ratio = max_dimension / max(width, height)
        img = img.resize((round(width * ratio), round(height * ratio)), PILImage.LANCZOS)

    buffer = io.BytesIO()
    base_name = image_field_file.name.rsplit('.', 1)[0] if image_field_file.name else 'image'
    if has_alpha:
        img = img.convert('RGBA')
        img.save(buffer, format='PNG', optimize=True)
        name = f"{base_name}.png"
    else:
        img = img.convert('RGB')
        img.save(buffer, format='JPEG', quality=quality, optimize=True)
        name = f"{base_name}.jpg"

    buffer.seek(0)
    return ContentFile(buffer.read(), name=name)
