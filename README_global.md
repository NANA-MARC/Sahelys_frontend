# SahelysAgents

SahelysAgents est la plateforme interne de SAHELYS permettant à chaque direction (RH, Finance, Commercial, IT, Juridique, Opérations, DG) de créer et de gérer ses propres agents IA conversationnels, alimentés par ses documents internes, sans avoir besoin d’écrire de code.

---

## 👥 Équipe et Répartition des Rôles

| Membre | Périmètre / Domaine d'intervention | Branche Git | Dossier principal |
| :--- | :--- | :--- | :--- |
| **Marc NANA** | Frontend | `frontend` | `frontend/` |
| **Fabiana YANOGO** | Données & RAG | `donnees` | `donnees/` |
| **Moussa KIENDREBEOGO** | Backend & IA | `backend`, `ia` | `backend/`, `ia/` |

---

## 🏗️ Structure du Projet

* **`main`** : Branche principale (version stable et livrable en production).
* **`develop`** : Branche d'intégration (centralise et teste les modules avant déploiement sur main).
* **`frontend`** : Branche isolée contenant uniquement le dossier `frontend/`.
* **`backend`** : Branche isolée contenant uniquement le dossier `backend/`.
* **`ia`** : Branche isolée contenant uniquement le dossier `ia/`.
* **`donnees`** : Branche isolée contenant uniquement le dossier `donnees/`.

```text
SahelysAgents/
├── frontend/        # (Marc NANA)
├── backend/         # (Moussa KIENDREBEOGO)
├── ia/              # (Moussa KIENDREBEOGO & Fabiana YANOGO)
├── donnees/         # (Fabiana YANOGO)
└── docs/            # Documentation technique du projet
```

---

## 🚀 Guide de Démarrage Rapide pour l'Équipe

### 1. Cloner le projet
Chaque membre commence par cloner le dépôt :
```bash
git clone https://github.com/MoussaKIENDREBEOGO/SahelysAgents.git
cd SahelysAgents
```

### 2. Basculer sur sa branche de travail

Chaque membre doit se positionner sur sa branche dédiée avant de coder :

- **Marc NANA (Frontend)** :
  ```bash
  git checkout frontend
  ```
- **Fabiana YANOGO (Données & RAG)** :
  ```bash
  git checkout donnees
  ```
- **Moussa KIENDREBEOGO (Backend & IA)** :
  ```bash
  git checkout backend
  # ou git checkout ia
  ```

### 3. Développer et publier ses modifications

Travaillez exclusivement dans le dossier de votre branche, puis publiez vos modifications :

```bash
# 1. Ajouter ses modifications
git add .

# 2. Créer un commit explicite
git commit -m "feat: description de ma fonctionnalité"

# 3. Pousser la branche sur GitHub
git push origin <votre-branche>
```

---

## 🛡️ Rôle de l'Administrateur

La branche `develop` sert de zone de recettes et de tests. La branche `main` centralise le code consolidé et stable de tous les modules. Seul l'**Administrateur** valide et fusionne les branches sur `develop` puis sur `main`.

> 💡 **Note sur le Workflow d'Intégration :**
> 1. Chaque développeur pousse son travail exclusivement sur sa propre branche (`frontend`, `donnees`, `backend`, `ia`).
> 2. L'Administrateur révisera et fusionnera les branches de travail vers **`develop`** pour tester l'ensemble du projet.
> 3. Après validation globale des tests sur **`develop`**, l'Administrateur fusionnera **`develop`** vers **`main`** (version finale en production).

```bash
# 1. Mettre à jour l'intégration sur develop
git checkout develop
git pull origin develop
git merge <branche-du-developpeur>
git push origin develop

# 2. Après validation des tests, fusionner sur main (production)
git checkout main
git pull origin main
git merge develop
git push origin main
```
