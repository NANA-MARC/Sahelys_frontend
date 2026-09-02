# PALETTE DE COULEURS SAHELYS (Alignée sur la plateforme officielle ADEN SAHELYS)

## Couleurs principales

- **Bleu Royal SAHELYS (Navigation / En-tête / Header)** : `#0052CC`
- **Texte titre & Noms de modules / agents** : `#0A1C33`
- **Bleu accent (Boutons principaux, cartes actives, icônes d'agents)** : Dégradé `#0052CC` vers `#1D72E8`

## Fond et surfaces

- **Fond de page** : `#EEF3F8` (Bleu-gris glacé très clair)
- **Cartes & Surfaces** : `#FFFFFF` (Blanc pur)
- **Bordures des cartes & conteneurs** : `#E1E7F0`
- **Fond des icônes/boutons circulaires secondaires** : `#E1EDFF` (icône en `#0052CC`)

## Texte

- **Texte principal** : `#0A1C33`
- **Texte secondaire / description** : `#5A6E85`

## Couleurs de statut (badges)

- **Vert (actif / publié / indexé / succès)** : `#00875A`, fond clair `#E3FCEF`
- **Orange (en cours / avertissement)** : `#FF8B00`, fond clair `#FFFAE6`
- **Rouge (erreur / désactivé / alerte)** : `#DE350B`, fond clair `#FFEBE6`
- **Gris (brouillon / inactif / en attente)** : `#6B778C`, fond clair `#F4F5F7`

## Configuration Tailwind / CSS Tokens :

```ts
colors: {
  navy: '#0052CC',
  'navy-dark': '#0A1C33',
  accent: {
    from: '#0052CC',
    to: '#1D72E8',
    DEFAULT: '#0052CC',
  },
  'page-bg': '#EEF3F8',
  'card-border': '#E1E7F0',
  'icon-bg': '#E1EDFF',
  'text-secondary': '#5A6E85',
  status: {
    success: '#00875A',
    'success-bg': '#E3FCEF',
    warning: '#FF8B00',
    'warning-bg': '#FFFAE6',
    error: '#DE350B',
    'error-bg': '#FFEBE6',
    neutral: '#6B778C',
    'neutral-bg': '#F4F5F7',
  },
}
```
