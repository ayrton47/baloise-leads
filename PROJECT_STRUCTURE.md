# Structure du Projet - Baloise Leads

## 📁 Vue d'ensemble

```
suivi-des-leads/
├── backend/                    # Application Node.js/Express
├── frontend/                   # Application React/Vite
├── docker-compose.yml          # Dev - PostgreSQL uniquement
├── docker-compose.prod.yml     # Prod - Stack complet
├── Dockerfile.backend          # Image Docker backend
├── Dockerfile.frontend         # Image Docker frontend
├── .gitignore                  # Git ignore (racine)
├── README.md                   # Documentation principale
├── SETUP.md                    # Guide de démarrage
├── API_WEBHOOK.md              # Documentation webhooks
└── PROJECT_STRUCTURE.md        # Ce fichier
```

## 📦 Backend (`/backend`)

### Configuration
```
backend/
├── .env                        # Variables d'env (développement)
├── .env.example                # Template des variables
├── .env.production             # Variables d'env (production)
├── package.json                # Dépendances Node.js
├── tsconfig.json               # Configuration TypeScript
└── .gitignore
```

### Prisma ORM
```
prisma/
├── schema.prisma               # Modèle de données
├── migrations/                 # Historique des migrations
└── .env.example
```

### Code source
```
src/
├── index.ts                    # Point d'entrée Express
├── middleware/
│   └── auth.ts                 # Middleware JWT
├── routes/
│   ├── auth.ts                 # Endpoints auth (login, register)
│   ├── leads.ts                # Endpoints leads (CRUD + actions)
│   └── webhook.ts              # Endpoint webhook externe
├── lib/
│   └── prisma.ts               # Client Prisma initialisé
├── types/
│   └── index.ts                # Types TypeScript partagés
├── utils/
│   └── webhook-test.ts         # Utilitaire de test webhook
└── seeds/
    └── seed.ts                 # Données de développement
```

### Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Connexion agent |
| POST | `/api/auth/register` | Inscription agent |
| GET | `/api/leads` | Liste des leads avec filtres |
| GET | `/api/leads/:id` | Détail d'un lead |
| POST | `/api/leads` | Créer un lead manuellemen |
| POST | `/api/leads/:id/refuse` | Refuser un lead |
| POST | `/api/leads/:id/quote` | Créer un tarif |
| POST | `/api/leads/:id/callback` | Planifier un rappel |
| POST | `/api/webhook/leads` | Webhook de leads externes |

## 🎨 Frontend (`/frontend`)

### Configuration
```
frontend/
├── .env.example                # Template des variables
├── package.json                # Dépendances Node.js
├── tsconfig.json               # Configuration TypeScript (principal)
├── tsconfig.node.json          # Configuration TypeScript (Vite)
├── vite.config.ts              # Configuration Vite
├── tailwind.config.js          # Configuration Tailwind CSS
├── postcss.config.js           # Configuration PostCSS
├── index.html                  # Point d'entrée HTML
└── .gitignore
```

### Code source
```
src/
├── main.tsx                    # Point d'entrée React
├── App.tsx                     # Composant racine
├── index.css                   # Styles globaux Tailwind
├── pages/
│   ├── LoginPage.tsx           # Page de connexion
│   └── LeadsPage.tsx           # Page principale (liste + gestion)
├── components/
│   ├── LeadRow.tsx             # Composant ligne lead
│   ├── LeadActionPanel.tsx     # Panneau des actions lead
│   └── AddLeadModal.tsx        # Modal pour ajouter un lead
├── context/
│   └── AuthContext.tsx         # Context pour l'auth + state utilisateur
├── hooks/
│   └── useNavigate.ts          # Hook custom navigation
├── lib/
│   └── api.ts                  # Client Axios avec intercepteurs
└── types/
    └── index.ts                # Types TypeScript partagés
```

## 🗄️ Base de données

### Modèle de données (Prisma Schema)

#### Tables

**agents**
- `id` (UUID) - Clé primaire
- `email` (String) - Unique
- `name` (String)
- `createdAt`, `updatedAt`

