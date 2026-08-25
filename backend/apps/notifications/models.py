from django.db import models


class Notification(models.Model):
    TYPE_NEW_ORDER = 'new_order'
    TYPE_CHOICES = [
        (TYPE_NEW_ORDER, 'Nouvelle commande'),
    ]

    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default=TYPE_NEW_ORDER)
    title = models.CharField(max_length=200)
    message = models.CharField(max_length=500)
    order_id = models.IntegerField(null=True, blank=True, db_index=True)
    order_number = models.CharField(max_length=30, blank=True)
    customer_name = models.CharField(max_length=200, blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"[{self.type}] {self.title} — {self.created_at:%d/%m/%Y %H:%M}"
