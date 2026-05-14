# 🌿 Maadtime — Plateforme E-commerce Premium

> Le goût naturel du maad sénégalais — Plateforme e-commerce moderne, scalable et prête pour la production.

---

## 📁 Architecture du projet

```
madetime/
├── backend/              # API Django REST
│   ├── apps/
│   │   ├── authentication/   # JWT Auth + User model
│   │   ├── products/         # Produits, catégories, favoris
│   │   ├── orders/           # Commandes, adresses
│   │   ├── customers/        # Gestion clients
│   │   ├── deliveries/       # Livraisons, zones
│   │   └── dashboard/        # Analytics & stats
│   ├── core/settings/        # Dev / Production
│   └── Dockerfile
│
├── frontend/             # Next.js 15 + TypeScript
│   ├── src/app/
│   │   ├── (client)/         # Pages publiques
│   │   │   ├── page.tsx          # Accueil
│   │   │   ├── boutique/         # Boutique avec filtres
│   │   │   ├── produits/[id]/    # Détail produit
│   │   │   ├── panier/           # Panier
│   │   │   ├── checkout/         # Finaliser commande
│   │   │   └── profil/           # Espace client
│   │   └── (admin)/dashboard/    # Admin premium
│   ├── src/components/       # Composants réutilisables
│   ├── src/stores/           # Zustand (cart, auth)
│   ├── src/lib/              # API client (axios), utils
│   └── Dockerfile
│
├── nginx/                # Reverse proxy + SSL
├── docker-compose.yml    # Production
├── docker-compose.dev.yml # Développement
└── .env.example
```

---

## 🚀 Démarrage rapide

### Prérequis
- Docker & Docker Compose
- Node.js 20+ (développement local)
- Python 3.12+ (développement local)

### Développement local

```bash
# 1. Cloner et configurer l'environnement
cp .env.example .env

# 2. Démarrer avec Docker (recommandé)
docker compose -f docker-compose.dev.yml up --build

# 3. Ou lancer manuellement:

# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

### Production avec Docker

```bash
# Configurer .env
cp .env.example .env
# Éditer .env avec vos vraies valeurs

# Lancer
docker compose up --build -d

# Migrations
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Boutique | `http://localhost` |
| API | `http://localhost/api/` |
| API Docs | `http://localhost/api/docs/` |
| Django Admin | `http://localhost/admin/` |
| Dashboard Admin | `http://localhost/dashboard` |

---

## 📡 API Endpoints

### Authentification
```
POST /api/auth/register/        Inscription
POST /api/auth/login/           Connexion (retourne JWT)
POST /api/auth/logout/          Déconnexion
POST /api/auth/token/refresh/   Renouveler token
GET  /api/auth/profile/         Mon profil
```

### Produits
```
GET  /api/products/             Liste produits (filtres: search, category, price...)
GET  /api/products/:slug/       Détail produit
GET  /api/products/featured/    Produits populaires
GET  /api/products/new_arrivals/ Nouveautés
GET  /api/products/categories/  Catégories
GET  /api/products/wishlist/    Mes favoris (auth)
POST /api/products/wishlist/    Ajouter favori (auth)
```

### Commandes
```
POST /api/orders/               Créer une commande
GET  /api/orders/               Mes commandes (auth)
GET  /api/orders/:id/           Détail commande
POST /api/orders/:id/cancel/    Annuler commande
```

### Dashboard (admin)
```
GET /api/dashboard/stats/        Statistiques générales
GET /api/dashboard/sales-chart/  Graphique ventes
GET /api/dashboard/top-products/ Top produits
GET /api/dashboard/recent-orders/ Commandes récentes
```

---

## 🎨 Stack Technique

**Frontend**
- Next.js 15 (App Router + Server Components)
- TypeScript strict
- Tailwind CSS + design system custom
- Framer Motion (animations premium)
- Zustand (cart + auth state)
- React Hook Form + Zod (validation)
- Recharts (graphiques admin)

**Backend**
- Django 5 + Django REST Framework
- JWT Authentication (SimpleJWT)
- PostgreSQL 16
- Redis (cache + sessions)
- drf-spectacular (OpenAPI docs)

**Infrastructure**
- Docker + Docker Compose
- Nginx (reverse proxy, SSL, rate limiting)
- Gunicorn (WSGI production)
- Dokploy (déploiement)

---

## 🚢 Déploiement Dokploy

1. **Créer le projet** dans Dokploy
2. **Connecter le repo** Git
3. **Configurer les variables** d'environnement (copier depuis `.env.example`)
4. **Déployer** — Dokploy détecte automatiquement `docker-compose.yml`
5. **Configurer le domaine** et SSL (Let's Encrypt automatique)

---

## 🔐 Sécurité

- JWT tokens avec rotation automatique
- CORS configuré par domaine
- Rate limiting Nginx
- Headers de sécurité HTTP
- Validation stricte des données (Zod côté frontend, DRF côté backend)
- Variables sensibles en `.env` (jamais committées)
- Gunicorn multi-workers en production

---

## 📞 Contact Maadtime

- **WhatsApp**: +221 77 304 34 53
- **Localisation**: Neweli, Sénégal
- **Slogan**: *Le goût naturel du maad sénégalais*
