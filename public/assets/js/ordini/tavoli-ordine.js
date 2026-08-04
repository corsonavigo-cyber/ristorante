import { apiGet, apiPost, apiPatch } from '../apigeneric.js';
import { config } from '../config.js';
import { state } from './variabilistato.js';
import { mostraAvviso } from '../utils.js';

export function caricaOrdiniOggi() {
    return apiGet( API_ORDINI, { type: 'oggi' });
}

export async function controllaTavoloDisponibile(tavoliSelezionati, ordine) {
    const avviso = document.getElementById("avviso");
    const sezione = document.querySelector('#controllo');

    if (tavoliSelezionati.length === 0) {
        mostraAvviso(sezione, avviso, "l'ordine ha bisogno di essere associato ad almeno un tavolo!");
        return false;
    }

    const ordiniOggi = await caricaOrdiniOggi();
    const tavoliGiaOccupati = ordiniOggi.filter(o =>
    Number(o.id_ordine) !== Number(state.idOrdineInserito) &&
    o.id_tavoli &&
    tavoliSelezionati.some(id => o.id_tavoli.includes(id))
    );

    if (!ordine) return tavoliGiaOccupati.length === 0;

    const stessiTavoli =tavoliSelezionati.length === ordine.tavoli.length && tavoliSelezionati.every(t => ordine.tavoli.includes(t));
    if (tavoliGiaOccupati.length > 0 || stessiTavoli) {
        // FIX: "stessiTavoli > 0" nell'originale confrontava un booleano con un numero (sempre falso) — ora è il booleano diretto
        mostraAvviso(sezione, avviso, "Questo tavolo ha già un ordine attivo!");
        return false;
    }

    return true;
}

export function controllaPostiOrdineTavolo(tavoliSelezione) {
    // FIX: sezione/avviso non erano definite nell'originale — mancava questo blocco
    const avviso = document.getElementById("avviso1");
    const sezione = document.querySelector('#controllo1');

    const postiTotali = tavoliSelezione.reduce((acc, id) => {
        const checkbox = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id}"]`);
        return acc + (parseInt(checkbox?.dataset.posti, 10) || 0);
    }, 0);

    const numeroPersone = parseInt(document.getElementById('numero-persone').value, 10);
    if (Number.isNaN(numeroPersone) || numeroPersone <= 0) {
        mostraAvviso(sezione, avviso, "Inserisci un numero di persone valido");
        return false;
    }

    if (numeroPersone > postiTotali) {
        mostraAvviso(sezione, avviso,
            `Hai bisogno di più tavoli per ${numeroPersone} persone, te ne mancano ${numeroPersone - postiTotali}. Se vuoi procedere comunque, premi inserisci.`);
        return false;
    }

    mostraAvviso(sezione, avviso, "", true);
    return true;
}

export function disattivaBottoneTavolo(tavoli) {
    if (!tavoli) return;
    tavoli.forEach(id_tavolo => {
        const checkbox = document.getElementById(`id_${id_tavolo}`);
        if (!checkbox) { console.warn(`Checkbox id_${id_tavolo} non trovata, salto`); return; } // FIX: guard mancante nell'originale
        checkbox.checked = false;
        checkbox.disabled = true;
    });
}

export function selezionatavolo(idTavoloArrivatoUrl) {
    if (!idTavoloArrivatoUrl) return;
    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
        checkbox.checked = parseInt(idTavoloArrivatoUrl) === parseInt(checkbox.value);
    });

    const checkboxSelezionata = document.querySelector(`input[name="tavoliSelezionati[]"][value="${idTavoloArrivatoUrl}"]`);
    if (!checkboxSelezionata) return;
    document.getElementById('numero-persone').value = checkboxSelezionata.dataset.posti;
}

export function inserisciOrdineTavolo(id_ordine, tavoli) {
    return apiPost(`${ API_ORDINI}?type=tavolo`, { id_ordine, tavoli });
}

export function cambiaOrdineDalTavolo(id_ordine, tavoli) {
    return apiPatch(`${ API_ORDINI}?type=tavolo`, { id_ordine }, { id_ordine, tavoli });
}