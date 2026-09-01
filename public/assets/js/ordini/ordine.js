import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from '../apigeneric.js';

const API_ORDINI = '/ristorante/api/ordini.php';

function leggiNumeroPersone() {
    const input = document.getElementById('numero-persone');
    const numeroPersone = Number.parseInt(input?.value, 10);

    if (!Number.isInteger(numeroPersone) || numeroPersone <= 0) {
        throw new Error('Inserisci un numero di persone valido.');
    }

    return numeroPersone;
}

// api-ordini.js

export async function eliminaItemComanda(idComandaDettaglio) {
    if (!Number.isInteger(Number(idComandaDettaglio))) {
        throw new Error('ID voce comanda non valido.');
    }
    return apiDelete(API_ORDINI, {
        type: 'item_momento',
        id: Number(idComandaDettaglio)
    });
}

export async function aggiornaQuantitaItem(idOrdine, idComandaDettaglio, idMomento, quantita, note = '') {
    if (!Number(idOrdine)) {
        throw new Error('ID ordine non valido.');
    }
    if (!Number.isInteger(Number(idComandaDettaglio)) || !Number.isInteger(Number(idMomento))) {
        throw new Error('ID voce o momento non validi.');
    }
    if (!Number.isInteger(Number(quantita)) || Number(quantita) <= 0) {
        throw new Error('Quantità non valida.');
    }
    return apiPut(
        `${API_ORDINI}?type=item_quantita_momento`,
        {},
        {
            id_ordine: Number(idOrdine),
            id_comanda_dettaglio: Number(idComandaDettaglio),
            id_momento: Number(idMomento),
            quantita: Number(quantita),
            note: (note ?? '').toString().trim()
        }
    );
}

export async function aggiornaComandaNelDb(idOrdine, state) {
    if (!Number.isInteger(Number(idOrdine)) || Number(idOrdine) <= 0) {
        throw new Error('ID ordine non valido.');
    }

    // normalizza: se è un oggetto con chiavi numeriche, lo converte in array
    const comanda = Array.isArray(state.comanda)
        ? state.comanda
        : Object.values(state.comanda ?? {});
    console.log('aggiornaComandaNelDb chiamato con idOrdine:', idOrdine, 'comanda:', comanda);
    if (!Array.isArray(state.comanda) || state.comanda.length === 0) {
        throw new Error('La comanda deve essere un array non vuoto.');
    }

    const response = await apiPut(
    API_ORDINI,        
    {},                
    {
        id_ordine: Number(idOrdine),
        numero_persone: state.numeroPersone,
        tavoli: state.tavoliInUso.map(Number),
        comanda: state.comanda
    },
    'comanda'          
);

    if (!response.ok) throw new Error(`Errore HTTP ${response.status}`);

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Errore durante l\'aggiornamento della comanda.');

    return data;
}

export function leggiTavoliSelezionati() {
    const tavoli = [
        ...document.querySelectorAll(
            'input[name="tavoliSelezionati[]"]:checked'
        )
    ].map(input => Number(input.value));

    if (tavoli.length === 0) {
        throw new Error('Seleziona almeno un tavolo.');
    }

    return tavoli;
}

export async function inserisciOrdine() {
    const numeroPersone = leggiNumeroPersone();

    return apiPost(`${API_ORDINI}?type=ordine`, {
        numero_persone: numeroPersone
    });
}

export async function inserisciOrdineStato(idOrdine, idStato = 1) {
    if (!Number.isInteger(Number(idOrdine))) {
        throw new Error('ID ordine non valido.');
    }

    return apiPost(`${API_ORDINI}?type=stato`, {
        id_ordine: Number(idOrdine),
        id_stato: Number(idStato)
    });
}

export async function inserisciOrdineTavolo(idOrdine, tavoli = leggiTavoliSelezionati()) {
    if (!Number.isInteger(Number(idOrdine))) {
        throw new Error('ID ordine non valido.');
    }

    if (!tavoli.every(id => Number.isInteger(Number(id)) && Number(id) > 0)) {
     throw new Error('Tavoli selezionati non validi.');
    }

    return apiPost(`${API_ORDINI}?type=tavolo`, {
        id_ordine: Number(idOrdine),
        tavoli: tavoli.map(Number)
    });
}

