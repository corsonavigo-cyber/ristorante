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

    if (!Array.isArray(tavoli) || tavoli.length === 0) {
        throw new Error('Seleziona almeno un tavolo.');
    }

    return apiPost(`${API_ORDINI}?type=tavolo`, {
        id_ordine: Number(idOrdine),
        tavoli: tavoli.map(Number)
    });
}

export async function inserisciItemOrdine({
    idOrdine,
    idItem,
    idMomento,
    quantita,
    note = ''
}) {
    if (
        !Number.isInteger(Number(idOrdine)) ||
        !Number.isInteger(Number(idItem)) ||
        !Number.isInteger(Number(idMomento))
    ) {
        throw new Error('Dati dell elemento ordine non validi.');
    }

    if (!Number.isInteger(Number(quantita)) || Number(quantita) <= 0) {
        throw new Error('Quantità non valida.');
    }

    return apiPost(`${API_ORDINI}?type=item`, {
        id_ordine: Number(idOrdine),
        id_item: Number(idItem),
        id_momento: Number(idMomento),
        quantita: Number(quantita),
        note: String(note).trim()
    });
}

export async function inserisciComanda(idOrdine, comanda) {
    if (!Array.isArray(comanda) || comanda.length === 0) {
        throw new Error('La comanda non contiene elementi.');
    }

    return Promise.all(
        comanda.map(voce =>
            inserisciItemOrdine({
                idOrdine,
                idItem: voce.id_item,
                idMomento: voce.id_momento,
                quantita: voce.quantita,
                note: voce.note
            })
        )
    );
}

export async function cambiaOrdineDalTavolo(idOrdine, tavoli = leggiTavoliSelezionati()) {
    if (!Number.isInteger(Number(idOrdine))) {
        throw new Error('ID ordine non valido.');
    }

    return apiPatch(
        `${API_ORDINI}?type=tavolo`,
        { id_ordine: Number(idOrdine) },
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

export async function creaOrdineConTavoli() {
    const tavoli = leggiTavoliSelezionati();
    const idOrdine = await inserisciOrdine();

    await inserisciOrdineStato(idOrdine);
    await inserisciOrdineTavolo(idOrdine, tavoli);

    return idOrdine;
}