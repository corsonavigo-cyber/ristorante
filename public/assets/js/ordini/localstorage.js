// riprendere una bozza dopo un refresh o una navigazione tra pagine.

import { state, CHIAVE_ORDINE, svuotaStato } from './variabilistato.js';
import { caricaOrdiniOggi } from '../tavoli/tavoli-ordine.js'; // wrapper apiGet su ?type=oggi

export function salvaOrdine(id_ordine, salvaTavoli = true) {
    const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
        .map(el => parseInt(el.value));

    if (salvaTavoli) state.tavoliInUso = tavoliSelezionati;

    const step = document.getElementById('secondo-step').classList.contains('hider') ? 1 : 2;
    const ordine = {
        id_ordine,
        step,
        comanda: state.comanda,
        tavoli: salvaTavoli ? tavoliSelezionati : state.tavoliInUso
    };

    localStorage.setItem(CHIAVE_ORDINE, JSON.stringify(ordine));
}

export function leggiOrdineSalvato() {
    try {
        const json = localStorage.getItem(CHIAVE_ORDINE);
        return json ? JSON.parse(json) : null;
    } catch {
        svuotaStato();
        return null;
    }
}

// Ripristina lo stato da localStorage, senza verificare nulla lato server.
// Usata quando sai già che l'ordine in bozza è ancora valido (es. dopo un
// controllo posti tavolo appena fatto).
export function ripristinaOrdineLocale() {
    const ordine = leggiOrdineSalvato();
    if (!ordine) return false;

    state.comanda = ordine.comanda ?? [];
    state.idOrdineInserito = ordine.id_ordine ?? null;
    state.tavoliInUso = ordine.tavoli ?? [];
    return Number(ordine.step) === 2;
}

// Ripristina lo stato controllando prima che l'ordine esista ancora nel DB:
// se è stato cancellato/evaso lato server, pulisce la bozza locale invece
// di far ripartire l'utente da uno stato incoerente.
export async function ripristinaOrdine() {
    const ordine = leggiOrdineSalvato();

    if (!ordine) {
        return false;
    }

    const ordiniOggi = await caricaOrdiniOggi();

    const esiste = ordiniOggi.some(
        o => Number(o.id_ordine) === Number(ordine.id_ordine)
    );

    if (!esiste) {
        svuotaStato();
        return false;
    }

    return ripristinaOrdineLocale();
}

export function svuotaOrdineSalvato() {
    svuotaStato(); // azzera sia lo state in memoria sia il localStorage, un solo punto (vedi nota su state.js)
}