export async function inserisciItemOrdine(
    idOrdine,
    comanda) {
    console.log('inserisciItemOrdine chiamato con idOrdine:', idOrdine,typeof(idOrdine), 'comanda:', comanda);
    if (!Number(idOrdine)) {
        throw new Error('ID ordine non valido.');
    }
    if (!Array.isArray(comanda) || comanda.length === 0) {
        throw new Error('La comanda non contiene elementi.');
    }
 // validazione di ogni voce prima dell'invio, coerente col check lato Service
    const voci = comanda.map((voce, i) => {
        if (
            !Number.isInteger(Number(voce.id_item)) ||
            !Number.isInteger(Number(voce.id_momento))
        ) {
            throw new Error(`Voce ${i + 1} non valida.`);
        }
        if (!Number.isInteger(Number(voce.quantita)) || Number(voce.quantita) <= 0) {
            throw new Error(`Quantità non valida alla voce ${i + 1}.`);
        }
        return {
            id_item: Number(voce.id_item),
            id_momento: Number(voce.id_momento),
            quantita: Number(voce.quantita),
            note: (voce.note ?? '').toString().trim() // ?? evita "null"/"undefined" come stringa
        };
    });

    // singola chiamata : atomica lato server (transazione), no invii paralleli
    return insersciRelazioneOrdineItem(idOrdine, voci);
}

async function insersciRelazioneOrdineItem(idOrdine, voci) {
    return apiPost(`${API_ORDINI}?type=item`, {   // <-- manca "return"
        id_ordine: Number(idOrdine),
        voci
    });
}

// Sposta l'intero ordine da un momento all'altro (PUT type=momento)
export async function aggiornaMomentoOrdine(idOrdine, idMomentoVecchio, idMomentoNuovo) {
    if (![idOrdine, idMomentoVecchio, idMomentoNuovo].every(v => Number.isInteger(Number(v)))) {
        throw new Error('Parametri momento non validi.');
    }
    return apiPut(
        `${API_ORDINI}?type=momento`,
        {}, // nessun id in querystring richiesto, il PHP legge tutto dal body
        {
            id_ordine: Number(idOrdine),
            id_momento_vecchio: Number(idMomentoVecchio),
            id_momento_nuovo: Number(idMomentoNuovo)
        }
    );
}

// Sposta un singolo item di comanda in un altro momento (PUT type=item_momento)
export async function aggiornaMomentoItem(idOrdine, idComandaDettaglio, idMomento) {
    if (![idOrdine, idComandaDettaglio, idMomento].every(v => Number.isInteger(Number(v)))) {
        throw new Error('Parametri item/momento non validi.');
    }
    return apiPut(
        `${API_ORDINI}?type=item_momento`,
        {},
        {
            id_ordine: Number(idOrdine),
            id_comanda_dettaglio: Number(idComandaDettaglio),
            id_momento: Number(idMomento)
        }
    );
}



export async function cambiaOrdineDalTavolo(idOrdine, tavoli = leggiTavoliSelezionati()) {
    if (!Number.isInteger(Number(idOrdine))) {
        throw new Error('ID ordine non valido.');
    }

    return apiPatch(
        `${API_ORDINI}?type=tavolo`,
        { id: Number(idOrdine) },
        {
            id_ordine: Number(idOrdine),
            tavoli: tavoli.map(Number)
        }
    );
}

export async function caricaOrdine(idOrdine) {
    if (!Number.isInteger(Number(idOrdine))) {
        throw new Error('ID ordine non valido.');
    }

    return apiGet(API_ORDINI, {
        type: 'ordine',
        id: Number(idOrdine)
    });
}


export async function stampaOrdine(idOrdine, isModifica = false) {
    if (!Number.isInteger(Number(idOrdine))) {
        throw new Error('ID ordine non valido.');
    }
    return apiPost(`${API_ORDINI}?type=stampa`, {
        id_ordine: idOrdine,
        modifica: isModifica
    });
}

export async function creaOrdineConTavoli() {
    const tavoli = leggiTavoliSelezionati();
    const idOrdine = await inserisciOrdine();

    await inserisciOrdineStato(idOrdine);
    await inserisciOrdineTavolo(idOrdine, tavoli);

    return idOrdine;
}