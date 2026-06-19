from django.db import models


class SiteSettings(models.Model):
    """Informations publiques de l'unique boutique (singleton, toujours pk=1)."""
    name = models.CharField(max_length=200, default='Maadtime')
    logo = models.ImageField(upload_to='site/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name = 'Configuration du site'
        verbose_name_plural = 'Configuration du site'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
