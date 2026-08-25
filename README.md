Gestionale Ristorante — Developer Documentation
1. Scopo del progetto

Gestionale web per la gestione operativa di un ristorante.

Le funzionalità principali comprendono:

gestione dei tavoli;
gestione del menu;
gestione di piatti, bevande e allergeni;
gestione delle prenotazioni;
gestione degli ordini;
gestione dei momenti del servizio;
gestione del conto e dello scontrino.

Questa documentazione è destinata agli sviluppatori che devono comprendere, manutenere o estendere il progetto.

2. Stack tecnologico
Backend
PHP
MariaDB
PDO
Composer
PHP dotenv
API HTTP/REST
Frontend
HTML
CSS
JavaScript ES Modules
Fetch API
LocalStorage
Ambiente di sviluppo
Apache
Linux/WSL Ubuntu
MariaDB
VS Code
Git
3. Architettura generale

Il progetto separa frontend, API, logica applicativa, accesso ai dati e database.

flowchart TD
    U[Browser / Operatore]
    JS[JavaScript Modules]
    API[PHP API]
    S[Service Layer]
    R[Repository Layer]
    DB[(MariaDB)]

    U --> JS
    JS --> API
    API --> S
    S --> R
    R --> DB
    DB --> R
    R --> S
    S --> API
    API --> JS
    JS --> U
Flusso principale
Browser
   ↓
JavaScript
   ↓
PHP API
   ↓
Service
   ↓
Repository
   ↓
PDO
   ↓
MariaDB

La risposta percorre il percorso inverso fino al frontend.

4. Architettura backend

Il backend utilizza principalmente il pattern Service Layer + Repository Pattern.

API endpoint
     │
     ▼
Service
     │
     ▼
Repository
     │
     ▼
PDO / Database
API

Il livello API è responsabile della comunicazione HTTP:

ricezione dei parametri;
validazione iniziale;
invocazione del Service;
costruzione della risposta HTTP;
gestione degli errori a livello endpoint.
Service

Il Service contiene la logica applicativa e coordina le operazioni necessarie per completare un caso d'uso.

Esempi:

gestione tavoli;
gestione item del menu;
gestione ordini;
gestione prenotazioni.
Repository

Il Repository è responsabile dell'accesso ai dati.

Le query SQL devono rimanere concentrate nel livello Repository, evitando di distribuire la logica SQL negli endpoint o nei Service.

5. Architettura frontend

Il frontend utilizza JavaScript ES Modules e uno stato applicativo centralizzato.

Un esempio dello stato utilizzato per la gestione degli ordini:

export const state = {
    comanda: [],
    items: [],
    momenti: [],
    tavoliInUso: [],
    momentoAttivo: 1,
    idOrdineInserito: null,
    confirmGiaChiesto: false
};

Il flusso generale è:

flowchart TD
    E[Evento utente]
    H[Event Handler]
    S[State]
    A[API]
    R[Rendering]
    D[DOM]
    L[LocalStorage]

    E --> H
    H --> S
    S --> R
    R --> D
    S --> L
    H --> A
    A --> S

Lo stato rappresenta la situazione corrente dell'applicazione e viene utilizzato dalle funzioni di rendering per aggiornare il DOM.

6. Principali moduli JavaScript
Modulo	Responsabilità
apigeneric.js	Comunicazione generica con le API
variabilistato.js	Stato applicativo condiviso
items.js	Recupero e rendering degli item
comanda.js	Gestione della comanda
ordine.js	Gestione dell'ordine
momenti.js	Gestione dei momenti del servizio
localstorage.js	Persistenza locale dell'ordine
tavoli-ordine.js	Gestione dei tavoli associati all'ordine
visualizzaordine.js	Visualizzazione dell'ordine
dragdrop.js	Gestione delle interazioni drag & drop

I moduli devono mantenere responsabilità specifiche, evitando di trasformare un singolo modulo in un contenitore di logica non correlata.

7. Gestione degli ordini

La comanda è rappresentata nello stato applicativo:

state.comanda

Ogni voce della comanda è associata concettualmente a:

item;
quantità;
momento del servizio;
eventuale nota.

Il flusso tipico è:

flowchart TD
    A[Utente modifica quantità o nota]
    B[gestisciInputGlobali]
    C[Controllo momento]
    D[aggiornaVoceComanda]
    E[state.comanda]
    F[salvaOrdine]
    G[LocalStorage]
    H[disegnaPreComanda]
    I[DOM]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    E --> H
    H --> I

La modifica dello stato deve precedere il rendering, in modo che il DOM rappresenti lo stato corrente dell'applicazione.

8. API

Gli endpoint PHP costituiscono il punto di ingresso del backend.

Esempi utilizzati dal progetto:

/api/tavoli.php
/api/menu.php
/api/prenotazioni.php
/api/ordini.php

Esempio di richiesta al menu:

GET /api/menu.php?type=menu&in_menu=si

Il frontend utilizza un modulo API dedicato per evitare di duplicare la logica fetch nei diversi moduli applicativi.

9. Database

Il database utilizzato è MariaDB.

Le principali aree funzionali comprendono:

Tavoli
 └── Ordini
      ├── Dettagli ordine cucina
      └── Dettagli ordine bar

