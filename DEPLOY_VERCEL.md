# 🚀 Guide de déploiement Vercel

Déployer votre plateforme Baloise Leads sur le web en **5 minutes**.

## Prérequis

- ✅ Un compte [Vercel](https://vercel.com) (gratuit)
- ✅ Un compte [Supabase](https://supabase.com) (gratuit PostgreSQL)
- ✅ Un domaine personnalisé (optionnel, Vercel fournit un domaine gratuit)
- ✅ Le code pushé sur GitHub/GitLab/Bitbucket

## 1️⃣ Créer la base de données (Supabase)

### Étape 1: Créer un projet Supabase

1. Aller à https://supabase.com
2. Cliquer **"Create a new project"**
3. Remplir :
   - **Name** : `baloise-leads`
   - **Database Password** : Générer un mot de passe fort
   - **Region** : Choisir Europe (ex: `eu-west-1`)
4. Cliquer **"Create new project"** (⏳ ~2 min)

### Étape 2: Récupérer la DATABASE_URL

1. Dans le projet, aller à **Settings** → **Database**
2. Copier la connection string (onglet "URI"):
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```
3. Changer `postgres` (avant `:`) en `postgres`
4. Changer le dernier `postgres` (après `/`) en `baloise_leads`
5. Résultat :
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/baloise_leads
   ```

### Étape 3: Créer les tables

1. Aller à **SQL Editor** dans Supabase
2. Créer une nouvelle query avec ce script :
   ```sql
   -- À exécuter depuis Supabase SQL Editor
   CREATE TYPE lead_status AS ENUM ('NEW', 'IN_PROGRESS', 'TO_CONTACT', 'QUOTED', 'REFUSED', 'CONVERTED');
   CREATE TYPE product_type AS ENUM ('DRIVE', 'HOME', 'PENSION_PLAN');
   CREATE TYPE refusal_reason AS ENUM ('NO_ASSET', 'PRICE_TOO_HIGH', 'ALREADY_INSURED', 'OTHER');
   CREATE TYPE lead_source AS ENUM ('MANUAL', 'API_EXTERNAL');
   CREATE TYPE action_type AS ENUM ('REFUSED', 'QUOTE_CREATED', 'CALLBACK_SCHEDULED', 'NOTE_ADDED');
   ```
3. Cliquer **"Run"**

> **Note** : Les tables seront créées automatiquement via Prisma à la première visite

---

## 2️⃣ Configurer Vercel

### Étape 1: Connecter le repo

1. Aller à https://vercel.com/new
2. **Sélectionner votre repository** (GitHub/GitLab/Bitbucket)
3. Cliquer **"Import"**

### Étape 2: Configurer les variables d'environnement

Dans **Environment Variables**, ajouter :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | La connection string de Supabase (Étape 1.2) |
| `JWT_SECRET` | Générer une clé aléatoire : `openssl rand -base64 32` |
| `WEBHOOK_SECRET` | Générer une clé aléatoire : `openssl rand -base64 32` |

**Exemple de DATABASE_URL** :
```
postgresql://postgres:MyP@ssw0rd@db.supabase.co:5432/baloise_leads
```

### Étape 3: Déployer

1. Cliquer **"Deploy"**
2. Attendre le déploiement (~2 min)
3. ✅ Votre app est en ligne !

---

## 3️⃣ Initialiser la base de données

Après le premier déploiement, créer les tables Prisma :

### Option A : Via Vercel CLI (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Aller dans le dossier du projet
cd /Users/ayrton/Documents/Travail/Suivi\ des\ leads

# Exécuter une migration
vercel env pull
npx prisma db push
npx prisma db seed
```

### Option B : Via SSH/Console

1. Dans Vercel, aller à **Deployments** → cliquer sur un déploiement
2. Onglet **Functions** → exécuter un script de setup (à implémenter)

---

## 4️⃣ Configurer un domaine personnalisé (optionnel)

### Sans domaine personnalisé
Votre app est accessible via : `baloise-leads-xxx.vercel.app`

### Avec domaine personnalisé (ex: `baloise-leads.com`)

1. Acheter le domaine sur un registrar (Godaddy, Namecheap, etc.)
2. Dans Vercel → Project → **Settings** → **Domains**
3. Ajouter le domaine
4. Copier les DNS records fournis par Vercel
5. Aller chez votre registrar et ajouter les DNS records
6. Attendre la propagation (5-30 min)
7. ✅ Domaine configuré !

**Exemple de configuration Namecheap :**
```
Type: CNAME
Name: baloise-leads.com
Value: cname.vercel-dns.com
```

---

## 5️⃣ Tester l'application

1. Aller à votre URL Vercel
2. S'inscrire avec un email
3. Créer un lead
4. Tester les actions

✅ **Tout fonctionne ?** Bravo ! 🎉

---

## ⚙️ Configuration post-déploiement

### Ajouter des utilisateurs

Actuellement, n'importe qui peut s'inscrire. Pour limiter :

**Option 1 : Whitelist d'emails (à implémenter)**
```typescript
// app/api/auth/register/route.ts
const allowedEmails = ['agent1@baloise.com', 'agent2@baloise.com']
if (!allowedEmails.includes(email)) {
  return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
}
```

**Option 2 : SSO Baloise (avancé)**
Intégrer OAuth 2.0 via Clerk ou Auth0

---

## 🔒 Variables d'environnement en production

Après déploiement :

1. Aller à **Settings** → **Environment Variables**
2. Changer les secrets :
   - `JWT_SECRET` : Nouvelle clé secrète
   - `WEBHOOK_SECRET` : Nouveau secret webhook
3. Redéployer

---

## 🛠️ Redéployer après des modifications

Une fois en place, le déploiement est **automatique** :

```bash
# Pushé sur GitHub
git push origin main

# ✅ Vercel redéploie automatiquement
```

Ou déclencher un redéploiement manuel dans Vercel Dashboard.

---

## 📊 Monitoring

### Logs en production
- Vercel Dashboard → **Deployments** → voir les logs
- Erreurs JavaScript côté client → Console du navigateur

### Optimisations
- Images : Vercel optimise automatiquement
- CSS : Tailwind CSS est purgé en production
- Code : Next.js minifie et optimise

---

## 🆘 Dépannage

### ❌ "DATABASE_URL is not set"
```bash
# Vérifier que la variable est définie
vercel env ls

# Redéployer
vercel redeploy
```

### ❌ "Connection refused"
- Vérifier la DATABASE_URL
- Vérifier que Supabase est accessible (status.supabase.com)

### ❌ "Prisma migration failed"
```bash
# Réinitialiser la base (⚠️ supprime les données)
npx prisma migrate reset
npx prisma db push
```

### ❌ "Domain not working"
- Attendre 15-30 min pour la propagation DNS
- Vérifier les records DNS via `nslookup`

---

## 📈 Prochaines étapes

Votre app est en production ! 🚀

- [ ] Ajouter un monitoring (Sentry)
- [ ] Configurer les emails de rappel
- [ ] Intégrer SSO Baloise
- [ ] Ajouter des analytics
- [ ] Configurer un CDN

---

## 💡 Tips

- **Build preview** : Vercel crée une preview à chaque PR
- **Rollback** : Cliquer sur un ancien déploiement pour revenir
- **Custom domain** : Configurable en 5 min
- **Scalabilité** : Vercel gère automatiquement la charge

---

## Résumé des coûts (Mars 2026)

| Service | Plan | Prix |
|---------|------|------|
| **Vercel** | Pro | $20/mois |
| **Supabase** | Pro | $25/mois |
| **Domaine** | .com | $10/an |
| **Total** | - | **~$45/mois** |

> Les plans gratuits suffisent pour commencer !

---

Besoin d'aide ? Consulter :
- [Docs Vercel](https://vercel.com/docs)
- [Docs Supabase](https://supabase.com/docs)
- [Docs Next.js](https://nextjs.org/docs)
