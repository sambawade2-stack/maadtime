from django.db import models


class CustomerProfile(models.Model):
    user = models.OneToOneField('authentication.User', on_delete=models.CASCADE, related_name='profile')
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Profil client'
        verbose_name_plural = 'Profils clients'

    def __str__(self):
        return f"Profil de {self.user.email}"
