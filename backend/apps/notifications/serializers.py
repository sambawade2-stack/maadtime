from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message',
            'order_id', 'order_number', 'customer_name',
            'total', 'read', 'created_at',
        ]
        read_only_fields = ['id', 'type', 'title', 'message', 'order_id', 'order_number',
                            'customer_name', 'total', 'created_at']
