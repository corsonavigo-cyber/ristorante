import { apiGet } from '../apigeneric.js';


export async function generaScontrino(idOrdine, totale, dettagli) {

    const id = Number(idOrdine);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('ID ordine non valido.');
    }

    return apiPost(
        `${API_SCONTRINO}?type=nuovo_scontrino`,
        {
            id_ordine: id,
            totale: Number(totale),
            dettagli
        }
    );
}

export async function stampaScontrino(idScontrino) {

    const id = Number(idScontrino);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('ID scontrino non valido.');
    }

    return apiPost(
        `${API_SCONTRINO}?type=stampa_scontrino`,
        {
            id_scontrino: id
        }
    );
}

export async function recuperaScontrinoAttivo(idOrdine) {
    if (!Number.isInteger(Number(idOrdine)) || Number(idOrdine) <= 0) {
        throw new Error('ID ordine non valido.');
    }

    return apiGet(API_SCONTRINO, {
        type: 'scontrino_dettaglio',
        id: parseInt(idOrdine)
    });
}