import logging
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

logger = logging.getLogger(__name__)


class OptionalJWTAuthentication(JWTAuthentication):
    """
    Token invalide ou expiré → traité comme anonyme (pas de 401).
    Les endpoints publics restent accessibles ; les endpoints protégés
    continuent à refuser via leur permission_classes.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (TokenError, InvalidToken):
            return None
        except Exception as e:
            logger.warning("OptionalJWTAuthentication unexpected error: %s", e)
            return None
