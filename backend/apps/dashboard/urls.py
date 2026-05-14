from django.urls import path
from .views import DashboardStatsView, SalesChartView, TopProductsView, RecentOrdersView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('sales-chart/', SalesChartView.as_view(), name='sales-chart'),
    path('top-products/', TopProductsView.as_view(), name='top-products'),
    path('recent-orders/', RecentOrdersView.as_view(), name='recent-orders'),
]
