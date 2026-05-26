import logging
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

logger = logging.getLogger(__name__)


class OptionalJWTAuthentication(JWTAuthentication):
    """
    - Pas de header Authorization → anonyme (endpoints publics OK).
    - Token fourni mais invalide/expiré → 401 AuthenticationFailed
      (l'intercepteur axios peut relancer un refresh).
    - Token valide → utilisateur authentifié.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None  # pas de token → anonyme, pas d'erreur
        try:
            return super().authenticate(request)
        except (TokenError, InvalidToken) as e:
            # Token présent mais invalide/expiré → 401 pour que le client puisse rafraîchir
            raise AuthenticationFailed(str(e))
        except Exception as e:
            logger.warning("OptionalJWTAuthentication unexpected error: %s", e)
            return None
