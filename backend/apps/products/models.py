from django.db import models
from django.utils.text import slugify


def _unique_slug(model_class, name, pk=None):
    base = slugify(name) or "produit"
    slug, n = base, 1
    qs = model_class.objects.filter(slug=slug)
    if pk:
        qs = qs.exclude(pk=pk)
    while qs.exists():
        slug = f"{base}-{n}"
        n += 1
        qs = model_class.objects.filter(slug=slug)
        if pk:
            qs = qs.exclude(pk=pk)
    return slug


class Category(models.Model):
    """Catalogue global — partagé par toutes les boutiques."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(Category, self.name, self.pk)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Catalogue global — partagé par toutes les boutiques.
    Le stock est géré par StoreInventory (une entrée par boutique).
    """
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    weight = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(Product, self.name, self.pk)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def main_image(self):
        img = self.images.filter(is_main=True).first()
        return img.image.url if img else None

    @property
    def in_stock(self):
        """True si au moins une boutique a du stock."""
        return self.inventory.filter(stock__gt=0).exists()

    @property
    def total_stock(self):
        """Stock total toutes boutiques confondues."""
        from django.db.models import Sum
        return self.inventory.aggregate(t=Sum('stock'))['t'] or 0

    @property
    def discount_percent(self):
        if self.compare_price and self.compare_price > self.price:
            return round((1 - self.price / self.compare_price) * 100)
        return None


class StoreInventory(models.Model):
    """Stock d'un produit pour une boutique donnée."""
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='inventory')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory')
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['store', 'product']
        verbose_name = 'Stock boutique'
        verbose_name_plural = 'Stocks boutiques'

    def __str__(self):
        return f"{self.store.name} / {self.product.name} — {self.stock}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_main = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"


class Wishlist(models.Model):
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
        verbose_name = 'Favori'
        verbose_name_plural = 'Favoris'

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.rating}★ par {self.user.email}"
