import json
import logging
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)

ADMIN_GROUP = 'admin_notifications'


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = await self._authenticate()
        if user is None:
            logger.warning("WebSocket refusé : token invalide ou utilisateur non-admin.")
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(ADMIN_GROUP, self.channel_name)
        await self.accept()
        logger.info(f"WebSocket connecté : {user.email}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(ADMIN_GROUP, self.channel_name)
        except Exception:
            pass

    async def receive(self, text_data=None, bytes_data=None):
        # Canal en lecture seule pour les admins — pas de messages entrants
        pass

    # Handler appelé par group_send depuis le service
    async def new_order_notification(self, event):
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def _authenticate(self):
        """Valide le JWT passé en query string (?token=...) et vérifie le rôle admin."""
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from django.contrib.auth import get_user_model
            User = get_user_model()

            qs = parse_qs(self.scope.get('query_string', b'').decode())
            token_str = qs.get('token', [None])[0]
            if not token_str:
                return None

            token = AccessToken(token_str)
            user = User.objects.get(id=token['user_id'])
            if not user.is_active or not user.is_admin_user:
                return None
            return user
        except Exception:
            return None
