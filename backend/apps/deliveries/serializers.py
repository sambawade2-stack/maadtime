from rest_framework import serializers
from .models import Delivery, DeliveryZone


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'city', 'fee', 'estimated_days', 'is_active']


class DeliverySerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Delivery
        fields = [
            'id', 'order_number', 'zone_name', 'status', 'status_display',
            'driver_name', 'driver_phone', 'tracking_code',
            'estimated_delivery', 'delivered_at', 'notes', 'created_at'
        ]
