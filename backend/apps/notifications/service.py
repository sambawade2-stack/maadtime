"""
Couche de service centrale : déclenche toutes les notifications lors
de la création d'une commande. Un seul point d'entrée : handle_new_order().
"""
import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification

logger = logging.getLogger(__name__)

ADMIN_GROUP = 'admin_notifications'


def handle_new_order(order):
    """Coordonne : DB → WebSocket → Telegram."""
    notification = _create_notification(order)
    _send_websocket(notification, order)
    _send_telegram(order)


def _create_notification(order):
    return Notification.objects.create(
        type=Notification.TYPE_NEW_ORDER,
        title='Nouvelle commande',
        message=f'Commande #{order.order_number} reçue',
        order_id=order.id,
        order_number=order.order_number,
        customer_name=order.full_name,
        total=order.total,
    )


def _send_websocket(notification, order):
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            ADMIN_GROUP,
            {
                'type': 'new_order_notification',
                'data': {
                    'type': 'new_order',
                    'notification': {
                        'id': notification.id,
                        'title': notification.title,
                        'message': notification.message,
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'customer_name': order.full_name,
                        'total': float(order.total),
                        'read': False,
                        'created_at': notification.created_at.isoformat(),
                    },
                },
            },
        )
    except Exception as e:
        logger.error(f"WebSocket notification échouée : {e}")


def _send_telegram(order):
    try:
        from integrations.telegram.service import send_new_order_notification
        send_new_order_notification(order)
    except Exception as e:
        logger.error(f"Telegram notification échouée : {e}")
