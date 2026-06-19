from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SiteSettings
from .serializers import SiteSettingsSerializer


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


class SiteSettingsView(APIView):
    """Infos publiques de la boutique (nom, téléphone, whatsapp, adresse, logo)."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        serializer = SiteSettingsSerializer(SiteSettings.get_solo(), context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        obj = SiteSettings.get_solo()
        serializer = SiteSettingsSerializer(obj, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
