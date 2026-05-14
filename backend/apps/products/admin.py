from django.contrib import admin
from .models import Category, Product, ProductImage, Wishlist, ProductReview


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'product_count', 'order']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active', 'order']

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Produits'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active', 'is_featured', 'is_new']
    list_filter = ['category', 'is_active', 'is_featured', 'is_new']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active', 'is_featured', 'stock']
    inlines = [ProductImageInline]


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_approved', 'created_at']
    list_editable = ['is_approved']
    list_filter = ['is_approved', 'rating']
