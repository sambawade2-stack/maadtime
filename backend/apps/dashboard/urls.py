from django.urls import path
from .views import (
    DashboardStatsView, SalesChartView, TopProductsView, RecentOrdersView,
    AdminCreateOrderView, VapidPublicKeyView, PushSubscribeView,
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('sales-chart/', SalesChartView.as_view(), name='sales-chart'),
    path('top-products/', TopProductsView.as_view(), name='top-products'),
    path('recent-orders/', RecentOrdersView.as_view(), name='recent-orders'),
    path('orders/create/', AdminCreateOrderView.as_view(), name='admin-create-order'),
    path('push/vapid-key/', VapidPublicKeyView.as_view(), name='vapid-public-key'),
    path('push/subscribe/', PushSubscribeView.as_view(), name='push-subscribe'),
]
