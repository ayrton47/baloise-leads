# Guide d'installation complet - Baloise Leads

## ⏱️ Temps estimé : 5-10 minutes

## 1️⃣ Prérequis

Avant de commencer, vérifiez que vous avez :

```bash
# Node.js 18+
node --version   # v18.0.0 ou plus

# npm
npm --version    # 9.0.0 ou plus

# Docker & Docker Compose (optionnel, pour PostgreSQL)
docker --version
docker-compose --version
```

Si vous n'avez pas Node.js :
- [Télécharger Node.js](https://nodejs.org/) (version LTS recommandée)

Si vous n'avez pas Docker :
- [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop)

## 2️⃣ Démarrer PostgreSQL

### Option A : Avec Docker (recommandé)

```bash
# À la racine du projet
docker-compose up -d

# Vérifier que PostgreSQL démarre
docker-compose ps
```

**Résultat attendu :**
```
CONTAINER ID   IMAGE                PORTS
xxxxx          postgres:16-alpine   0.0.0.0:5432->5432/tcp
```

### Option B : Installer PostgreSQL localement

1. [Télécharger PostgreSQL](https://www.postgresql.org/download/)
2. Créer une base de données `baloise_leads`
3. Mettre à jour `backend/.env` :
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/baloise_leads"
   ```

## 3️⃣ Initialiser le backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Créer la structure de la base de données
npx prisma migrate dev --name init

# (Optionnel) Remplir avec des données de test
npm run prisma:seed
```

**Résultat attendu :**
```
✅ Seeding completed!
Created 2 agents
Created 3 leads
```

## 4️⃣ Démarrer le serveur backend

```bash
# Depuis le dossier backend
npm run dev
```

**Résultat attendu :**
```
Server running on http://localhost:3000
```

Laisser ce terminal ouvert.

## 5️⃣ Initialiser le frontend (nouveau terminal)

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install
```

## 6️⃣ Démarrer le serveur frontend

```bash
# Depuis le dossier frontend
npm run dev
```

**Résultat attendu :**
```
  Local:   http://localhost:5173
```

## 7️⃣ Accéder à l'application

Ouvrez votre navigateur et allez à :

```
http://localhost:5173
```

## 🔐 Identifiants de test

Utilisez l'un de ces comptes pour vous connecter :

| Email | Mot de passe |
|-------|-------------|
| agent1@baloise.com | test |
| agent2@baloise.com | test |

**Note :** En développement, la validation du mot de passe est désactivée.

## ✅ Vérifier que tout fonctionne

### Checklist

- [ ] Frontend charge sur http://localhost:5173
- [ ] Backend accessible sur http://localhost:3000/health (retourne `{"status":"ok"}`)
- [ ] PostgreSQL en cours d'exécution
- [ ] Connexion réussie avec agent1@baloise.com
- [ ] Voir la liste des leads
- [ ] Cliquer sur un lead affiche le panneau d'actions

## 🛠️ Dépannage

### ❌ "Port 3000 already in use"

Le port 3000 est déjà utilisé par une autre application.

**Solution :** Modifier le port dans `backend/.env` :
```
PORT=3001
```

### ❌ "Cannot connect to database"

PostgreSQL n'est pas en cours d'exécution.

**Solution :**
```bash
# Si vous utilisez Docker
docker-compose start postgres

# Si PostgreSQL est installé localement
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Windows
# Ouvrir Services et démarrer PostgreSQL
```

### ❌ "node_modules not found"

Les dépendances ne sont pas installées.

**Solution :**
```bash
cd backend && npm install
cd ../frontend && npm install
```

### ❌ Erreur : "P1000: Can't reach database server"

La chaîne `DATABASE_URL` est incorrecte.

**Solution :** Vérifier `backend/.env` :
```bash
# Avec Docker (par défaut)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/baloise_leads"

# Ou adapter à votre installation locale
DATABASE_URL="postgresql://user:password@localhost:5432/baloise_leads"
```

### ❌ Frontend ne se connecte pas au backend

CORS ou proxy n'est pas configuré correctement.

**Solution :** Vérifier `frontend/vite.config.ts` :
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

## 📚 Fichiers importants à connaître

| Fichier | Rôle |
|---------|------|
| `README.md` | Documentation générale |
| `SETUP.md` | Guide de setup détaillé |
| `backend/.env` | Variables d'environnement backend |
| `backend/prisma/schema.prisma` | Modèle de données |
| `frontend/src/App.tsx` | Composant racine frontend |

## 🚀 Prochaines étapes

### Développement
Consulter les docs :
- [SETUP.md](./SETUP.md) - Setup détaillé
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture du projet
- [API_WEBHOOK.md](./API_WEBHOOK.md) - Documentation des webhooks
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Roadmap de développement

### Déploiement
```bash
# Build pour la production
docker-compose -f docker-compose.prod.yml up -d
```

## 💡 Tips & Tricks

### Visualiser la base de données
```bash
cd backend
npx prisma studio
```
Ouvre une UI sur http://localhost:5555

### Tester un webhook
```bash
cd backend
npx ts-node src/utils/webhook-test.ts
```

### Nettoyer complètement
```bash
# Supprimer la BDD et la recréer
cd backend
npx prisma migrate reset

# Supprimer les dépendances
rm -rf node_modules
npm install
```

## ✉️ Besoin d'aide ?

- Lire les documentations : [README.md](./README.md)
- Vérifier les logs du terminal
- Consulter [SETUP.md](./SETUP.md) section Dépannage
- Vérifier que les ports 3000 et 5173 sont libres

## 🎉 Tout fonctionne ?

Bravo ! Vous êtes prêt à :

1. **Ajouter des fonctionnalités** → Voir [NEXT_STEPS.md](./NEXT_STEPS.md)
2. **Comprendre le projet** → Voir [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. **Intégrer des webhooks** → Voir [API_WEBHOOK.md](./API_WEBHOOK.md)
4. **Coder** → Explorer `backend/src` et `frontend/src`

Bonne chance ! 🚀
