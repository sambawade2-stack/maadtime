from .base import *
from decouple import config

DEBUG = False

# Traefik gère le SSL — Django ne doit pas forcer la redirection HTTPS
SECURE_SSL_REDIRECT = False
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

CSRF_TRUSTED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://maadtime.com,https://www.maadtime.com'
).split(',')

# Désactiver le browsable API en production
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [
    'rest_framework.renderers.JSONRenderer',
]

# Limites upload fichiers
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024   # 10 Mo
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024    # 5 Mo
