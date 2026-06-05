from django.db import models


class PushSubscription(models.Model):
    user = models.ForeignKey(
        'authentication.User', on_delete=models.CASCADE,
        related_name='push_subscriptions', null=True, blank=True
    )
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Abonnement push'
        verbose_name_plural = 'Abonnements push'

    def __str__(self):
        return f"{self.user} — {self.endpoint[:60]}"
