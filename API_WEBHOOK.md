# Documentation - Intégration API Externe & Webhooks

## Webhooks entrants

L'application peut recevoir des leads depuis des systèmes externes via des webhooks.

### Endpoint

```
POST /api/webhook/leads
```

### Sécurité

Les webhooks sont validés avec une signature HMAC SHA256.

**Headers requis :**
```
Content-Type: application/json
x-webhook-signature: <signature_hmac>
```

### Calcul de la signature

```typescript
import crypto from 'crypto'

const payload = { ... }
const secret = process.env.WEBHOOK_SECRET
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex')
```

### Payload

```json
{
  "externalId": "ext_12345",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@email.com",
  "phone": "+33612345678",
  "product": "DRIVE|HOME|PENSION_PLAN",
  "agentEmail": "agent1@baloise.com"
}
```

### Champs

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| externalId | string | ✅ | ID unique du lead dans le système externe |
| firstName | string | ✅ | Prénom du client |
| lastName | string | ✅ | Nom du client |
| email | string | ❌ | Email du client |
| phone | string | ❌ | Téléphone du client |
| product | enum | ✅ | Produit d'intérêt |
| agentEmail | string | ✅ | Email de l'agent destinataire |

### Réponses

#### Succès (201)

```json
{
  "id": "uuid",
  "externalId": "ext_12345",
  "firstName": "Jean",
  "lastName": "Dupont",
  "status": "NEW",
  "source": "API_EXTERNAL",
  "createdAt": "2024-03-21T10:30:00Z"
}
```

#### Erreur - Signature invalide (401)

```json
{
  "error": "Invalid signature"
}
```

#### Erreur - Champs manquants (400)

```json
{
  "error": "Missing required fields"
}
```

#### Erreur - Agent introuvable (404)

```json
{
  "error": "Agent not found"
}
```

## Exemple d'intégration

### Exemple 1 : Webhook depuis un formulaire externe

```bash
#!/bin/bash

# Données du webhook
PAYLOAD='{
  "externalId": "form_2024_001",
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie@example.com",
  "phone": "+33612345678",
  "product": "HOME",
  "agentEmail": "agent1@baloise.com"
}'

# Générer la signature
SECRET="your-webhook-secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $NF}')

# Envoyer le webhook
curl -X POST http://localhost:3000/api/webhook/leads \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Exemple 2 : JavaScript/Node.js

```typescript
import crypto from 'crypto'
import fetch from 'node-fetch'

const payload = {
  externalId: 'api_2024_001',
  firstName: 'Sophie',
  lastName: 'Leclerc',
  email: 'sophie@example.com',
  phone: '+33698765432',
  product: 'PENSION_PLAN',
  agentEmail: 'agent2@baloise.com',
}

const secret = 'your-webhook-secret'
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex')

const response = await fetch('http://localhost:3000/api/webhook/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-webhook-signature': signature,
  },
  body: JSON.stringify(payload),
})

const result = await response.json()
console.log(result)
```

### Exemple 3 : Python

```python
import json
import hmac
import hashlib
import requests

payload = {
    'externalId': 'py_2024_001',
    'firstName': 'Pierre',
    'lastName': 'Bernard',
    'email': 'pierre@example.com',
    'phone': '+33612345678',
    'product': 'DRIVE',
    'agentEmail': 'agent1@baloise.com',
}

secret = 'your-webhook-secret'
payload_json = json.dumps(payload)
signature = hmac.new(
    secret.encode(),
    payload_json.encode(),
    hashlib.sha256
).hexdigest()

response = requests.post(
    'http://localhost:3000/api/webhook/leads',
    json=payload,
    headers={
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
    }
)

print(response.json())
```

## Cycle de vie d'un lead

### Via formulaire manuel (Frontend)

```
Agent crée lead → Statut: NEW → Actions possibles
```

### Via webhook externe (API)

```
Système externe envoie webhook → Lead créé avec statut: NEW → Agent voit dans la liste
```

### Transitions de statut

```
NEW
├─→ IN_PROGRESS (l'agent commence à traiter)
├─→ TO_CONTACT (rappel planifié)
│   └─→ QUOTED (devis créé)
│       └─→ CONVERTED (client acquis)
└─→ REFUSED (client refusé)
```

## Retry policy

Les webhooks échouent automatiquement s'ils reçoivent une réponse non-2xx. Le système appelant doit implémenter les retries :

- Recommandé : 3 tentatives avec délai exponentiel (1s, 5s, 30s)
- Sur succès (2xx) : arrêter les retries
- Sur erreur 4xx : ne pas retrier (configuration requise)
- Sur erreur 5xx : retrier

## Monitoring

Pour monitorer les webhooks reçus :

```typescript
// Dans src/routes/webhook.ts, ajouter du logging :
console.log(`[${new Date().toISOString()}] Webhook reçu:`, {
  externalId: req.body.externalId,
  agentEmail: req.body.agentEmail,
  status: 'processing',
})
```

## Déploiement

Avant de passer en production :

1. **Changer le secret webhook** : Modifier `WEBHOOK_SECRET` en .env
2. **Mettre à jour l'URL** : Pointer sur l'URL de production
3. **Tester les signatures** : Valider qu'elles sont correctement calculées
4. **Monitorer les erreurs** : Ajouter un logging/alerting
5. **Configurer les retries** : Côté système externe

## Support

Pour tester les webhooks en développement, utiliser l'utilitaire fourni :

```bash
cd backend
npx ts-node src/utils/webhook-test.ts
```

Ou utiliser Postman/Thunder Client avec la signature générée.
