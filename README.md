# Gestionale Ristorante

Web app per la gestione operativa di un ristorante, dalla configurazione del menu alla gestione di ordini, comande, conti e scontrini.

## 📋 Indice
- [Scopo del progetto](#scopo-del-progetto)
- [Stack Tecnologico](#stack-tecnologico)
- [Architettura](#architettura)
- [Struttura del Progetto](#struttura-del-progetto)
- [Flussi Operativi](#flussi-operativi)
- [Manutenzione e Debugging](#manutenzione-e-debugging)
- [Convenzioni](#convenzioni)
- [Installazione](#-installazione)

---

## 🚀 Scopo del progetto
Il sistema permette di gestire il flusso operativo completo del ristorante:
- Gestione tavoli, prenotazioni e menu (piatti/bevande).
- Gestione allergeni, IVA e momenti del servizio.
- Gestione ordini, comande (cucina/bar) e stampa.
- Gestione conti, emissione scontrini, storni e storico.

## 🛠 Stack Tecnologico
### Backend
- **PHP** (con `declare(strict_types=1)`)
- **MariaDB**
- **PDO** (Database abstraction)
- **Composer** (Autoloading & Management)
- **PHP dotenv** (Configurazione ambiente)

### Frontend
- **HTML5 / CSS3**
- **JavaScript ES Modules**
- **Fetch API**
- **LocalStorage** (Persistenza temporanea stato)

### Ambiente
- **Apache**
- **Linux / WSL Ubuntu**

---

## 🏗 Architettura
Il progetto adotta una separazione netta delle responsabilità:
1. **API**: Gestione HTTP, validazione e JSON response.
2. **Service Layer**: Logica applicativa e coordinamento dei casi d'uso.
3. **Repository Pattern**: Accesso ai dati, query SQL e operazioni transazionali.

### Flusso Dati
`Browser` → `JavaScript` → `PHP API` → `Service` → `Repository` → `PDO` → `MariaDB`

---

## 📂 Struttura del Progetto
```text
ristorante/
├── composer.json
├── .env                   # (Non versionato)
├── .gitignore
├── public/                # Punto d'accesso Web
│   └── api/               # Endpoint API
├── src/                   # Backend (Logica)
│   ├── Services/
│   └── Repositories/
├── js/                    # Moduli JS (ES Modules)
├── css/                   # Stili
├── logs/                  # File di log e stampe
└── cache/                 # (Ignorato da Git)
````

## ⚡ Concetti Chiave

### Gestione Frontend (Stato)
Il rendering è guidato dallo stato (state).
- **Principio**: Evento → Handler → Modifica State → Persistenza → Rendering DOM.
- **Event Delegation**: utilizzata per gestire dinamicamente gli elementi (menu, comande).

### Gestione Comande
La comanda è organizzata per momenti (es. 1: Antipasto, 2: Primo, ecc.). L'identificatore `id_relazione_item` è fondamentale per distinguere varianti dello stesso prodotto nella stessa comanda.

### Modifiche Transazionali
Ogni modifica complessa alla comanda segue il pattern transazionale:
`BEGIN → Update → Delete/Insert → COMMIT` (o `ROLLBACK` in caso di errore).

---

## 🛠 Manutenzione e Debugging
Il sistema di logging e la struttura a livelli permettono di isolare i problemi:
- **Errori JS**: verificare `variabilistato.js` o i moduli specifici.
- **Errori API (HTTP 400/500)**: analizzare il Service o la Repository corrispondente.
- **Errori Database**: verificare i vincoli SQL e le `PDOException`.

**Debugging Workflow**: Sintomo → Causa → Diagnosi → Correzione → Verifica

---

## 🤝 Convenzioni
- **PHP**: utilizzare namespace, `strict_types=1`, query SQL confinate nei Repository.
- **JS**: utilizzare ES Modules, `async/await`, `apigeneric.js` per le chiamate API centralizzate.
- **CSS**: raggruppare per componenti, evitare selettori globali generici.

---

## 📦 Installazione
1. Clonare il repository.
2. Installare le dipendenze: `composer install`.
3. Configurare il file `.env` (copiando da `.env.example`).
4. Configurare il server web (Apache) puntando alla directory `public/`.
5. Importare lo schema del database (se presente in `/db`).