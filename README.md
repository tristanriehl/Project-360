# Projet 360 — Cerveau Opérationnel & Dashboard RAG

> Système de mémoire opérationnelle fiable et tableau de bord 360° pour le pilotage de projet, la détection de contradictions et l'analyse d'impact d'événements imprévus.

---

## 🚀 Démarrage Rapide en Local sur votre Ordinateur

Ce projet est une application web complète fonctionnant avec **Node.js, Express, React 19, TypeScript et Tailwind CSS**.

### 1. Prérequis
- Node.js (version 18 ou supérieure)
- npm, yarn ou bun

### 2. Installation
```bash
git clone <votre-dépôt> projet-360
cd projet-360
npm install
```

### 3. Configuration des Modes d'Exécution (Optionnel)
Créez un fichier `.env` à la racine :

```env
# Optionnel : Si vous souhaitez utiliser l'API Gemini
GEMINI_API_KEY="votre_clé_api"

# Optionnel : Si vous souhaitez connecter un LLM local Ollama
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="llama3.2"

# Port d'écoute du serveur
PORT=3000
```

*Note : Même sans clé API configurée, l'application intègre un **mode démo local 100% autonome et hors-ligne** qui permet d'exécuter toutes les fonctionnalités (croisement des 35 documents, détection des contradictions, graphe de connaissances, réponses RAG sourcées et simulation de nouveaux événements).*

### 4. Lancement
```bash
npm run dev
```

Ouvrez votre navigateur sur : **[http://localhost:3000](http://localhost:3000)**

---

## 🎯 Architecture & Fonctionnalités Clés (Défi 24h)

1. **Tableau de Bord Exécutif 360° :** Jauge de santé, statut consolidé, 5 décisions actées, échéances à 30 jours, 2 risques sous surveillance, 4 prochaines actions prioritaires.
2. **Cerveau & Graphe de Connaissances :** Vue interactive en réseau reliant les documents sources, décisions, risques et thématiques.
3. **Assistant RAG & Citations Directes :** Moteur de questions-réponses en langage naturel avec vérification des preuves et extraits textuels authentifiés.
4. **Module « Un nouvel événement survient » :** Analyse instantanée en 3 questions :
   - *Qu'est-ce qui vient de changer ?*
   - *Quelles informations précédentes sont maintenant affectées ?*
   - *Quelles actions devraient être prises ?*
5. **Détecteur de Contradictions :** Distinction nette entre informations historiques périmées et vérité terrain actuellement valide (ex: date du 30 oct. vs 28 nov., facturation du CR-04 non signé sur INV-003).
6. **Registre des Décisions & Preuves Auditables :** Traçabilité exhaustive des justifications avec liens directs vers les documents sources.
7. **Gestionnaire de Documents Multi-Formats :** Ingestion glisser-déposer de courriels (.eml), comptes-rendus (.txt), contrats (.pdf), feuilles de calcul (.xlsx), tickets et messages Teams.
8. **Briefing Exécutif & Comparaison Multi-Projets :** Synthèse prête pour la direction générale et comparaison avec un projet logistique de référence (Projet ORION).
