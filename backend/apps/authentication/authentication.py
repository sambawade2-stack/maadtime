from rest_framework_simplejwt.authentication import JWTAuthentication


class OptionalJWTAuthentication(JWTAuthentication):
    """
    Token invalide ou expiré → traité comme anonyme (pas de 401).
    Les endpoints publics restent accessibles ; les endpoints protégés
    continuent à refuser via leur permission_classes.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except Exception:
            return None
