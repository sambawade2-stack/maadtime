from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('POSTGRES_DB', default='maadtime'),
        'USER': config('POSTGRES_USER', default='maadtime'),
        'PASSWORD': config('POSTGRES_PASSWORD', default='maadtime123'),
        'HOST': config('POSTGRES_HOST', default='localhost'),
        'PORT': config('POSTGRES_PORT', default='5432'),
    }
}

CORS_ALLOW_ALL_ORIGINS = True
