from rest_framework import serializers
from .models import Store


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ['id', 'name', 'slug', 'description', 'logo', 'phone', 'whatsapp', 'address', 'regions', 'is_active', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class StoreOverviewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()
    logo = serializers.CharField(allow_null=True)
    is_active = serializers.BooleanField()
    orders_total = serializers.IntegerField()
    orders_pending = serializers.IntegerField()
    orders_today = serializers.IntegerField()
    revenue_total = serializers.FloatField()
    revenue_monthly = serializers.FloatField()
    products_total = serializers.IntegerField()
    low_stock = serializers.IntegerField()
    out_of_stock = serializers.IntegerField()