**leads**
- `id` (UUID) - Clé primaire
- `firstName`, `lastName` (String)
- `email`, `phone` (String, optionnel)
- `productInterest` (ProductType: DRIVE | HOME | PENSION_PLAN)
- `status` (LeadStatus: NEW | IN_PROGRESS | TO_CONTACT | QUOTED | REFUSED | CONVERTED)
- `source` (LeadSource: MANUAL | API_EXTERNAL)
- `externalId` (String, unique, optionnel) - ID externe
- `agentId` (UUID, FK) - Lié à agents
- `createdAt`, `updatedAt`

**lead_actions**
- `id` (UUID) - Clé primaire
- `leadId` (UUID, FK) - Lié à leads
- `type` (ActionType: REFUSED | QUOTE_CREATED | CALLBACK_SCHEDULED | NOTE_ADDED)
- `refusalReason` (RefusalReason, optionnel)
- `refusalNote` (String, optionnel)
- `quotedProduct` (ProductType, optionnel)
- `quoteUrl` (String, optionnel)
- `callbackDate` (DateTime, optionnel)
- `note` (String, optionnel)
- `createdAt`
- `createdBy` (String) - ID de l'agent

### Relations
```
agents (1) ──→ (Many) leads
leads (1) ──→ (Many) lead_actions
```

## 🔐 Authentification & Sécurité

### JWT (JSON Web Tokens)
- Stockage : localStorage (frontend)
- Clé secrète : `JWT_SECRET` en .env
- Durée de vie : 24h
- Middleware : `authMiddleware` sur routes protégées

### Webhooks
- Validation : Signature HMAC SHA256
- Header : `x-webhook-signature`
- Clé secrète : `WEBHOOK_SECRET` en .env
- Exemple : `backend/src/utils/webhook-test.ts`

## 📊 Données de développement (Seed)

### Agents
```
agent1@baloise.com → Jean Dupont
agent2@baloise.com → Marie Martin
```

### Leads
1. Pierre Bernard (agent1) - DRIVE - NEW
2. Sophie Leclerc (agent1) - HOME - IN_PROGRESS (avec note)
3. Marc Durand (agent2) - PENSION_PLAN - NEW

## 🚀 Déploiement

### Développement
```bash
docker-compose up -d
npm run dev  # Backend & Frontend
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Variables d'environnement requises
```
# Backend
DATABASE_URL
JWT_SECRET
WEBHOOK_SECRET

# Frontend
(Automatiquement configuré via proxy)
```

## 📝 Fichiers importants à connaître

| Fichier | Rôle |
|---------|------|
| `README.md` | Documentation principale |
| `SETUP.md` | Guide de démarrage rapide |
| `API_WEBHOOK.md` | Documentation détaillée webhooks |
| `prisma/schema.prisma` | Définition du modèle de données |
| `backend/src/index.ts` | Configuration du serveur Express |
| `frontend/src/App.tsx` | Structure de l'appli React |
| `docker-compose.yml` | Config Docker développement |

## 🔄 Flux utilisateur

```
1. Visite http://localhost:5173
2. Connexion (agent1@baloise.com / password)
3. Voir liste des leads avec stats
4. Filtrer par statut/produit
5. Cliquer sur un lead pour voir les actions
6. Effectuer une action (refuse, quote, callback)
7. Ajouter un nouveau lead via modal
```

## 🛠️ Stack technique résumé

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | React Context + TanStack Query |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| DB | PostgreSQL |
| Auth | JWT |
| Conteneurisation | Docker & Docker Compose |

## 📖 Pour aller plus loin

- **Tests** : Ajouter Jest (backend) et Vitest (frontend)
- **Monitoring** : Intégrer Sentry ou DataDog
- **CI/CD** : GitHub Actions ou GitLab CI
- **Notifications** : Intégrer Twilio (SMS) ou SendGrid (Email)
- **Analytics** : PostHog ou Mixpanel
- **Logging** : Winston ou Pino (backend)