Menu
 ├── Piatti
 ├── Bevande
 ├── IVA
 └── Allergeni

Prenotazioni
 └── Tavoli

Le relazioni tra le entità vengono gestite tramite:

chiavi primarie;
chiavi esterne;
tabelle di associazione;
vincoli relazionali.
Alias SQL

Le query che utilizzano più tabelle devono qualificare le colonne quando esiste il rischio di ambiguità.

Esempio:

WHERE item_menu.id_iva = :id_iva

invece di:

WHERE id_iva = :id_iva

quando più tabelle della query possiedono una colonna id_iva.

10. Gestione degli errori

Gli errori devono essere diagnosticati seguendo il percorso completo della richiesta:

Browser
   ↓
JavaScript
   ↓
HTTP Request
   ↓
PHP API
   ↓
Service
   ↓
Repository
   ↓
SQL
   ↓
MariaDB

Un errore visualizzato nel browser non implica necessariamente che la causa sia nel frontend.

Errore	Possibile area
ReferenceError	JavaScript / import / export
HTTP 400	Parametri o validazione
HTTP 404	Endpoint o risorsa
HTTP 500	Backend
PDOException	Database / query
SQLSTATE	SQL, vincoli o dati

La documentazione di debugging deve distinguere sempre:

Sintomo
Causa
Diagnosi
Soluzione
11. Principi di manutenzione
Separazione delle responsabilità

Ogni componente deve avere una responsabilità definita.

Evitare, ad esempio:

query SQL direttamente nel JavaScript;
logica applicativa complessa negli endpoint;
manipolazione estesa del DOM nei moduli API;
duplicazione della stessa logica in più moduli.
Stato come fonte del rendering

Quando una funzionalità dipende dallo stato applicativo, la sequenza preferibile è:

Modifica stato
    ↓
Persistenza se necessaria
    ↓
Rendering

anziché modificare direttamente elementi DOM senza aggiornare lo stato.

API centralizzata

Le chiamate HTTP devono passare dal modulo API condiviso quando possibile.

Questo riduce:

duplicazione;
errori nella costruzione delle richieste;
difficoltà di manutenzione;
differenze comportamentali tra moduli.
12. Estensione del progetto

Per aggiungere una nuova funzionalità backend, il flusso consigliato è:

Database
   ↓
Repository
   ↓
Service
   ↓
API endpoint
   ↓
API JavaScript
   ↓
State
   ↓
Rendering
   ↓
Event handling

Non tutti i casi richiedono necessariamente ogni livello, ma una nuova funzionalità deve rispettare le responsabilità già presenti nell'architettura.

13. Struttura della documentazione

La documentazione completa è organizzata nelle seguenti aree:

docs/
├── README.md
│
├── architecture/
│   ├── overview.md
│   ├── backend.md
│   ├── frontend.md
│   └── data-flow.md
│
├── backend/
│   ├── api.md
│   ├── services.md
│   ├── repositories.md
│   ├── database.md
│   └── error-handling.md
│
├── frontend/
│   ├── modules.md
│   ├── state-management.md
│   ├── api-client.md
│   ├── events.md
│   ├── rendering.md
│   └── local-storage.md
│
├── features/
│   ├── tavoli.md
│   ├── menu.md
│   ├── prenotazioni.md
│   └── ordini.md
│
├── database/
│   ├── schema.md
│   └── relationships.md
│
├── api/
│   ├── tavoli.md
│   ├── menu.md
│   ├── prenotazioni.md
│   └── ordini.md
│
├── debugging/
│   ├── common-errors.md
│   ├── javascript.md
│   ├── php.md
│   └── sql.md
│
└── development/
    ├── setup.md
    ├── adding-feature.md
    └── coding-conventions.md
14. Obiettivo della documentazione

La documentazione deve permettere a uno sviluppatore di:

comprendere l'architettura senza leggere tutto il codice;
individuare rapidamente dove implementare una modifica;
seguire il flusso dei dati;
comprendere le responsabilità dei diversi livelli;
diagnosticare gli errori;
aggiungere funzionalità senza introdurre duplicazioni o dipendenze improprie;
comprendere le decisioni architetturali del progetto.
15. Pattern architetturali utilizzati
Service Layer

Centralizza la logica applicativa e separa i casi d'uso dalla gestione HTTP e dall'accesso ai dati.

Repository Pattern

Incapsula l'accesso al database e le query SQL.

ES Modules

Suddivide il codice JavaScript in moduli con responsabilità specifiche e dipendenze esplicite.

Centralized State

Mantiene lo stato applicativo in una struttura condivisa, utilizzata dalle funzioni che modificano e renderizzano l'interfaccia.

Event Delegation

Gli eventi possono essere gestiti a livello di elemento padre, riducendo la necessità di registrare listener individuali sugli elementi dinamici.

16. Principio generale

Il principio architetturale di riferimento è:

Una responsabilità → un componente

UI
 ↓
Interazione
 ↓
Stato
 ↓
API
 ↓
Business Logic
 ↓
Data Access
 ↓
Database

Ogni modifica al progetto dovrebbe preservare questa separazione, salvo motivazioni tecniche documentate.