# Architecture & Flux de Fonctionnement du Système — Projet 360

Ce document décrit en détail l'architecture technique, le pipeline RAG et le flux de traitement des données du système **Projet 360**.

---

## 📊 Diagramme Mermaid.js Global du Système

Vous pouvez copier ce bloc Mermaid directement dans [Mermaid Live Editor](https://mermaid.live), GitHub, Notion ou tout visualiseur Markdown :

```mermaid
flowchart TD
    %% Source Ingestion Layer
    subgraph SOURCING ["1. COUCHE D'INGESTION MULTI-SOURCES"]
        direction TB
        F1["📧 Courriels (.eml)<br/><i>Échanges clients, approbations</i>"]
        F2["🎙️ Réunions & Transcripts (.txt)<br/><i>Comités copil, arbitrages techniques</i>"]
        F3["🎫 Billets JIRA & Incidents (.txt, .csv)<br/><i>Bugs API, tickets WCAG, sécurité</i>"]
        F4["📑 Documents & Plans (.xlsx, .pdf)<br/><i>Charte v1, Plan v3, Registre des risques</i>"]
        F5["💼 Contrats & Finances (.pdf)<br/><i>Contrat Boréal, Factures 001 à 003, CR-04</i>"]
        F6["💬 Conversations Teams (.txt)<br/><i>Passation Élodie/Mathieu, discussions scope</i>"]
        F7["⚡ Nouvel Événement Surprise<br/><i>(Remis en direct lors de la présentation)</i>"]
    end

    %% Normalization & Ingestion Engine
    subgraph ENGINE ["2. MOTEUR DE MÉMOIRE OPÉRATIONNELLE & RAG"]
        direction TB
        E1["📥 Ingestion & Normalisation<br/>Extraction texte, typage, horodatage, métadonnées"]
        E2["🧠 Référentiel Documentaire Centralisé<br/>35+ documents indexés en mémoire active"]
        E3["🔍 Moteur de Détection de Divergences<br/>Croisement temporel : Documents historiques vs Récentes décisions"]
    end

    %% Processing & Reasoning Core
    subgraph REASONING ["3. CERVEAU D'ANALYSE & SYNTHÈSE IA (Gemini 3.8 Flash / Ollama)"]
        direction TB
        R1["🗓️ Reconstitution Chronologique<br/><i>Absorption des retards & fixation Go-Live au 28 Nov</i>"]
        R2["⚖️ Registre des Décisions & Preuves<br/><i>Extraction des justifications avec citations textuelles</i>"]
        R3["⚠️ Détecteur d'Incohérences & Conflits<br/><i>Ex: Date 30 Oct vs 28 Nov | Facture CR-04 non signée</i>"]
        R4["🛡️ Analyse des Risques & Actions<br/><i>Priorisation des tâches urgentes (PERF-501, note de crédit)</i>"]
        R5["🎯 Réacteur d'Événement Surprise<br/><i>Réponse aux 3 questions : Changement ? Affectations ? Actions ?</i>"]
    end

    %% Serving & API Layer
    subgraph BACKEND ["4. SERVEUR FULL-STACK & API REST (Express / Node.js)"]
        direction TB
        B1["GET /api/project<br/><i>État du projet & santé</i>"]
        B2["POST /api/chat-rag<br/><i>Q&A avec citations sources</i>"]
        B3["POST /api/new-event<br/><i>Analyse d'impact en temps réel</i>"]
        B4["POST /api/generate-briefing<br/><i>Notes de direction & comparaison</i>"]
    end

    %% Client Frontend UI
    subgraph FRONTEND ["5. TABLEAU DE BORD DYNAMIQUE (React 19 & Tailwind CSS)"]
        direction TB
        UI1["📊 Vue d'ensemble 360°<br/><i>Jauge de santé (78%), KPIs, jalons, finances</i>"]
        UI2["🌐 Cerveau & Graphe de Connaissances<br/><i>Topologie interactive des liens documents ↔ décisions</i>"]
        UI3["💬 Assistant RAG Interactif<br/><i>Questions en langage naturel + badges de preuves</i>"]
        UI4["⚡ Simulateur d'Impact Défi 24h<br/><i>Mise à jour en 1 clic de la mémoire du projet</i>"]
        UI5["⚖️ Registre d'Audit & Contradictions<br/><i>Distinction vérité terrain vs historique caduc</i>"]
    end

    %% Flow connections
    F1 --> E1
    F2 --> E1
    F3 --> E1
    F4 --> E1
    F5 --> E1
    F6 --> E1
    F7 --> E1

    E1 --> E2
    E2 --> E3

    E3 --> R1
    E3 --> R2
    E3 --> R3
    E3 --> R4
    E2 --> R5

    R1 --> BACKEND
    R2 --> BACKEND
    R3 --> BACKEND
    R4 --> BACKEND
    R5 --> BACKEND

    B1 --> UI1
    B2 --> UI3
    B3 --> UI4
    B4 --> UI5
    BACKEND --> UI2
```

---

## 🔁 Diagramme de Séquence : Traitement de l'Événement Imprévu

Ce diagramme illustre le flux exact qui s'exécute lorsque vous recevez la nouvelle information surprise lors de la présentation finale :

```mermaid
sequenceDiagram
    autonumber
    actor Jury as 👨‍⚖️ Jury Défi 24h
    actor User as 👤 Vous (Présentateur)
    participant UI as 🖥️ Dashboard (React)
    participant API as ⚙️ Serveur Backend (Express)
    participant RAG as 🧠 Moteur RAG & IA (Gemini / Local)
    participant Store as 💾 Mémoire Active

    Jury->>User: Fournit la nouvelle information (ex: Audit de sécurité imposé)
    User->>UI: Saisit l'événement dans l'onglet "Nouvel Événement"
    User->>UI: Clique sur "Déclencher l'analyse d'impact"
    
    UI->>API: POST /api/new-event { titre, contenu, auteur }
    API->>Store: Ajoute le nouveau document au référentiel (ID: EVT-xxx)
    API->>RAG: Envoie l'événement + Baseline actuelle du projet (Planning, Décisions, Risques)
    
    Note over RAG: Analyse croisée & Calcul de delta
    RAG-->>API: Réponses aux 3 questions :<br/>1. Qu'est-ce qui change ?<br/>2. Quelles infos sont affectées ?<br/>3. Quelles actions immédiates ?
    
    API->>Store: Mute l'état global (nouveau statut, nouvelles actions)
    API-->>UI: Retourne l'impact structuré et le projet mis à jour
    
    UI->>UI: Met à jour le statut, les actions prioritaires, le graphe et le chat
    User-->>Jury: Présente l'analyse d'impact en direct (en moins de 30 secondes)
```

---

## 🛠️ Explication des 5 Étapes du Processus

### 1. Ingestion Multi-Sources
Le système n'est pas limité à un seul format de fichier. Il accepte et normalise :
* Les **courriels bruts (.eml)** avec extraction des expéditeurs et dates.
* Les **procès-verbaux et transcriptions audio (.txt)** pour capter les arbitrages verbaux.
* Les **billets Jira (.txt, .csv)** pour le suivi technique et les anomalies.
* Les **documents formels (.pdf, .xlsx, .md)** pour la charte, les plans de projet et les contrats.

### 2. Moteur de Détection des Conflits
Au lieu de simplement indexer des mots-clés comme un moteur de recherche classique, le système analyse la **validité temporelle** des informations :
* Il repère qu'une information dans un document initial (ex: la date du 30 octobre dans la Charte v1) a été **remplacée et invalidée** par une décision officielle postérieure (ex: la date du 28 novembre dans le comité du 10 septembre).
* Il détecte les **contradictions financières** (ex: la facture INV-003 réclame 14 500 $ pour un avenant mobile CR-04 qui n'a jamais été approuvé).

### 3. Justification par Citations Sourcées (Anti-Hallucination)
Toute réponse fournie par l'Assistant RAG s'accompagne d'une **preuve documentaire vérifiable** :
* Nom exact du fichier source.
* Citation textuelle entre guillemets.
* Niveau de validité opérationnelle (Valide, Obsolète ou En attente).

### 4. Réacteur d'Événement en Direct
Conçu spécialement pour la règle clé du Défi 24h :
* Le système ne nécessite pas de recompiler ou de redémarrer le serveur.
* L'événement est absorbé en temps réel en mémoire active.
* Les 3 réponses attendues par les juges sont générées avec précision.

### 5. Interface Décisionnelle
La barre latérale épurée donne un accès immédiat aux différentes vues :
* **Vue d'ensemble :** Pilotage exécutif et métriques clés.
* **Cerveau & Graphe :** Compréhension visuelle des dépendances documentaires.
* **Assistant RAG :** Dialogue naturel pour interroger le projet.
* **Registre des Décisions :** Traçabilité et conformité d'audit.
