from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


@receiver(post_save, sender='orders.Order')
def notify_new_order(sender, instance, created, **kwargs):
    if not created:
        return
    if not settings.VAPID_PUBLIC_KEY or not settings.VAPID_PRIVATE_KEY:
        return

    try:
        from pywebpush import webpush, WebPushException
        from .models import PushSubscription

        subscriptions = PushSubscription.objects.all()
        if not subscriptions.exists():
            return

        import json
        payload = json.dumps({
            'title': 'Nouvelle commande !',
            'body': f'#{instance.order_number} — {instance.full_name} ({instance.city})',
            'url': '/dashboard/commandes',
        })

        vapid_claims = {'sub': f'mailto:{settings.VAPID_MAILTO}'}

        for sub in subscriptions:
            try:
                webpush(
                    subscription_info={
                        'endpoint': sub.endpoint,
                        'keys': {'p256dh': sub.p256dh, 'auth': sub.auth},
                    },
                    data=payload,
                    vapid_private_key=settings.VAPID_PRIVATE_KEY,
                    vapid_claims=vapid_claims,
                )
            except WebPushException as e:
                if e.response and e.response.status_code in (404, 410):
                    sub.delete()
    except Exception:
        pass
