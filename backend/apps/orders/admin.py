from django.contrib import admin
from .models import Order, OrderItem, Address


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'full_name', 'city', 'total', 'status', 'created_at']
    list_filter = ['status', 'city']
    search_fields = ['order_number', 'full_name', 'phone']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    list_editable = ['status']
    inlines = [OrderItemInline]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'city', 'is_default']
    list_filter = ['city', 'is_default']
