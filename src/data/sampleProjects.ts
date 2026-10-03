import { ProjectAnalysis, ProjectDocument } from '../types/project';

export const SAMPLE_DOCUMENTS_NOVA: ProjectDocument[] = [
  // 01 Courriels
  {
    id: 'E01',
    name: 'E01_Lancement_NOVA.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-07-02',
    author: 'Jean-Marc Dubois (Directeur TI)',
    summary: 'Coup d\'envoi officiel du projet NOVA. Présentation des objectifs, budget initial de 380 000 $ et cible de livraison au 15 novembre 2026.',
    content: `De: Jean-Marc Dubois <jm.dubois@entreprise.ca>
À: Équipe Projet NOVA <equipe-nova@entreprise.ca>, Boréal Technologies <contact@borealtech.ca>
Date: 02 juillet 2026 09:15
Objet: Lancement officiel du projet NOVA - Plateforme Client 360

Bonjour à tous,
C'est avec grand plaisir que nous lançons officiellement le projet NOVA aujourd'hui.
Ce projet stratégique vise à unifier nos portails clients et à moderniser la gestion de nos comptes.

Rappels clés :
- Budget global approuvé : 380 000 $ CAD
- Date cible de livraison MVP : 15 novembre 2026
- Prestataire principal : Boréal Technologies (Équipe de dev et architecture)
- Chargée de projet interne : Élodie Tremblay
- Responsable architecture : Martin Vallières

Merci de consulter la charte de projet jointe.
Cordialement,
Jean-Marc Dubois`,
    tags: ['Lancement', 'Budget', 'Planning', 'Gouvernance'],
    fileType: 'eml',
    relevanceStatus: 'superseded'
  },
  {
    id: 'E02',
    name: 'E02_Question_hebergement.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-07-14',
    author: 'Sophie Lavoie (Juridique & Conformité)',
    summary: 'Alerte juridique : exigence stricte de souveraineté des données en sol canadien (Loi 25 / PIPEDA).',
    content: `De: Sophie Lavoie <s.lavoie@entreprise.ca>
À: Élodie Tremblay <e.tremblay@entreprise.ca>, Martin Vallières <m.vallieres@entreprise.ca>
Date: 14 juillet 2026 14:22
Objet: RE: Choix de l'infrastructure infonuagique et conformité données

Bonjour Élodie et Martin,
J'ai révisé l'ébauche d'architecture transmise par Boréal.
ATTENTION : Tous les registres clients et données nominatives DOIVENT résider exclusivement sur des centres de données situés en territoire canadien (région Canada Central - Montréal ou Toronto). Aucun hébergement aux États-Unis (US-East) n'est toléré selon nos politiques de conformité Loi 25.

Veuillez valider que les configurations cloud respectent formellement cette directive.
Sophie Lavoie - Direction des affaires juridiques`,
    tags: ['Conformité', 'Loi 25', 'Hébergement', 'Sécurité'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },
  {
    id: 'E03',
    name: 'E03_Confirmation_Canada_Central.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-07-25',
    author: 'Alexandre Gagné (Boréal Lead Cloud)',
    summary: 'Confirmation de la configuration des clusters Kubernetes et bases de données en région Canada Central (Montréal).',
    content: `De: Alexandre Gagné <a.gagne@borealtech.ca>
À: Martin Vallières <m.vallieres@entreprise.ca>, Élodie Tremblay <e.tremblay@entreprise.ca>
Date: 25 juillet 2026 11:05
Objet: Confirmation formelle - Provisionnement Région Canada Central

Bonjour Martin,
Suite à l'ADR-007, nous confirmons que l'ensemble des environnements (DEV, STAGING, PROD) ont été provisionnés dans la région Canada Central (Montréal).
Les snapshots de bases de données et les buckets S3 sont également géo-restreints au Canada.

Alexandre Gagné - Architecte Cloud, Boréal`,
    tags: ['Architecture', 'Hébergement', 'ADR-007'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },
  {
    id: 'E04',
    name: 'E04_Corrections_accessibilite.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-08-12',
    author: 'Karine Bélanger (Auditrice UX/Accessibilité)',
    summary: 'Rapport d\'audit d\'accessibilité : 3 anomalies majeures WCAG 2.1 AA relevées sur les formulaires.',
    content: `De: Karine Bélanger <k.belanger@access-web.ca>
À: Élodie Tremblay <e.tremblay@entreprise.ca>
Date: 12 août 2026 16:40
Objet: Audit accessibilité préliminaire - Tickets ACC-301 à ACC-303

Bonjour Élodie,
L'audit du portail NOVA révèle des non-conformités bloquantes au niveau du standard SGQRI 008 (WCAG 2.1 niveau AA) :
1. ACC-301: Absence d'étiquettes aria-label sur les sélecteurs de documents.
2. ACC-302: Contraste insuffisant (ratio 3.1:1 sur les boutons secondaires au lieu de 4.5:1).
3. ACC-303: Piège au clavier dans la modale d'authentification à deux facteurs.

Une correction prioritaire est requise avant la phase d'acceptation utilisateur.`,
    tags: ['Accessibilité', 'WCAG', 'Audit', 'UX'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },
  {
    id: 'E05',
    name: 'E05_Retard_integration.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-08-28',
    author: 'Élodie Tremblay (Chargée de projet)',
    summary: 'Alerte sur le connecteur API CRM tiers : erreurs d\'authentification et décalage de 10 jours ouvrés.',
    content: `De: Élodie Tremblay <e.tremblay@entreprise.ca>
À: Jean-Marc Dubois <jm.dubois@entreprise.ca>, Stéphane Côté (Boréal) <s.cote@borealtech.ca>
Date: 28 août 2026 08:30
Objet: Blocage technique - Connecteur API CRM (Ticket INT-101)

Jean-Marc, Stéphane,
Le connecteur avec l'ancien système CRM échoue lors de la synchronisation des clients inactifs (HTTP 401 après 60 minutes dû au renouvellement du token JWT).
Ce blocage retarde les tests d'intégration de 10 jours ouvrés.
Une cellule de crise est convoquée cet après-midi.`,
    tags: ['Retard', 'API', 'Intégration', 'Risque'],
    fileType: 'eml',
    relevanceStatus: 'superseded'
  },
  {
    id: 'E06',
    name: 'E06_Transition_charge_projet.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-09-14',
    author: 'Jean-Marc Dubois (Directeur TI)',
    summary: 'Annonce du départ d\'Élodie Tremblay et passation de la gestion de projet à Mathieu Gagnon.',
    content: `De: Jean-Marc Dubois <jm.dubois@entreprise.ca>
À: Tout le personnel Projet NOVA <equipe-nova@entreprise.ca>
Date: 14 septembre 2026 10:00
Objet: Transition de gestion de projet - Bienvenue à Mathieu Gagnon

Chers collègues,
Élodie Tremblay quittera l'organisation le 18 septembre prochain pour relever un nouveau défi professionnel. Nous la remercions chaleureusement pour son dévouement.
Mathieu Gagnon assurera la direction du projet NOVA dès le 16 septembre. Une période de transition de 3 jours est prévue pour le transfert des dossiers.`,
    tags: ['Gouvernance', 'Équipe', 'Transition'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },
  {
    id: 'E07',
    name: 'E07_Facture_003_question.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-09-22',
    author: 'Mathieu Gagnon (Nouveau Chargé de projet)',
    summary: 'Contestation de la facture INV-003 : ajout de 14 500 $ pour la fonction mobile sans avenant CR-04 signé.',
    content: `De: Mathieu Gagnon <m.gagnon@entreprise.ca>
À: Stéphane Côté <s.cote@borealtech.ca>, Service Comptabilité <compta@entreprise.ca>
Date: 22 septembre 2026 15:10
Objet: RE: Facture Boréal INV-003 - Écart de facturation (CR-04)

Bonjour Stéphane,
En examinant la facture INV-003 d'un montant de 68 500 $, je constate une ligne de 14 500 $ intitulée "Optimisation responsive avancée / Module Mobile".
Or, après vérification de nos archives, la demande de changement CR-04 est toujours à l'état de BROUILLON et n'a jamais été approuvée par le comité de direction.
Nous gelons le paiement de cette tranche de 14 500 $ en attendant clarification au prochain comité.`,
    tags: ['Finance', 'Facture', 'Contradiction', 'CR-04', 'Litige'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },
  {
    id: 'E08',
    name: 'E08_Correctif_journalisation.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-09-24',
    author: 'Nicolas Roy (Boréal Sécurité)',
    summary: 'Déploiement du patch SEC-210 pour masquer les numéros de carte de crédit dans les logs applicatifs.',
    content: `De: Nicolas Roy <n.roy@borealtech.ca>
À: Mathieu Gagnon <m.gagnon@entreprise.ca>, Martin Vallières <m.vallieres@entreprise.ca>
Date: 24 septembre 2026 17:00
Objet: Correctif déployé - Ticket SEC-210 (Masquage logs PCI-DSS)

Bonjour,
Le correctif de sanitisation des logs a été mergé et déployé en Staging. Les 6 derniers chiffres des numéros de carte et les CVV sont désormais totalement obfusqués (regex SHA-256 mask).
L'audit de conformité sécurité est validé.`,
    tags: ['Sécurité', 'Logs', 'SEC-210', 'PCI-DSS'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },
  {
    id: 'E09',
    name: 'E09_Rappel_mise_en_production.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-09-27',
    author: 'Mathieu Gagnon (Chargé de projet)',
    summary: 'Réalignement du calendrier : date officielle de mise en production réajustée au 28 novembre 2026.',
    content: `De: Mathieu Gagnon <m.gagnon@entreprise.ca>
À: Comité Directeur NOVA <comite-nova@entreprise.ca>
Date: 27 septembre 2026 09:00
Objet: Planning révisé - Date de mise en production au 28 novembre 2026

Bonjour à tous,
Suite aux résolutions de l'incident INT-101 et à la décision de reporter la synchro mobile offline en phase 2, voici les dates consolidées :
- Gel du code (Code Freeze) : 10 novembre 2026
- UAT / Tests utilisateurs finaux : 12 au 23 novembre 2026
- Déploiement en Production (Go-Live) : 28 novembre 2026
- Période d'hypercare : 30 nov au 18 décembre 2026.`,
    tags: ['Planning', 'MiseEnProd', 'GoLive', 'DatesValides'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },
  {
    id: 'E10',
    name: 'E10_Fonction_mobile.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-09-21',
    author: 'Véronique Tremblay (Directrice Marketing)',
    summary: 'Demande urgente de fonctionnalités mobiles hors-ligne pour les représentants terrain.',
    content: `De: Véronique Tremblay <v.tremblay@entreprise.ca>
À: Mathieu Gagnon <m.gagnon@entreprise.ca>
Date: 21 septembre 2026 11:30
Objet: Besoin critique : Mode hors-ligne sur application mobile

Bonjour Mathieu,
Nos 45 délégués commerciaux sur la route ont absolument besoin de saisir des commandes hors-ligne dans l'app mobile. Si ce n'est pas dans le MVP de novembre, nous perdrons des parts de marché. Est-ce possible d'accélérer le CR-04 ?`,
    tags: ['Marketing', 'Mobile', 'Scope'],
    fileType: 'eml',
    relevanceStatus: 'superseded'
  },
  {
    id: 'E11',
    name: 'E11_Communication_statut.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-09-28',
    author: 'Mathieu Gagnon (Chargé de projet)',
    summary: 'Synthèse d\'avancement hebdomadaire : état global "Sous contrôle avec vigilance".',
    content: `De: Mathieu Gagnon <m.gagnon@entreprise.ca>
À: Jean-Marc Dubois <jm.dubois@entreprise.ca>
Date: 28 septembre 2026 17:30
Objet: Rapport hebdomadaire NOVA - Statut au 28 septembre

Jean-Marc,
Le projet a retrouvé une bonne dynamique. L'équipe Boréal livre les correctifs d'accessibilité cette semaine.
Les 2 risques sous haute surveillance restent la performance sous forte charge (PERF-501) et le litige commercial sur la facture INV-003.`,
    tags: ['Statut', 'Rapport', 'Suivi'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },
  {
    id: 'E12',
    name: 'E12_Resolution_integration.eml',
    category: 'email',
    categoryLabel: 'Courriel',
    date: '2026-09-19',
    author: 'Alexandre Gagné (Boréal Lead Dev)',
    summary: 'Résolution définitive du bogue INT-101 grâce à un middleware de rafraîchissement proactif du token OAuth.',
    content: `De: Alexandre Gagné <a.gagne@borealtech.ca>
À: Mathieu Gagnon <m.gagnon@entreprise.ca>, Martin Vallières <m.vallieres@entreprise.ca>
Date: 19 septembre 2026 14:15
Objet: Résolu : Ticket INT-101 - Synchro CRM opérationnelle

Bonjour,
Le bogue INT-101 est clos. Nous avons implémenté un intercepteur axios qui régénère le jeton 5 minutes avant expiration et gère le retry avec backoff exponentiel.
Les 120 000 fiches clients ont été importées avec succès lors du test de charge d'hier soir.`,
    tags: ['Intégration', 'Résolu', 'INT-101', 'API'],
    fileType: 'eml',
    relevanceStatus: 'valid'
  },

  // 02 Réunions
  {
    id: 'M01',
    name: 'M01_CR_Demarrage_07juillet.txt',
    category: 'meeting',
    categoryLabel: 'Compte-rendu Réunion',
    date: '2026-07-07',
    author: 'Élodie Tremblay',
    summary: 'Réunion de cadrage initial : alignement des parties prenantes, méthodologie Agile Scrum bi-hebdomadaire.',
    content: `COMPTE-RENDU DE RÉUNION - LANCEMENT & CADRAGE
Date : 07 juillet 2026 (10h00 - 12h00)
Participants : Élodie Tremblay (CP), Jean-Marc Dubois (Dir TI), Martin Vallières (Arch), Stéphane Côté (Boréal), Alexandre Gagné (Boréal).

Décisions prises :
1. Rythme des sprints : Sprints de 2 semaines avec démo le jeudi à 14h.
2. Outil de suivi : Jira hébergé en interne + canal Teams dédié.
3. Critères d'acceptation : WCAG 2.1 AA obligatoire pour la mise en ligne.
4. Budget plafond Boréal : 310 000 $ en forfait + régie contrôlée.`,
    tags: ['Cadrage', 'Méthodologie', 'Scrum', 'Gouvernance'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'M02',
    name: 'M02_Transcript_Architecture_23juillet.txt',
    category: 'meeting',
    categoryLabel: 'Transcription Audio',
    date: '2026-07-23',
    author: 'Martin Vallières & Alexandre Gagné',
    summary: 'Transcription de l\'arbitrage technique : adoption d\'une architecture modulaire NestJS / Next.js et rejet du monolithe PHP existant.',
    content: `TRANSCRIPTION AUDIO - COMITÉ D'ARCHITECTURE
Date : 23 juillet 2026
Martin Vallières : "On ne peut pas simplement greffer du code sur le vieux monolithe PHP. Si on veut une plateforme pérenne pour les 7 prochaines années, il faut partir sur NestJS avec une base PostgreSQL partitionnée."
Alexandre Gagné : "Entièrement d'accord. Côté frontend, Next.js en SSR nous permettra de respecter les exigences SEO et les temps de réponse de moins de 1.5s."
Élodie Tremblay : "Est-ce que ça impacte notre budget ?"
Alexandre Gagné : "Non, c'est couvert dans le dimensionnement de l'ADR-002."`,
    tags: ['Architecture', 'TechStack', 'NestJS', 'PostgreSQL'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'M03',
    name: 'M03_CR_Comite_27aout.txt',
    category: 'meeting',
    categoryLabel: 'Compte-rendu Comité',
    date: '2026-08-27',
    author: 'Élodie Tremblay',
    summary: 'Comité de pilotage : examen des retards d\'intégration CRM et mise sous surveillance du risque calendrier.',
    content: `COMITÉ DE PILOTAGE MENSUEL - AOÛT 2026
Date : 27 août 2026
État global : JAUNE (Attention requise)
Faits saillants :
- Sprint 3 et 4 complétés à 82% de vélocité.
- Blocage majeur sur l'API CRM tiers (Ticket INT-101).
- Risque identifié : 12 jours de retard potentiel si non résolu avant le 10 septembre.
Plan d'action : Affectation d'un développeur senior Boréal dédié à 100% sur le connecteur.`,
    tags: ['Copil', 'Risque', 'Intégration', 'Planning'],
    fileType: 'txt',
    relevanceStatus: 'superseded'
  },
  {
    id: 'M04',
    name: 'M04_Transcript_Comite_direction_10sept.txt',
    category: 'meeting',
    categoryLabel: 'Transcription Audio',
    date: '2026-09-10',
    author: 'Jean-Marc Dubois, Élodie Tremblay, Stéphane Côté',
    summary: 'Débat houleux sur la date de livraison : arbitrage officiel de décaler le Go-Live du 15 au 28 novembre.',
    content: `TRANSCRIPTION - COMITÉ DE DIRECTION STRATÉGIQUE
Date : 10 septembre 2026
Jean-Marc Dubois : "Je refuse de livrer un produit bâclé le 15 novembre si la sécurité ou l'accessibilité ne sont pas à 100%. Stéphane, de combien de temps avez-vous besoin ?"
Stéphane Côté : "Si on garde le périmètre actuel sans le mode mobile hors-ligne, il nous faut 13 jours calendaires de plus pour les tests de charge."
Jean-Marc Dubois : "C'est acté. Nouvelle date officielle de Go-Live : 28 novembre 2026. Élodie, formalisez cela dans le plan de projet v3."`,
    tags: ['Décision', 'GoLive', 'DateFinale', 'Direction'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'M05',
    name: 'M05_CR_Suivi_18sept.txt',
    category: 'meeting',
    categoryLabel: 'Compte-rendu Réunion',
    date: '2026-09-18',
    author: 'Mathieu Gagnon',
    summary: 'Premier point d\'équipe de Mathieu Gagnon : inventaire des 6 billets bloquants et focus UAT.',
    content: `RÉUNION DE SUIVI HEBDOMADAIRE
Date : 18 septembre 2026
Animateur : Mathieu Gagnon (CP)
Présents : Martin Vallières, Nicolas Roy, Alexandre Gagné, Karine Bélanger.
Statut des tickets :
- INT-101 : Résolu et en test
- ACC-301 / ACC-302 : En cours de review PR
- ACC-303 : Assigné à Boréal Front
- PERF-501 : Investigation sur l'indexation de la table 'Transactions'
- SEC-210 : Patch prêt pour déploiement.`,
    tags: ['Suivi', 'Tickets', 'Transition', 'MathieuGagnon'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'M06',
    name: 'M06_Transcript_Comite_26sept.txt',
    category: 'meeting',
    categoryLabel: 'Transcription Audio',
    date: '2026-09-26',
    author: 'Comité de pilotage',
    summary: 'Décision formelle de rejet de la facturation CR-04 et confirmation du report de la feature mobile en Phase 2.',
    content: `TRANSCRIPTION - COMITÉ DE GESTION DU 26 SEPTEMBRE
Mathieu Gagnon : "Concernant la facture INV-003, Boréal nous a facturé 14 500 $ pour l'app mobile. Nous n'avons jamais signé le CR-04."
Jean-Marc Dubois : "C'est inacceptable. Stéphane, nous ne paierons pas cette somme. Le mode hors-ligne sera traité dans un contrat distinct pour la Phase 2 en 2027."
Stéphane Côté : "Compris Jean-Marc. Nous allons émettre une note de crédit de 14 500 $ et réémettre la facture corrigée."`,
    tags: ['Décision', 'LitigeFacture', 'CR-04', 'Budget'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },

  // 03 Tickets
  {
    id: 'ACC-301',
    name: 'ACC-301.txt',
    category: 'ticket',
    categoryLabel: 'Billet de soutien',
    date: '2026-08-14',
    author: 'Karine Bélanger',
    summary: 'Accessibilité : balises aria-label manquantes sur le sélecteur de filtres de documents.',
    content: `TICKET ID : ACC-301
Priorité : Élevée (Bloquant WCAG)
Composant : UI / DocumentPicker
Description : Le lecteur d'écran NVDA ne lit aucun libellé lorsque l'utilisateur navigue sur les boutons de pagination et de tri des documents.
Statut actuel : Résolu en Staging (PR #142)`,
    tags: ['Accessibilité', 'WCAG', 'Jira'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'ACC-302',
    name: 'ACC-302.txt',
    category: 'ticket',
    categoryLabel: 'Billet de soutien',
    date: '2026-08-14',
    author: 'Karine Bélanger',
    summary: 'Accessibilité : Contraste insuffisant des boutons d\'action secondaires (3.1:1 au lieu de 4.5:1).',
    content: `TICKET ID : ACC-302
Priorité : Moyenne
Composant : Theme / Buttons
Description : Le texte gris #8A92A6 sur fond blanc présente un ratio de contraste de seulement 3.1:1. Requis : changer la couleur pour #4B5563 (ratio 5.2:1).
Statut : Résolu dans le design system v2.1.`,
    tags: ['Accessibilité', 'DesignSystem', 'UI'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'ACC-303',
    name: 'ACC-303.txt',
    category: 'ticket',
    categoryLabel: 'Billet de soutien',
    date: '2026-08-15',
    author: 'Karine Bélanger',
    summary: 'Accessibilité : Piège de focus clavier dans la modale d\'authentification 2FA.',
    content: `TICKET ID : ACC-303
Priorité : Critique
Composant : AuthModal / 2FA
Description : L'utilisateur ne peut pas quitter la boîte de dialogue avec la touche Escape ni tabuler en dehors des champs OTP.
Statut : En cours de validation QA.`,
    tags: ['Accessibilité', 'Sécurité', 'Auth'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'INT-101',
    name: 'INT-101.txt',
    category: 'ticket',
    categoryLabel: 'Billet de soutien',
    date: '2026-08-25',
    author: 'Alexandre Gagné',
    summary: 'Intégration API : Erreur HTTP 401 Unauthorized lors de la synchronisation de nuit avec le CRM.',
    content: `TICKET ID : INT-101
Priorité : Bloquante
Composant : Backend / CRM-Sync-Worker
Description : Le worker de synchronisation nocturne échouait à 01h15 car le token OAuth expirait au bout de 3600 secondes sans rafraîchissement automatique.
Résolution : Implémentation du token auto-refresh + retry policy. Fermé le 19 sept 2026.`,
    tags: ['Intégration', 'API', 'OAuth', 'Bug'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'PERF-501',
    name: 'PERF-501.txt',
    category: 'ticket',
    categoryLabel: 'Billet de soutien',
    date: '2026-09-12',
    author: 'Martin Vallières',
    summary: 'Performance : Temps de réponse supérieur à 4.8s lors de recherches multi-critères sur 500 000 dossiers.',
    content: `TICKET ID : PERF-501
Priorité : Élevée
Composant : Database / SearchEngine
Description : Lors des tests de charge k6 avec 500 utilisateurs concurrents, l'endpoint /api/v1/search prend jusqu'à 4.8s.
Actions recommandées : Ajout d'index composites btree sur (tenant_id, created_at, status) et activation du cache Redis.
Statut : En cours d'optimisation.`,
    tags: ['Performance', 'PostgreSQL', 'Redis', 'Charge'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'SEC-210',
    name: 'SEC-210.txt',
    category: 'ticket',
    categoryLabel: 'Billet de soutien',
    date: '2026-09-17',
    author: 'Nicolas Roy',
    summary: 'Sécurité : Fuite potentielle de données de paiement en texte clair dans les logs d\'audit.',
    content: `TICKET ID : SEC-210
Priorité : Critique
Composant : PaymentGateway / Logger
Description : Les payload webhook Stripe loguaient accidentellement les 4 derniers chiffres et noms sans masquage suffisant.
Résolution : Masquage total via regex et chiffrement des logs Datadog. Corrigé le 24 sept 2026.`,
    tags: ['Sécurité', 'Audit', 'PCI-DSS'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },

  // 04 Documents de Projet
  {
    id: 'DOC-01',
    name: 'Charte_Projet_NOVA_v1.txt',
    category: 'project_doc',
    categoryLabel: 'Document Projet',
    date: '2026-07-02',
    author: 'Jean-Marc Dubois & Élodie Tremblay',
    summary: 'Charte de projet initiale définissant le périmètre, le budget de 380 000 $ et l\'ancienne date du 30 octobre 2026.',
    content: `CHARTE DE PROJET - PROJET NOVA (Version 1.0 - 02 Juillet 2026)
1. OBJECTIFS
- Déployer un portail client 360 unifié.
- Réduire le temps de traitement des demandes de 45%.
- Automatiser la facturation et le suivi des contrats.

2. CONTRAINTES & DATES CLÉS INITIALES
- Date de début : 07 Juillet 2026
- Date de livraison prévue initiale : 30 Octobre 2026 (NB: Décalée par la suite au 28 Nov)
- Budget total alloué : 380 000 $ CAD
- Souveraineté : Données au Canada exclusivement.`,
    tags: ['Charte', 'Périmètre', 'Historique'],
    fileType: 'txt',
    relevanceStatus: 'outdated'
  },
  {
    id: 'DOC-02',
    name: 'Note_transition_Elodie_16sept.txt',
    category: 'project_doc',
    categoryLabel: 'Document Projet',
    date: '2026-09-16',
    author: 'Élodie Tremblay',
    summary: 'Mémo de passation récapitulant les dossiers chauds, contacts clés et mise en garde sur les factures de Boréal.',
    content: `NOTE DE TRANSITION - GESTION DE PROJET NOVA
De : Élodie Tremblay (CP sortante)
À : Mathieu Gagnon (CP entrant)
Date : 16 septembre 2026

Mathieu, voici l'état des lieux sans filtre :
1. Calendrier : La vraie date cible est le 28 novembre. Ne laisse personne repousser au-delà car nous avons les renouvellements clients de décembre.
2. Équipe Boréal : Alexandre (lead dev) est excellent. Stéphane (commercial) tente souvent de faire passer des extras. Vérifie chaque facture à la ligne près !
3. Accessibilité : Karine Bélanger est très pointilleuse mais ses remarques sont justes.
4. Données : Attention à l'hébergement Canada Central. Le juridique ne fera aucun compromis.`,
    tags: ['Transition', 'Passation', 'MathieuGagnon', 'Vigilance'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'DOC-03',
    name: 'Plan_Projet_NOVA_v3_12sept.xlsx',
    category: 'project_doc',
    categoryLabel: 'Document Projet',
    date: '2026-09-12',
    author: 'Élodie Tremblay',
    summary: 'Planning consolidé v3 intégrant le report au 28 novembre et les jalons de tests de charge.',
    content: `PLAN DE PROJET MASTER v3.0 (12 Septembre 2026)
Jalons :
- M1 : Architecture & Cloud Setup (25 Juillet) -> COMPLÉTÉ
- M2 : Core API & Modèle de données (20 Août) -> COMPLÉTÉ
- M3 : Connecteur CRM & Intégrations (19 Septembre) -> COMPLÉTÉ
- M4 : Finalisation UI & Accessibilité WCAG (10 Octobre) -> EN COURS
- M5 : Tests de performance & Sécurité (25 Octobre) -> EN ATTENTE
- M6 : UAT & Formation des équipes (12 au 23 Novembre) -> PLANIFIÉ
- M7 : Déploiement en Production (28 Novembre 2026) -> DATE OFFICIELLE`,
    tags: ['Planning', 'Jalons', 'Excel', 'DatesValides'],
    fileType: 'xlsx',
    relevanceStatus: 'valid'
  },
  {
    id: 'DOC-04',
    name: 'Registre_Risques_29sept.xlsx',
    category: 'project_doc',
    categoryLabel: 'Document Projet',
    date: '2026-09-29',
    author: 'Mathieu Gagnon',
    summary: 'Matrice des risques à jour : 2 risques élevés (PERF-501 et litige facture), 3 risques modérés.',
    content: `REGISTRE DES RISQUES PROJET NOVA (Mis à jour le 29 Septembre 2026)
R1 [Sévérité: HAUTE] : Dégradation des performances sous charge maximale (PERF-501). Mitigation : Indexation DB + Redis cache.
R2 [Sévérité: HAUTE] : Litige commercial sur la facture INV-003 (14 500 $). Mitigation : Note de crédit négociée avec Boréal.
R3 [Sévérité: MOYENNE] : Adoption utilisateur ralentie par le changement d'interface. Mitigation : 4 sessions de formation planifiées en novembre.
R4 [Sévérité: FAIBLE] : Non-conformité WCAG. Mitigation : 2 tickets sur 3 déjà corrigés en staging.`,
    tags: ['Risques', 'Registre', 'Mitigation'],
    fileType: 'xlsx',
    relevanceStatus: 'valid'
  },

  // 05 Contrats et finances
  {
    id: 'FIN-01',
    name: 'CONTRAT_Boreal_NOVA.pdf',
    category: 'contract_finance',
    categoryLabel: 'Contrat & Finances',
    date: '2026-07-05',
    author: 'Boréal Technologies Inc. & Entreprise',
    summary: 'Contrat de services professionnels pour le développement de la plateforme NOVA. Montant : 310 000 $ CAD.',
    content: `CONTRAT DE PRESTATION DE SERVICES TECHNOLOGIQUES
Entre : Entreprise Cliente et Boréal Technologies Inc.
Montant forfaitaire de base : 310 000,00 $ CAD
Modalités de facturation :
- Facture 001 (Acompte 30%) : 93 000,00 $ à la signature (Payée)
- Facture 002 (Jalon Architecture & Core 30%) : 93 000,00 $ (Payée)
- Facture 003 (Jalon Intégration & UAT 20%) : 54 000,00 $ (En cours de révision)
- Facture 004 (Solde Go-Live 20%) : 70 000,00 $ à la mise en production.
Clause spécifique : Toute demande de changement (CR) doit faire l'objet d'un avenant écrit dûment signé avant tout début de travaux.`,
    tags: ['Contrat', 'Finances', 'Boréal', 'Clauses'],
    fileType: 'pdf',
    relevanceStatus: 'valid'
  },
  {
    id: 'FIN-02',
    name: 'CR-04_Optimisation_mobile_BROUILLON.pdf',
    category: 'contract_finance',
    categoryLabel: 'Contrat & Finances',
    date: '2026-09-08',
    author: 'Boréal Technologies (Stéphane Côté)',
    summary: 'Demande de changement CR-04 (14 500 $) pour l\'application mobile hors-ligne. Statut : BROUILLON NON SIGNÉ.',
    content: `DEMANDE DE CHANGEMENT N° CR-04 (ÉTAT : BROUILLON / NON APPROUVÉ)
Titre : Développement du mode hors-ligne pour terminaux mobiles
Montant estimé : 14 500,00 $ CAD (120 heures de développement)
Impact calendrier : +3 semaines de tests
Signature Client : [AUCUNE SIGNATURE - DOCUMENT BROUILLON]
Note interne : Le comité de direction a formellement rejeté l'intégration de ce CR dans le MVP 2026 et l'a reporté en Phase 2.`,
    tags: ['CR-04', 'Brouillon', 'Mobile', 'NonSigné', 'Contradiction'],
    fileType: 'pdf',
    relevanceStatus: 'superseded'
  },
  {
    id: 'FIN-03',
    name: 'INV-003.pdf',
    category: 'contract_finance',
    categoryLabel: 'Contrat & Finances',
    date: '2026-09-15',
    author: 'Boréal Technologies Inc.',
    summary: 'Facture INV-003 d\'un montant de 68 500 $ comprenant indûment 14 500 $ pour le CR-04 mobile non approuvé.',
    content: `FACTURE N° INV-003 - BORÉAL TECHNOLOGIES INC.
Date d'émission : 15 septembre 2026
Détail :
1. Jalon M3 - Intégration API & Connecteurs : 54 000,00 $ CAD
2. Avenant CR-04 - Développement Mobile Hors-Ligne : 14 500,00 $ CAD
Total Facturé : 68 500,00 $ CAD
Statut : CONTESTÉ PAR LE CLIENT. Tranche de 54 000 $ approuvée, tranche de 14 500 $ en attente de note de crédit.`,
    tags: ['Facture', 'INV-003', 'Contestation', 'Finances'],
    fileType: 'pdf',
    relevanceStatus: 'valid'
  },

  // 06 Architecture et Décisions
  {
    id: 'ARCH-01',
    name: 'ADR-007_Localisation_donnees.md',
    category: 'architecture',
    categoryLabel: 'Architecture & ADR',
    date: '2026-07-24',
    author: 'Martin Vallières (Architecte Solution)',
    summary: 'Architecture Decision Record 007 : Localisation obligatoire de toutes les données au Canada.',
    content: `# ADR-007 : Localisation des données et conformité Loi 25
## Contexte
L'entreprise opère dans un secteur réglementé au Québec et au Canada. La Loi 25 impose des règles strictes sur le transfert transfrontalier de données personnelles.
## Décision
1. Toutes les instances PostgreSQL, OpenSearch et les compartiments S3 sont cantonnés à la région AWS/Azure Canada Central (Montréal).
2. Tout service tiers sans garantie de stockage canadien est exclu du périmètre.
## Conséquences
Coût d'infrastructure légèrement supérieur (+4%), mais conformité légale totale garantie sans risque de pénalité.`,
    tags: ['ADR', 'Loi25', 'Canada', 'Architecture'],
    fileType: 'md',
    relevanceStatus: 'valid'
  },
  {
    id: 'ARCH-02',
    name: 'Decision_Portee_Phase2.md',
    category: 'architecture',
    categoryLabel: 'Architecture & ADR',
    date: '2026-09-22',
    author: 'Comité de direction NOVA',
    summary: 'Décision formelle de scinder le périmètre : focus MVP web sur novembre 2026, report mobile en Phase 2 (Q1 2027).',
    content: `# DÉCISION STRATÉGIQUE DE PÉRIMÈTRE - PHASE 1 VS PHASE 2
Date : 22 septembre 2026
Approuvé par : Jean-Marc Dubois (Dir TI), Véronique Tremblay (Marketing), Mathieu Gagnon (CP)

## Arbitrage
Pour sécuriser le lancement du 28 novembre 2026 sans dégrader la qualité :
- PHASE 1 (MVP - 28 Nov 2026) : Portail Web Desktop & Tablette, Connecteurs CRM/ERP, Facturation unifiée, Conformité WCAG 2.1 AA.
- PHASE 2 (Q1 2027) : Application mobile native iOS/Android, Mode hors-ligne synchronisé, Module analytique prédictif.`,
    tags: ['Décision', 'Périmètre', 'Phase2', 'Arbitrage'],
    fileType: 'md',
    relevanceStatus: 'valid'
  },

  // 07 Conversations Teams
  {
    id: 'TEAMS-01',
    name: 'Teams_16sept_Transition.txt',
    category: 'teams',
    categoryLabel: 'Discussion Teams',
    date: '2026-09-16',
    author: 'Élodie Tremblay & Mathieu Gagnon',
    summary: 'Échange Teams informel lors de la passation de relais entre Élodie et Mathieu.',
    content: `[16/09/2026 14:02] Élodie Tremblay : Salut Mathieu ! Bienvenue dans l'arène NOVA :)
[16/09/2026 14:03] Mathieu Gagnon : Merci Élodie ! J'ai lu la charte v1 et le plan v2. Par contre j'ai vu deux dates différentes : 30 octobre et 15 novembre ?
[16/09/2026 14:05] Élodie Tremblay : Ah attention ! Oublie le 30 octobre (c'était l'ébauche initiale). On a réaligné au copil du 10 septembre pour le 28 novembre officiel à cause du pépin INT-101.
[16/09/2026 14:06] Mathieu Gagnon : Parfait, c'est très clair. Et pour la facture de Boréal ?
[16/09/2026 14:07] Élodie Tremblay : Stéphane nous a glissé 14.5k$ pour le mobile sans signature. Bloque-la sans hésiter jusqu'au prochain copil !`,
    tags: ['Teams', 'Passation', 'Dates', 'Facture'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'TEAMS-02',
    name: 'Teams_22sept_Mobile.txt',
    category: 'teams',
    categoryLabel: 'Discussion Teams',
    date: '2026-09-22',
    author: 'Véronique Tremblay & Mathieu Gagnon',
    summary: 'Discussion Teams sur la décision de différer la fonctionnalité mobile et plan de formation.',
    content: `[22/09/2026 09:15] Véronique Tremblay : Mathieu, on a vraiment besoin de la fonction mobile pour les ventes terrain...
[22/09/2026 09:18] Mathieu Gagnon : Véronique, je comprends ton besoin. Mais si on l'ajoute maintenant, on rate le Go-Live du 28 novembre et on risque des pannes de synchro. On a convenu avec Jean-Marc d'en faire le projet prioritaire de janvier 2027 avec une formation dédiée.
[22/09/2026 09:20] Véronique Tremblay : D'accord si on verrouille janvier 2027 dans le budget annuel. Je valide le compromis.`,
    tags: ['Teams', 'Marketing', 'Scope', 'Alignement'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  }
];

export const INITIAL_NOVA_ANALYSIS: ProjectAnalysis = {
  projectId: 'NOVA-360',
  projectName: 'Projet NOVA - Plateforme Client 360',
  lastUpdated: '2026-10-03 (Temps Réel)',
  status: 'at_risk',
  statusLabel: 'En bonne voie (avec points de vigilance)',
  healthScore: 78,
  executiveSummary: 'Le projet NOVA avance avec une trajectoire consolidée suite au réalignement du calendrier au 28 novembre 2026. La transition de gestion de projet (Élodie Tremblay vers Mathieu Gagnon) est finalisée. Le blocage critique d\'intégration API CRM (INT-101) et le patch de sécurité (SEC-210) sont résolus. Les deux éléments sous surveillance active sont l\'optimisation des performances sous charge (PERF-501) et la régularisation comptable de la facture INV-003 avec Boréal Technologies.',
  activeBlockersCount: 2,
  decisionsCount: 5,
  upcomingDeadlinesCount: 3,
  keyStakeholders: [
    { name: 'Jean-Marc Dubois', role: 'Directeur TI / Sponsor', organization: 'Entreprise Cliente', influence: 'Décisionnaire stratégique' },
    { name: 'Mathieu Gagnon', role: 'Chargé de Projet Principal', organization: 'Entreprise Cliente', influence: 'Pilotage opérationnel' },
    { name: 'Élodie Tremblay', role: 'Ex-Chargée de Projet', organization: 'Entreprise Cliente (Départ 18 sept)', influence: 'Historique & passation' },
    { name: 'Martin Vallières', role: 'Architecte Solution & Sécurité', organization: 'Entreprise Cliente', influence: 'Validation technique' },
    { name: 'Stéphane Côté', role: 'Directeur de compte', organization: 'Boréal Technologies Inc.', influence: 'Gestion contractuelle' },
    { name: 'Alexandre Gagné', role: 'Lead Architecte & Dev', organization: 'Boréal Technologies Inc.', influence: 'Exécution technique' },
    { name: 'Karine Bélanger', role: 'Auditrice Accessibilité & UX', organization: 'Access-Web Expert', influence: 'Validation conformité' },
    { name: 'Sophie Lavoie', role: 'Conseillère Juridique', organization: 'Direction Juridique', influence: 'Conformité Loi 25' }
  ],
  milestones: [
    { title: 'Cadrage & Charte de projet', date: '2026-07-07', status: 'completed', owner: 'Jean-Marc Dubois' },
    { title: 'Validation ADR-007 (Hébergement Canada Central)', date: '2026-07-25', status: 'completed', owner: 'Martin Vallières' },
    { title: 'Résolution Connecteur API CRM (INT-101)', date: '2026-09-19', status: 'completed', owner: 'Alexandre Gagné' },
    { title: 'Finalisation Accessibilité WCAG 2.1 AA (ACC-301..303)', date: '2026-10-10', status: 'on_track', owner: 'Karine Bélanger' },
    { title: 'Optimisation Performance sous charge (PERF-501)', date: '2026-10-25', status: 'at_risk', owner: 'Martin Vallières' },
    { title: 'Gel du Code (Code Freeze)', date: '2026-11-10', status: 'pending', owner: 'Mathieu Gagnon' },
    { title: 'Tests Utilisateurs (UAT)', date: '2026-11-12', status: 'pending', owner: 'Mathieu Gagnon' },
    { title: 'Mise en Production Officielle (Go-Live)', date: '2026-11-28', status: 'pending', initialDate: '2026-10-30', notes: 'Date ferme convenue en comité du 10 sept', owner: 'Jean-Marc Dubois' }
  ],
  decisions: [
    {
      id: 'DEC-01',
      title: 'Hébergement exclusif en région Canada Central (Montréal)',
      date: '2026-07-24',
      owner: 'Martin Vallières & Sophie Lavoie',
      rationale: 'Conformité stricte aux exigences de la Loi 25 et du cadre réglementaire de protection des données nominatives.',
      impact: 'Exclusion de tout cloud non-canadien; isolation des clusters et snapshots à Montréal.',
      status: 'implemented',
      sourceDocName: 'ADR-007_Localisation_donnees.md',
      evidenceQuote: 'Toutes les instances PostgreSQL et compartiments S3 sont cantonnés à la région AWS/Azure Canada Central.'
    },
    {
      id: 'DEC-02',
      title: 'Adoption de la pile technique NestJS / Next.js et PostgreSQL',
      date: '2026-07-23',
      owner: 'Martin Vallières',
      rationale: 'Remplacement du monolithe PHP vieillissant pour assurer la maintenabilité et la scalabilité sur 7 ans.',
      impact: 'Architecture découplée en microservices légers avec SSR pour performance SEO.',
      status: 'implemented',
      sourceDocName: 'M02_Transcript_Architecture_23juillet.txt',
      evidenceQuote: 'NestJS avec base PostgreSQL partitionnée et Next.js en SSR pour des temps de réponse < 1.5s.'
    },
    {
      id: 'DEC-03',
      title: 'Report officiel du Go-Live au 28 novembre 2026',
      date: '2026-09-10',
      owner: 'Jean-Marc Dubois',
      rationale: 'Absorption du décalage de 10 jours causé par le bogue d\'intégration CRM sans compromettre la sécurité et l\'accessibilité.',
      impact: 'Nouvelle date de livraison acceptée par toutes les directions; plan de projet v3 publié.',
      status: 'approved',
      sourceDocName: 'M04_Transcript_Comite_direction_10sept.txt',
      evidenceQuote: 'Nouvelle date officielle de Go-Live : 28 novembre 2026.'
    },
    {
      id: 'DEC-04',
      title: 'Report du mode hors-ligne mobile en Phase 2 (Q1 2027)',
      date: '2026-09-22',
      owner: 'Comité de Direction NOVA',
      rationale: 'Éviter un risque de dérapage de 3 semaines sur le jalon MVP et cadrer un budget dédié.',
      impact: 'Périmètre MVP recentré sur le portail Web Desktop/Tablette; entente avec le marketing.',
      status: 'approved',
      sourceDocName: 'Decision_Portee_Phase2.md',
      evidenceQuote: 'PHASE 1 : Portail Web Desktop & Tablette. PHASE 2 (Q1 2027) : Application mobile native hors-ligne.'
    },
    {
      id: 'DEC-05',
      title: 'Gel du paiement du CR-04 sur la facture INV-003 et note de crédit demandée',
      date: '2026-09-26',
      owner: 'Mathieu Gagnon & Jean-Marc Dubois',
      rationale: 'Boréal a facturé 14 500 $ pour un changement resté à l\'état de brouillon non signé.',
      impact: 'Règlement partiel de 54 000 $ émis; émission d\'une note de crédit de 14 500 $ convenue avec Stéphane Côté.',
      status: 'approved',
      sourceDocName: 'M06_Transcript_Comite_26sept.txt',
      evidenceQuote: 'Nous allons émettre une note de crédit de 14 500 $ et réémettre la facture corrigée.'
    }
  ],
  risks: [
    {
      id: 'RSK-01',
      title: 'Dégradation des temps de réponse sous forte charge (PERF-501)',
      severity: 'high',
      category: 'Technique & Performance',
      identifiedDate: '2026-09-12',
      owner: 'Martin Vallières & Alexandre Gagné',
      mitigation: 'Création d\'index btree composites sur la table transactions et mise en cache Redis des requêtes fréquentes.',
      status: 'active',
      sourceDocName: 'PERF-501.txt'
    },
    {
      id: 'RSK-02',
      title: 'Régularisation comptable et note de crédit Boréal (INV-003)',
      severity: 'medium',
      category: 'Financier & Commercial',
      identifiedDate: '2026-09-22',
      owner: 'Mathieu Gagnon',
      mitigation: 'Suivi de la réception de la note de crédit formelle de 14 500 $ avant validation du solde.',
      status: 'active',
      sourceDocName: 'E07_Facture_003_question.eml'
    },
    {
      id: 'RSK-03',
      title: 'Non-conformité résiduelle WCAG sur la modale 2FA (ACC-303)',
      severity: 'low',
      category: 'Accessibilité & Légal',
      identifiedDate: '2026-08-15',
      owner: 'Karine Bélanger',
      mitigation: 'Tests QA finaux en cours sur la PR de libération du focus clavier.',
      status: 'monitoring',
      sourceDocName: 'ACC-303.txt'
    }
  ],
  actions: [
    {
      id: 'ACT-01',
      title: 'Déployer et tester les index composites et cache Redis pour clore PERF-501',
      assignee: 'Alexandre Gagné (Boréal)',
      deadline: '2026-10-15',
      priority: 'high',
      status: 'in_progress',
      sourceRationale: 'Assurer des temps de réponse < 1.5s lors des tests de charge k6 avec 1000 utilisateurs.'
    },
    {
      id: 'ACT-02',
      title: 'Obtenir et archiver la note de crédit de 14 500 $ de Boréal Technologies',
      assignee: 'Mathieu Gagnon',
      deadline: '2026-10-08',
      priority: 'high',
      status: 'todo',
      sourceRationale: 'Clôturer le litige financier sur la facture INV-003 avant le prochain comité budgétaire.'
    },
    {
      id: 'ACT-03',
      title: 'Valider la conformité finale WCAG 2.1 AA avec Karine Bélanger',
      assignee: 'Karine Bélanger / Mathieu Gagnon',
      deadline: '2026-10-18',
      priority: 'medium',
      status: 'in_progress',
      sourceRationale: 'Obtenir l\'attestation formelle d\'accessibilité pour l\'autorisation de mise en ligne.'
    },
    {
      id: 'ACT-04',
      title: 'Finaliser le plan de formation utilisateur pour la phase UAT de novembre',
      assignee: 'Véronique Tremblay & Mathieu Gagnon',
      deadline: '2026-10-30',
      priority: 'medium',
      status: 'todo',
      sourceRationale: 'Préparer les 45 gestionnaires de compte au passage sur la nouvelle plateforme.'
    }
  ],
  contradictions: [
    {
      id: 'CTR-01',
      topic: 'Date de Livraison Finale du Projet',
      issue: 'Trois dates différentes apparaissent dans la documentation : 30 Octobre (Charte v1), 15 Novembre (Plan v2 / Courriel E01) et 28 Novembre (Plan v3 / Copil 10 Sept).',
      sourceA: { docName: 'Charte_Projet_NOVA_v1.txt', statement: 'Date de livraison prévue : 30 Octobre 2026', date: '2026-07-02' },
      sourceB: { docName: 'Plan_Projet_NOVA_v3_12sept.xlsx', statement: 'Mise en Production Officielle (Go-Live) : 28 Novembre 2026', date: '2026-09-12' },
      validStatus: 'La date actuellement VALIDE et officielle est le 28 Novembre 2026, entérinée au comité de direction du 10 septembre suite au retard d\'intégration CRM.',
      recommendation: 'Archiver formellement la charte v1 comme obsolète et utiliser le Plan v3 pour tout jalon opérationnel.'
    },
    {
      id: 'CTR-02',
      topic: 'Facturation du Module Mobile Hors-Ligne (CR-04)',
      issue: 'La facture INV-003 réclame 14 500 $ pour le CR-04, alors que le document contractuel CR-04 est un brouillon non signé et que la décision de report en Phase 2 a été actée.',
      sourceA: { docName: 'INV-003.pdf', statement: 'Ligne facturée : CR-04 Développement Mobile Hors-Ligne : 14 500,00 $ CAD', date: '2026-09-15' },
      sourceB: { docName: 'Decision_Portee_Phase2.md', statement: 'Phase 2 (Q1 2027) : Application mobile native hors-ligne', date: '2026-09-22' },
      validStatus: 'Le CR-04 n\'est PAS approuvé pour la Phase 1. La facture INV-003 est contestée; une note de crédit de 14 500 $ est convenue.',
      recommendation: 'Ne payer que la partie contractuelle de 54 000 $ et exiger la note de crédit écrite avant le paiement final.'
    },
    {
      id: 'CTR-03',
      topic: 'Localisation de l\'infrastructure Infonuagique',
      issue: 'L\'ébauche d\'architecture initiale mentionnait la région US-East pour réduire les coûts, en contradiction avec la politique de conformité Loi 25.',
      sourceA: { docName: 'Architecture_NOVA_v1 (Ébauche)', statement: 'Clusters provisionnés sur us-east-1', date: '2026-07-10' },
      sourceB: { docName: 'ADR-007_Localisation_donnees.md', statement: 'Toutes les instances PostgreSQL et S3 cantonnées à Canada Central (Montréal)', date: '2026-07-24' },
      validStatus: 'Région Canada Central (Montréal) confirmée et active (Courriel E03).',
      recommendation: 'Considérer Architecture v1 comme caduque, se référer à Architecture v2 et ADR-007.'
    }
  ],
  financials: {
    contractTotal: '310 000 $ CAD (Contrat Boréal de base)',
    invoicedTotal: '254 500 $ CAD (Factures 001 + 002 + 003 reçues)',
    paidTotal: '186 000 $ CAD (Factures 001 et 002 acquittées)',
    disputedAmount: '14 500 $ CAD (Ligne CR-04 contestée sur INV-003)',
    notes: 'Budget global alloué par l\'Entreprise : 380 000 $ CAD. Reste à engager pour la Phase 1 : ~70 000 $ CAD (Facture 004 finale).'
  },
  topics: [
    { name: 'Architecture & Hébergement Cloud', description: 'Conformité Loi 25, région Canada Central, NestJS/Next.js/PostgreSQL', documentCount: 5, health: 'good' },
    { name: 'Intégration API & Connecteurs', description: 'Connecteur CRM, token refresh JWT, import de données', documentCount: 4, health: 'good' },
    { name: 'Sécurité & Audit PCI-DSS', description: 'Sanitisation des logs, obfuscation cartes bancaires, 2FA', documentCount: 3, health: 'good' },
    { name: 'Performance & Scalabilité', description: 'Temps de réponse de 4.8s sous charge (PERF-501), indexation btree', documentCount: 2, health: 'warning' },
    { name: 'Accessibilité & Conformité WCAG', description: 'Tickets ACC-301 à 303, conformité SGQRI 008 / WCAG 2.1 AA', documentCount: 4, health: 'good' },
    { name: 'Contrats, Finances & Facturation', description: 'Contrat Boréal, factures 001 à 003, contestation CR-04', documentCount: 5, health: 'warning' },
    { name: 'Gouvernance & Transition de Projet', description: 'Départ Élodie Tremblay, arrivée Mathieu Gagnon, calendrier réaligné', documentCount: 6, health: 'good' }
  ]
};

// Second sample project for comparison bonus
export const SAMPLE_DOCUMENTS_ORION: ProjectDocument[] = [
  {
    id: 'OR-01',
    name: 'Charte_Projet_ORION.txt',
    category: 'project_doc',
    categoryLabel: 'Document Projet',
    date: '2025-01-15',
    author: 'Direction Transformation Numérique',
    summary: 'Projet ORION : Refonte de la chaîne logistique et entrepôts intelligents. Budget 520 000 $ CAD.',
    content: `PROJET ORION - MODERNISATION LOGISTIQUE & INVENTAIRE
Budget : 520 000 $ CAD
Statut : Clôturé avec succès en Février 2026.
Leçons apprises :
1. Privilégier les tests de charge dès le sprint 2 plutôt qu'à la fin.
2. Établir une convention stricte sur les bons de commande avant d'accepter toute modification de scope.`,
    tags: ['Logistique', 'Clôturé', 'Comparaison'],
    fileType: 'txt',
    relevanceStatus: 'valid'
  },
  {
    id: 'OR-02',
    name: 'INV-778_Projet_ORION.pdf',
    category: 'contract_finance',
    categoryLabel: 'Contrat & Finances',
    date: '2026-02-10',
    author: 'Fournisseur SupplyTech',
    summary: 'Facture finale d\'acceptation du projet ORION acquittée.',
    content: `FACTURE DE CLÔTURE PROJET ORION
Montant total réglé : 512 000 $ CAD (Sous le budget initial de 520k).
Aucun litige enregistré.`,
    tags: ['Finance', 'Clôture', 'Succès'],
    fileType: 'pdf',
    relevanceStatus: 'valid'
  }
];

export const EMPTY_PROJECT_ANALYSIS: ProjectAnalysis = {
  projectId: 'AWAITING-DATASET',
  projectName: 'En attente d\'un dossier',
  status: 'on_track',
  statusLabel: 'En attente',
  healthScore: 0,
  lastUpdated: new Date().toISOString().split('T')[0],
  executiveSummary: 'Aucun fichier chargé en mémoire. Veuillez importer votre dossier de projet pour que le moteur RAG génère les analyses et citations.',
  keyStakeholders: [],
  milestones: [],
  decisions: [],
  risks: [],
  actions: [],
  contradictions: [],
  financials: {
    contractTotal: 'Non renseigné',
    invoicedTotal: 'Non renseigné',
    paidTotal: 'Non renseigné',
    disputedAmount: '0 $',
    notes: 'En attente d\'importation des pièces financières'
  },
  topics: [],
  activeBlockersCount: 0,
  decisionsCount: 0,
  upcomingDeadlinesCount: 0
};
