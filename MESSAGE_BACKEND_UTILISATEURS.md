# Messages séparés pour l'équipe backend

## MESSAGE 1 - Suppression utilisateur

**À envoyer à : l'équipe backend**

Bonjour l'équipe backend,

Le frontend est prêt à supprimer un utilisateur, mais j'ai besoin de vérifier que l'endpoint suivant est bien disponible dans la version du backend actuellement déployée :

```http
DELETE /admin/system/users/{user_id}
```

La route doit vérifier les permissions administrateur, supprimer l'utilisateur uniquement après confirmation de la base de données et retourner une réponse de succès adaptée, par exemple `204 No Content`.

Merci de retourner une erreur claire si l'utilisateur n'existe pas, si l'identifiant est invalide ou si l'administrateur n'est pas autorisé.

## MESSAGE 2 - Blocage et déblocage utilisateur

**À envoyer à : l'équipe backend**

Bonjour l'équipe backend,

Le frontend est prêt à gérer le blocage et le déblocage des utilisateurs, mais cette fonctionnalité doit être disponible et persistante dans l'API backend.

La route attendue est :

```http
PATCH /admin/system/users/{user_id}/status
```

Pour bloquer un utilisateur :

```json
{
  "actif": false
}
```

Pour débloquer un utilisateur :

```json
{
  "actif": true
}
```

La route doit être accessible uniquement à un administrateur et retourner l'utilisateur mis à jour avec son statut `actif`.

Merci de retourner une erreur claire pour les cas `401`, `403`, `404`, `422` et `500`.

Le statut doit être conservé après actualisation de la page.

## MESSAGE 3 - Erreur actuellement constatée

**À envoyer à : l'équipe backend**

Bonjour l'équipe backend,

Le frontend appelle bien la route suivante pour bloquer ou débloquer un utilisateur :

```http
PATCH /admin/system/users/{user_id}/status
```

Cependant, l'API accessible à l'adresse `http://192.168.11.190:8000` retourne actuellement une erreur `404 Not Found` sur cette route.

Merci de vérifier que l'endpoint est bien présent dans la version déployée du backend et de redémarrer ou redéployer le backend afin qu'il soit accessible.

La route doit accepter `actif: true` pour le déblocage, `actif: false` pour le blocage, et retourner l'utilisateur mis à jour.

Le frontend est déjà configuré pour utiliser cette route. Le problème actuel semble donc venir de la version du backend accessible sur le serveur.

## MESSAGE 5 - Connexion d'un compte bloqué

**À envoyer à : l'équipe backend**

Bonjour l'équipe backend,

Lorsqu'un utilisateur bloqué essaie de se connecter, le frontend reçoit maintenant la réponse suivante :

```http
POST /auth/login -> 403 Forbidden
```

Le refus de connexion est bien appliqué, mais le frontend reçoit actuellement un message trop général :

`Identifiants incorrects ou serveur indisponible.`

Merci de vérifier que la réponse `403` contient un message explicite permettant d'identifier la cause du refus, par exemple :

```json
{
  "detail": "Ce compte est bloqué."
}
```

Le frontend pourra alors afficher clairement à l'utilisateur que son compte est bloqué et qu'il doit contacter l'administrateur.

## MESSAGE 4 - Règle de blocage des administrateurs

**À envoyer à : l'équipe backend**

Bonjour l'équipe backend,

Lorsque j'essaie de bloquer un compte administrateur depuis le frontend, l'API retourne actuellement une erreur `400 Bad Request`.

La règle métier attendue est qu'un compte administrateur ne puisse pas être bloqué, notamment l'administrateur connecté ou l'administrateur principal.

Merci de conserver cette protection côté backend et de retourner un message explicite dans la réponse, par exemple :

```json
{
  "detail": "Un compte administrateur ne peut pas être bloqué."
}
```

Le frontend conservera alors le statut actuel du compte et affichera le message d'erreur retourné par l'API.
