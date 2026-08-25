"""
Envoi de notifications Telegram via Bot API.
Le token n'est jamais exposé côté frontend ni dans les logs.
Les erreurs ne bloquent pas la création de commande (thread daemon).
"""
import logging
import threading
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

_TELEGRAM_TIMEOUT = 10  # secondes


def send_new_order_notification(order):
    """Lance l'envoi dans un thread daemon — non-bloquant pour la requête HTTP."""
    thread = threading.Thread(target=_send, args=(order,), daemon=True)
    thread.start()


def _send(order):
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '').strip()
    chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', '').strip()

    if not token or not chat_id:
        logger.debug("Telegram désactivé (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID non définis).")
        return

    try:
        message = _format(order)
        resp = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": message, "parse_mode": "HTML"},
            timeout=_TELEGRAM_TIMEOUT,
        )
        if resp.ok:
            logger.info(f"Telegram ✓ commande #{order.order_number}")
        else:
            # On logue le code d'erreur mais PAS le token
            logger.error(f"Telegram erreur HTTP {resp.status_code} pour commande #{order.order_number}")
    except requests.Timeout:
        logger.warning(f"Telegram timeout pour commande #{order.order_number}")
    except Exception as exc:
        logger.error(f"Telegram exception pour commande #{order.order_number} : {exc}")


def _format(order) -> str:
    user = order.user
    email = user.email if user else "Invité"

    items_lines = ""
    for item in order.items.all():
        line_total = item.price * item.quantity
        items_lines += (
            f"\n• <b>{item.product_name}</b> × {item.quantity}\n"
            f"  {_fcfa(item.price)} × {item.quantity} = {_fcfa(line_total)}\n"
        )

    delivery = _fcfa(order.delivery_fee) if order.delivery_fee else "Gratuite"
    notes_block = f"\n📝 Note :\n{order.notes}" if order.notes else ""
    neighborhood = f"{order.neighborhood}, " if order.neighborhood else ""
    address_full = f"{order.address_line}, {neighborhood}{order.city}"

    return (
        f"🛒 <b>NOUVELLE COMMANDE — MAADTIME</b>\n\n"
        f"━━━━━━━━━━━━━━━━━━\n\n"
        f"📦 <b>Commande #{order.order_number}</b>\n\n"
        f"👤 <b>CLIENT</b>\n"
        f"Nom : {order.full_name}\n"
        f"📱 Téléphone : {order.phone}\n"
        f"📧 Email : {email}\n"
        f"📍 Adresse : {address_full}\n\n"
        f"━━━━━━━━━━━━━━━━━━\n\n"
        f"🛍️ <b>PRODUITS</b>"
        f"{items_lines}\n"
        f"━━━━━━━━━━━━━━━━━━\n\n"
        f"💰 <b>TOTAL</b>\n"
        f"Sous-total : {_fcfa(order.subtotal)}\n"
        f"Livraison : {delivery}\n\n"
        f"💵 <b>TOTAL : {_fcfa(order.total)}</b>\n"
        f"💳 Paiement : À la livraison\n\n"
        f"━━━━━━━━━━━━━━━━━━\n\n"
        f"🚚 <b>LIVRAISON</b>\n"
        f"Adresse : {address_full}"
        f"{notes_block}\n\n"
        f"━━━━━━━━━━━━━━━━━━\n\n"
        f"🕐 {order.created_at.strftime('%d/%m/%Y à %H:%M')}\n\n"
        f"🔔 Nouvelle commande à traiter."
    )


def _fcfa(amount) -> str:
    return f"{int(amount):,} FCFA".replace(",", " ")
