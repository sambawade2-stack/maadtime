from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('client', 'Client'),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if self.is_staff or self.is_superuser:
            self.role = 'admin'
        super().save(*args, **kwargs)

    @property
    def is_admin_user(self):
        return self.role == 'admin' or self.is_staff
