from django.core.management.base import BaseCommand
from apps.products.models import Category, Product
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Initialise la base de données avec les données de démonstration Maadtime'

    def handle(self, *args, **options):
        self.stdout.write('Création des catégories...')

        categories_data = [
            {'name': 'Maad naturel', 'slug': 'maad-naturel', 'order': 1},
            {'name': 'Huile de maad', 'slug': 'huile-de-maad', 'order': 2},
            {'name': 'Poudre de maad', 'slug': 'poudre-de-maad', 'order': 3},
            {'name': 'Savons naturels', 'slug': 'savons-naturels', 'order': 4},
            {'name': 'Cosmétiques', 'slug': 'cosmetiques', 'order': 5},
        ]

        categories = {}
        for data in categories_data:
            cat, _ = Category.objects.get_or_create(slug=data['slug'], defaults=data)
            categories[data['slug']] = cat

        self.stdout.write('Création des produits...')

        products_data = [
            {
                'name': 'Maad nature',
                'slug': 'maad-nature-1kg',
                'category': categories['maad-naturel'],
                'price': 2500,
                'compare_price': 3000,
                'stock': 50,
                'weight': '1kg',
                'is_featured': True,
                'is_new': True,
                'short_description': 'Maad sénégalais frais et naturel, récolté à la main.',
                'description': 'Le maad nature est un fruit sauvage du Sénégal, riche en vitamine C et en antioxydants. Il est récolté à la main dans les régions naturelles du Sénégal et séché naturellement pour préserver toutes ses vertus nutritionnelles.',
            },
            {
                'name': 'Huile de Maad',
                'slug': 'huile-de-maad-250ml',
                'category': categories['huile-de-maad'],
                'price': 3000,
                'compare_price': 3500,
                'stock': 30,
                'weight': '250ml',
                'is_featured': True,
                'short_description': 'Huile pure de maad, idéale pour la peau et les cheveux.',
                'description': 'Notre huile de maad est extraite à froid pour préserver toutes ses propriétés nutritives. Riche en acides gras essentiels, elle nourrit et hydrate en profondeur la peau et les cheveux.',
            },
            {
                'name': 'Savon au Maad',
                'slug': 'savon-maad-100g',
                'category': categories['savons-naturels'],
                'price': 1500,
                'stock': 100,
                'weight': '100g',
                'is_featured': True,
                'short_description': 'Savon artisanal au maad pour une peau douce et hydratée.',
                'description': 'Fabriqué artisanalement à partir d\'extraits de maad sénégalais, ce savon nettoie en douceur tout en nourrissant votre peau. Sans parabènes ni colorants artificiels.',
            },
            {
                'name': 'Poudre de Maad',
                'slug': 'poudre-maad-100g',
                'category': categories['poudre-de-maad'],
                'price': 1800,
                'stock': 40,
                'weight': '100g',
                'is_new': True,
                'short_description': 'Poudre de maad pure pour vos boissons et recettes.',
                'description': 'La poudre de maad est obtenue par déshydratation douce du fruit. Elle se dissout facilement dans l\'eau, les yaourts ou vos préparations culinaires. Un concentré de bienfaits naturels.',
            },
            {
                'name': 'Crème au Maad',
                'slug': 'creme-maad-150ml',
                'category': categories['cosmetiques'],
                'price': 2200,
                'stock': 25,
                'weight': '150ml',
                'is_featured': True,
                'short_description': 'Crème hydratante enrichie en extraits de maad.',
                'description': 'Formulée avec des extraits concentrés de maad, cette crème hydratante offre une hydratation longue durée et améliore l\'éclat naturel de votre peau.',
            },
        ]

        for data in products_data:
            Product.objects.get_or_create(slug=data['slug'], defaults=data)

        self.stdout.write('Création de l\'administrateur...')
        if not User.objects.filter(email='admin@maadtime.sn').exists():
            User.objects.create_superuser(
                email='admin@maadtime.sn',
                username='admin',
                password='maadtime2024!',
                first_name='Admin',
                last_name='Maadtime',
                role='admin',
            )

        self.stdout.write(self.style.SUCCESS('✅ Données de démonstration créées avec succès !'))
        self.stdout.write('   Admin: admin@maadtime.sn / maadtime2024!')
