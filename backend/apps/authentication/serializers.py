from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User


class StoreMinimalSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    store = StoreMinimalSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone',
                  'role', 'is_staff', 'is_superuser', 'store', 'avatar', 'created_at']
        read_only_fields = ['id', 'role', 'is_staff', 'is_superuser', 'created_at']

    def validate_avatar(self, value):
        if value is None:
            return value
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Image trop volumineuse (max 5 Mo).')
        from PIL import Image as PILImage
        try:
            pil_img = PILImage.open(value)
            pil_img.verify()
            if pil_img.format not in ('JPEG', 'PNG', 'WEBP', 'GIF'):
                raise ValueError('Format non supporté')
            value.seek(0)
        except Exception:
            raise serializers.ValidationError('Fichier image invalide. Utilisez JPEG, PNG ou WebP.')
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'phone', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except Exception as e:
            raise serializers.ValidationError({'detail': 'Email ou mot de passe incorrect.'}) from None
        data['user'] = UserSerializer(self.user).data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Ancien mot de passe incorrect.')
        return value
