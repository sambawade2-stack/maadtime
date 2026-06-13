# 🌿 Maadtime — Plateforme E-commerce

Plateforme e-commerce dédiée aux produits naturels sénégalais (maad, bouye, mangue…), avec un dashboard admin complet, gestion des stocks et notifications en temps réel.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15.3, React 19, TypeScript, Tailwind CSS |
| Backend | Django 5.0.6, Django REST Framework |
| Base de données | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT (SimpleJWT) |
| Animations | Framer Motion |
| State | Zustand |
| Formulaires | React Hook Form + Zod |
| Graphiques | Recharts |
| Déploiement | Docker, Nginx, Gunicorn, Dokploy |

---

## Fonctionnalités

### Boutique client
- Catalogue avec filtres (catégorie, prix, stock, tri)
- Fiche produit avec galerie d'images et avis
- Panier persistant
- Checkout avec sélection de région (Sénégal + international)
- Suivi de commande par numéro

### Dashboard admin
- **Produits** — création, modification, suppression, images
- **Stocks** — gestion par produit avec alertes rupture et stock faible
- **Commandes** — liste, changement de statut, création manuelle (téléphonique)
- **Livraisons** — zones de couverture
- **Clients** — historique et profils
- **Analytics** — chiffre d'affaires, top produits, graphiques par période
- **Notifications push** — alerte navigateur à chaque nouvelle commande, même onglet fermé

### Automatisations
- Routage automatique des commandes vers la boutique selon la région du client
- Création automatique d'entrée stock à chaque nouveau produit
- Cache Redis sur le catalogue (invalidé à chaque modification)

---

## Structure du projet

```
maadtime/
├── backend/
│   ├── apps/
│   │   ├── authentication/   # Utilisateurs, JWT
│   │   ├── stores/           # Boutiques et régions
│   │   ├── products/         # Catalogue, inventaire, images
│   │   ├── orders/           # Commandes et articles
│   │   ├── customers/        # Clients
│   │   ├── deliveries/       # Livraisons et zones
│   │   └── dashboard/        # Stats, analytics, push notifications
│   ├── core/                 # Settings (dev/prod), URLs
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (client)/     # Pages publiques (boutique, checkout, profil…)
│       │   └── (admin)/      # Dashboard admin
│       ├── components/
│       ├── hooks/            # useOrderPolling, usePushNotifications…
│       ├── stores/           # Zustand (panier, auth, notifications)
│       └── lib/              # Client API axios, utilitaires
├── nginx/                    # Reverse proxy
├── docker-compose.yml        # Production
├── docker-compose.dev.yml    # Développement
└── Makefile
```

---

## Lancement en développement

### Prérequis
- Python 3.12+
- Node.js 20+
- PostgreSQL
- Redis

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # adapter les valeurs
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tout en une commande

```bash
make dev
```

---

## Lancement avec Docker

### Développement

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Production

```bash
docker compose up --build -d
```

---

## Variables d'environnement

Créer `backend/.env` — **ne jamais commiter ce fichier**.

Les variables nécessaires sont :

```
DEBUG
SECRET_KEY
ALLOWED_HOSTS
POSTGRES_DB / POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_HOST / POSTGRES_PORT
REDIS_URL
VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_MAILTO
```

Pour générer les clés VAPID (notifications push navigateur) :

```bash
openssl ecparam -name prime256v1 -genkey -noout -out vapid.pem
# Clé publique
openssl ec -in vapid.pem -pubout -outform DER | tail -c 65 | base64 -w0 | tr '+/' '-_' | tr -d '='
# Clé privée
openssl ec -in vapid.pem -outform DER | tail -c 32 | base64 -w0 | tr '+/' '-_' | tr -d '='
rm vapid.pem
```

---

## Commandes utiles

```bash
# Appliquer les migrations
python manage.py migrate

# Synchroniser l'inventaire (produits sans entrée stock)
python manage.py sync_inventory

# Générer les fichiers statiques
python manage.py collectstatic
```

---

## Déploiement sur Dokploy

1. Connecter le repo GitHub dans Dokploy
2. Renseigner les variables d'environnement
3. Cliquer **Deploy**
4. Au premier déploiement, ouvrir le terminal du container backend et lancer :

```bash
cd /app && python manage.py migrate
cd /app && python manage.py sync_inventory
```

---

## URLs locales

| Service | URL |
|---------|-----|
| Boutique | `http://localhost:3000` |
| API | `http://localhost:8000/api/` |
| Django Admin | `http://localhost:8000/admin/` |
| Dashboard | `http://localhost:3000/dashboard` |

---

*Le goût naturel du maad sénégalais* 🌿
