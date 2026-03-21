# ⚡ Quickstart - Déployer en 5 minutes

Vous êtes pressé ? Suivez exactement ces étapes.

## 🎯 Objectif final

Votre app en ligne à une URL comme :
- `baloise-leads-abc123.vercel.app` (gratuit)
- Ou votre domaine custom: `baloise-leads.com`

## ⏱️ Timeline

- **Étape 1** : 2 min (Supabase DB)
- **Étape 2** : 1 min (GitHub)
- **Étape 3** : 1 min (Vercel)
- **Étape 4** : 1 min (Variables d'env)
- **TOTAL** : ⏱️ **5 minutes**

---

## 1️⃣ Créer la base de données Supabase (2 min)

### Aller à https://supabase.com

1. Cliquer **"Start your project"** (bouton bleu)
2. Se connecter avec GitHub ou email
3. Cliquer **"New project"**

### Remplir le formulaire

```
Project name: baloise-leads
Database password: [Générer un mot de passe fort]
Region: Europe (eu-west-1)
```

4. Cliquer **"Create new project"**
5. ⏳ Attendre 1-2 min

### Copier la CONNECTION STRING

Quand terminé :

1. Aller à **Settings** (⚙️) → **Database**
2. Voir la section **"Connection string"**
3. Copier l'URI (la chaîne qui commence par `postgresql://`)
4. La garder de côté pour l'étape 4

**Ressemble à :**
```
postgresql://postgres:YourP@ssw0rd@db.supabase.co:5432/postgres
```

> 💾 **Sauvegarder cette URL quelque part**

---

## 2️⃣ Pousser le code sur GitHub (1 min)

### Créer un repo GitHub

1. Aller à https://github.com/new
2. **Repository name** : `baloise-leads`
3. **Description** : (optionnel)
4. **Public** : ✅ (cocher)
5. Cliquer **"Create repository"**

### Pousser le code

```bash
# Depuis le dossier baloise-leads
cd ~/Documents/Travail/Suivi\ des\ leads

# Initialiser git
git init
git add .
git commit -m "Initial commit: Baloise Leads platform"

# Ajouter remote (remplacer USERNAME)
git remote add origin https://github.com/USERNAME/baloise-leads.git

# Pousser
git branch -M main
git push -u origin main
```

> Si vous avez des problèmes git, configurer :
> ```bash
> git config --global user.email "votre@email.com"
> git config --global user.name "Votre Nom"
> ```

---

## 3️⃣ Déployer sur Vercel (1 min)

### Aller à https://vercel.com/new

1. **Sélectionner le repo** : `baloise-leads`
2. Cliquer **"Import"**
3. Garder les paramètres par défaut
4. Cliquer **"Deploy"** (le bouton bleu)

> ⏳ Attendre 1-2 min pour le déploiement initial

---

## 4️⃣ Configurer les variables d'environnement (1 min)

### Vercel → Project Settings

1. Aller à https://vercel.com/dashboard
2. Cliquer sur le projet `baloise-leads`
3. Aller à **Settings** (en haut)
4. Aller à **Environment Variables** (menu gauche)

### Ajouter les variables

Ajouter 3 variables d'environnement :

**Variable 1 : DATABASE_URL**
- **Name** : `DATABASE_URL`
- **Value** : [Coller la connection string de Supabase]
- **Environments** : Cocher "Production"
- Cliquer **"Save"**

**Variable 2 : JWT_SECRET**
- **Name** : `JWT_SECRET`
- **Value** : Générer une clé aléatoire :
  ```bash
  # Dans terminal
  openssl rand -base64 32
  # Copier le résultat
  ```
- **Environments** : Cocher "Production"
- Cliquer **"Save"**

**Variable 3 : WEBHOOK_SECRET**
- **Name** : `WEBHOOK_SECRET`
- **Value** : Générer une clé aléatoire (openssl rand -base64 32)
- **Environments** : Cocher "Production"
- Cliquer **"Save"**

### Redéployer

1. Aller à **Deployments** (Vercel)
2. Cliquer sur le dernier déploiement
3. Cliquer **"Redeploy"** (rechargera les variables d'env)

> ⏳ Attendre 1 min

---

## 5️⃣ Tester l'app 🎉

### Ouvrir l'URL Vercel

1. Dans **Vercel Deployments**, copier l'URL du déploiement
   - Ressemble à : `https://baloise-leads-abc123.vercel.app`
2. Ouvrir dans le navigateur

### Essayer l'app

1. Cliquer **"Créer un compte"** (onglet "Pas encore inscrit ?")
2. Remplir :
   - Nom: `Test User`
   - Email: `test@example.com`
   - Mot de passe: `Test123!`
3. Cliquer **"Créer un compte"**
4. ✅ Vous devez voir la page des leads vide
5. Cliquer **"+ Ajouter un lead"**
6. Ajouter un lead de test
7. ✅ Le lead doit apparaître dans la liste

**Si vous voyez le lead → TOUT FONCTIONNE ! 🎊**

---

## 6️⃣ Domaine personnalisé (optionnel)

### Sans domaine personnalisé
L'app est accessible via : `baloise-leads-xxx.vercel.app` ✅

### Avec domaine custom (ex: baloise-leads.com)

1. Acheter le domaine sur : [Namecheap](https://www.namecheap.com) ou [GoDaddy](https://www.godaddy.com)
2. Vercel → **Settings** → **Domains**
3. Ajouter le domaine
4. Vercel fournira des DNS records
5. Aller chez le registrar (Namecheap) et ajouter les DNS records
6. Attendre 5-30 min pour la propagation
7. ✅ Domaine actif !

---

## ✨ C'est tout !

Votre plateforme est maintenant en ligne ! 🚀

### Prochaines actions

- [ ] **Ajouter des utilisateurs** : Partager l'URL avec les agents Baloise
- [ ] **Ajouter un domaine custom** : (optionnel)
- [ ] **Intégrer des webhooks** : Si vous avez un système externe CRM
- [ ] **Consulter DEPLOY_VERCEL.md** : Pour plus de détails

---

## 🆘 Dépannage rapide

### "DATABASE_URL is not set"
- [ ] Vérifier que DATABASE_URL est bien ajoutée dans Vercel Settings
- [ ] Cliquer "Redeploy" dans Vercel
- [ ] Attendre le redéploiement

### "Connection refused"
- [ ] Vérifier que la DATABASE_URL est correcte (copier/coller depuis Supabase)
- [ ] Vérifier qu'il n'y a pas d'espaces au début/fin

### "Page blanche"
- [ ] Ouvrir Console du navigateur (F12)
- [ ] Regarder les erreurs
- [ ] Vérifier que l'URL est correcte

### Besoin d'aide ?
👉 Lire [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) pour plus de détails

---

## 📊 Résumé

```
✅ Supabase Database         (2 min)
✅ GitHub Repository         (1 min)
✅ Vercel Deployment         (1 min)
✅ Environment Variables     (1 min)
────────────────────────────────────
   TOTAL TIME: 5 minutes ⏱️

🎉 YOUR APP IS LIVE! 🎉
```

**URL en ligne** :
```
https://baloise-leads-xxx.vercel.app
```

ou

```
https://votre-domaine.com
```

---

## 📞 Support

- Documentation: [README.md](./README.md)
- Déploiement détaillé: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Webhooks: [API_WEBHOOK.md](./API_WEBHOOK.md)

**Amusez-vous bien ! 🚀**
