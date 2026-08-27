import {
    apiGet,
    apiPost,
    apiPatch
} from '../apigeneric.js';

const API_ORDINI = '/ristorante/api/ordini.php';

function leggiNumeroPersone() {
    const input = document.getElementById('numero-persone');
    const numeroPersone = Number.parseInt(input?.value, 10);

    if (!Number.isInteger(numeroPersone) || numeroPersone <= 0) {
        throw new Error('Inserisci un numero di persone valido.');
    }

    return numeroPersone;
}

function leggiTavoliSelezionati() {
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
    return apiPost(`${API_ORDINI}?type=stampa`, {
        id_ordine: Number(idOrdine),
        voci
    });
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


export async function stampaOrdine(idOrdine) {
    if (!Number.isInteger(Number(idOrdine))) {
        throw new Error('ID ordine non valido.');
    }
    await inserisciOrdineStato(idOrdine, 2); // Aggiorna lo stato dell'ordine a "stampa" (id_stato = 2)
    return apiPost(`${API_ORDINI}?type=stampa`, { id_ordine: idOrdine});
}

export async function creaOrdineConTavoli() {
    const tavoli = leggiTavoliSelezionati();
    const idOrdine = await inserisciOrdine();

    await inserisciOrdineStato(idOrdine);
    await inserisciOrdineTavolo(idOrdine, tavoli);

    return idOrdine;
}