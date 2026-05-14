from django.db import models


class DeliveryZone(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    fee = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    estimated_days = models.PositiveSmallIntegerField(default=2)

    class Meta:
        verbose_name = 'Zone de livraison'
        verbose_name_plural = 'Zones de livraison'

    def __str__(self):
        return f"{self.name} - {self.city}"


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('assigned', 'Assignée'),
        ('in_transit', 'En transit'),
        ('delivered', 'Livrée'),
        ('failed', 'Échouée'),
    ]

    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='delivery')
    zone = models.ForeignKey(DeliveryZone, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    driver_name = models.CharField(max_length=200, blank=True)
    driver_phone = models.CharField(max_length=20, blank=True)
    tracking_code = models.CharField(max_length=50, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Livraison'
        verbose_name_plural = 'Livraisons'
        ordering = ['-created_at']

    def __str__(self):
        return f"Livraison {self.order.order_number}"
