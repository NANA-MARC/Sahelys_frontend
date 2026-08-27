import type { Conversation } from '../../shared/models/conversation.model';

export const CONVERSATIONS_MOCK: Conversation[] = [
  {
    id: 'conv-rh-001',
    utilisateurId: 'user-001',
    agentId: 'agent-rh',
    titre: 'Congés et avantages sociaux',
    creeLe: '2026-08-18T09:15:00.000Z',
    misAJourLe: '2026-08-18T09:42:00.000Z',
    messages: [
      {
        id: 'msg-rh-001',
        conversationId: 'conv-rh-001',
        auteur: 'utilisateur',
        contenu:
          'Je voudrais savoir combien de jours de congés je peux prendre au cours de l’année.',
        creeLe: '2026-08-18T09:15:00.000Z',
      },
      {
        id: 'msg-rh-002',
        conversationId: 'conv-rh-001',
        auteur: 'agent',
        contenu:
          'Selon la politique RH, vous avez droit à 25 jours ouvrés de congés payés par an, à condition de respecter la période de demande prévue par votre direction.',
        creeLe: '2026-08-18T09:17:00.000Z',
        sources: {
          passages: [
            {
              texte:
                'Le salarié bénéficie de 25 jours ouvrés de congés payés annuels, selon la période de demande et les règles de service.',
              document: 'Politique_Conges_2026.pdf',
              reference: 'Article 4.2 - Congés annuels',
              score: 0.97,
            },
            {
              texte:
                'Les demandes de congés doivent être déposées avant la période de planification fixée par la direction.',
              document: 'Guide_Avantages_Sociaux.docx',
              reference: 'Section planification des congés',
              score: 0.91,
            },
          ],
        },
      },
      {
        id: 'msg-rh-003',
        conversationId: 'conv-rh-001',
        auteur: 'utilisateur',
        contenu: 'Et pour le remboursement des frais de transport ?',
        creeLe: '2026-08-18T09:20:00.000Z',
      },
      {
        id: 'msg-rh-004',
        conversationId: 'conv-rh-001',
        auteur: 'agent',
        contenu:
          'Le remboursement des frais de transport est pris en charge selon les montants plafonnés et les justificatifs fournis. Le plan de remboursement est défini dans le guide des avantages sociaux.',
        creeLe: '2026-08-18T09:22:00.000Z',
        sources: {
          passages: [
            {
              texte:
                'Les frais de transport sont remboursés selon les plafonds applicables et la présentation des justificatifs.',
              document: 'Guide_Avantages_Sociaux.docx',
              reference: 'Chapitre 3 - Remboursement transport',
              score: 0.94,
            },
            {
              texte:
                'Le remboursement est soumis au respect des règles internes en vigueur pour les déplacements professionnels.',
              document: 'Code_Ethique_v3.pdf',
              reference: 'Section conformité et obligations',
              score: 0.82,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'conv-it-001',
    utilisateurId: 'user-003',
    agentId: 'agent-it',
    titre: 'Accès VPN et outils internes',
    creeLe: '2026-08-19T10:30:00.000Z',
    misAJourLe: '2026-08-19T10:58:00.000Z',
    messages: [
      {
        id: 'msg-it-001',
        conversationId: 'conv-it-001',
        auteur: 'utilisateur',
        contenu:
          'Je n’arrive pas à me connecter au VPN depuis mon ordinateur portable, que dois-je vérifier ?',
        creeLe: '2026-08-19T10:30:00.000Z',
      },
      {
        id: 'msg-it-002',
        conversationId: 'conv-it-001',
        auteur: 'agent',
        contenu:
          'Commencez par vérifier que votre certificat de sécurité est bien installé, que votre logiciel VPN est à jour et que les identifiants sont valides pour votre profil.',
        creeLe: '2026-08-19T10:33:00.000Z',
        sources: {
          passages: [
            {
              texte:
                'Le VPN interne exige un certificat utilisateur valide et la dernière version du client autorisé.',
              document: 'Procedure_VPN_Interne.pdf',
              reference: 'Etape 1 - Vérification du certificat',
              score: 0.95,
            },
            {
              texte:
                'Les identifiants doivent correspondre au profil d’accès attribué par le service informatique.',
              document: 'Guide_Acces_Utilisateurs.pdf',
              reference: 'Chapitre 2 - comptes et accès',
              score: 0.9,
            },
          ],
        },
      },
      {
        id: 'msg-it-003',
        conversationId: 'conv-it-001',
        auteur: 'utilisateur',
        contenu: 'Je viens d’installer le client, mais le service reste indisponible.',
        creeLe: '2026-08-19T10:41:00.000Z',
      },
      {
        id: 'msg-it-004',
        conversationId: 'conv-it-001',
        auteur: 'agent',
        contenu:
          'Dans ce cas, vérifiez si votre accès réseau est autorisé en dehors du bureau, puis relancez l’authentification avec votre mot de passe principal. Si le problème persiste, ouvrez un ticket support IT.',
        creeLe: '2026-08-19T10:46:00.000Z',
        sources: {
          passages: [
            {
              texte:
                'Les connexions VPN depuis un réseau externe sont autorisées uniquement après validation du profil de sécurité et des règles d’accès.',
              document: 'Guide_Acces_Utilisateurs.pdf',
              reference: 'Section accès distant',
              score: 0.93,
            },
            {
              texte:
                'Les incidents de connexion doivent être signalés via le canal support dédié à l’assistance informatique.',
              document: 'Procedure_Support_IT.pdf',
              reference: 'Fiche incident - accès distant',
              score: 0.88,
            },
          ],
        },
      },
    ],
  },
];
