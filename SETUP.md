# Guide de Configuration - Baloise Leads

## Démarrage rapide (5 minutes)

### Étape 1 : Démarrer PostgreSQL

```bash
docker-compose up -d
```

Vérifier que PostgreSQL démarre :
```bash
docker-compose ps
```

### Étape 2 : Installer et configurer le backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

**Résultat attendu :**
```
✅ Seeding completed!
Created 2 agents
Created 3 leads
```

### Étape 3 : Démarrer le backend

```bash
npm run dev
```

**Output :**
```
Server running on http://localhost:3000
```

### Étape 4 : Installer et démarrer le frontend

```bash
cd ../frontend
npm install
npm run dev
```

**Output :**
```
  Local:   http://localhost:5173
```

## Accès à l'application

- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:3000/health

### Identifiants de test

| Email | Mot de passe |
|-------|-------------|
| agent1@baloise.com | test |
| agent2@baloise.com | test |

**Note** : La validation du mot de passe est désactivée en développement.

## Base de données

### Inspecter la base de données

```bash
cd backend
npx prisma studio
```

Cela ouvre l'interface Prisma sur http://localhost:5555

### Réinitialiser la base de données

```bash
cd backend
npx prisma migrate reset
```

## Dépannage

### Erreur : "Connection refused" sur PostgreSQL

Vérifier que PostgreSQL est en cours d'exécution :
```bash
docker-compose ps
```

Redémarrer si nécessaire :
```bash
docker-compose restart postgres
```

### Erreur : "Cannot find module"

Réinstaller les dépendances :
```bash
cd backend
rm -rf node_modules
npm install
```

### Erreur d'authentification au login

Les identifiants de test sont stockés dans `src/seeds/seed.ts`. Vérifier qu'ils correspondent à ceux utilisés.

## Architecture des migrations

Les migrations Prisma sont automatiquement gérées par `npx prisma migrate dev`.

Pour créer une migration manuellement :
```bash
npx prisma migrate dev --name descriptive_name
```

Les migrations sont stockées dans `prisma/migrations/`.

## Variables d'environnement

### Backend

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| DATABASE_URL | postgresql://postgres:postgres@localhost:5432/baloise_leads | URL de connexion PostgreSQL |
| PORT | 3000 | Port du serveur Express |
| JWT_SECRET | your-secret-key-change-in-production | Clé secrète JWT |
| NODE_ENV | development | Environnement (development/production) |

### Frontend

| Variable | Description |
|----------|-------------|
| VITE_API_URL | URL de l'API backend |

## Structure de la base de données

### Tables principales

- **agents** : Utilisateurs (agents Baloise)
- **leads** : Opportunités commerciales
- **lead_actions** : Historique des actions sur les leads

### Relations

```
agents 1 --- * leads
leads 1 --- * lead_actions
```

## Seed data incluse

### Agents (2)
- Jean Dupont (agent1@baloise.com)
- Marie Martin (agent2@baloise.com)

### Leads (3)
1. Pierre Bernard - Produit: Drive - Statut: NEW
2. Sophie Leclerc - Produit: Home - Statut: IN_PROGRESS (avec note)
3. Marc Durand - Produit: Pension Plan - Statut: NEW

## Prochaines étapes

1. **Développement local** : Modifier le code et voir les changements en temps réel
2. **Tests** : Ajouter des tests unitaires et d'intégration
3. **Déploiement** : Configurer le déploiement (Docker, Heroku, etc.)
4. **Monitoring** : Ajouter les logs et monitoring

## Support

Pour toute question, consulter :
- README.md (architecture et fonctionnalités)
- schema.prisma (modèle de données)
- src/routes/ (endpoints API)
