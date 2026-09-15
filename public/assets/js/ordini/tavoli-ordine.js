import { apiGet, apiPost, apiPatch } from '../apigeneric.js';
import { state } from './variabilistato.js';
import { mostraAvviso } from '../tavoli/utils.js';

export function caricaOrdiniOggi() {
    return apiGet( API_ORDINI, { type: 'oggi' });
}
export async function controllaTavoloDisponibile(tavoliSelezionati = []) {

    const avviso = document.getElementById("avviso");
    const sezione = document.querySelector("#controllo");

    if (!Array.isArray(tavoliSelezionati) || tavoliSelezionati.length === 0) {
        mostraAvviso(sezione, avviso, "Seleziona almeno un tavolo.");
        return false;
    }

    // Controllo capienza
    if (!controllaPostiOrdineTavolo(tavoliSelezionati)) {
        return false;
    }

    const ordiniOggi = await caricaOrdiniOggi();

    const conflitto = ordiniOggi.some(o => {

        if (Number(o.id_ordine) === Number(state.idOrdineInserito)) {
            return false;
        }
        console.log(tavoliSelezionati, o.id_tavoli);
        console.log("Controllo tavoli selezionati vs tavoli ordine:", {
            tavoliSelezionati,
            tavoliOrdine: o.id_tavoli
        });
        const tavoliOrdine = String(o.id_tavoli)
            .split(",")
            .map(id => parseInt(id.trim(), 10));

        return tavoliSelezionati.some(id => o.id_tavoli.includes(id));
    });

    if (conflitto) {
        mostraAvviso(sezione, avviso, "Questo tavolo ha già un ordine attivo!");
        return false;
    }

    mostraAvviso(sezione, avviso, "", true);
    return true;
}
export async function precaricaTavoliForm() {
    // legge tavoli
    const risposta = await fetch(`${API}`);
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento
    
    const lavagna = document.getElementById('tavoli_checkbox');
   
    const id_tavolo_arrivato_url= new URLSearchParams(window.location.search).get('id');
    const prenotazione = new URLSearchParams(window.location.search).get('id_prenotazione')? new URLSearchParams(window.location.search).get('id_prenotazione'):null;
    
    if(id_tavolo_arrivato_url && state.confirmGiaChiesto){
        await controllaPostiTavoloDisponibili();
        return;
    }
    let htmlFormTavoli = '<select name="tavoliSelezionati[]"  size="6" multiple><option value="">Seleziona i tavoli</option>';
    data.forEach(tavolo => {
        htmlFormTavoli += `<option id="${tavolo.id_tavolo}" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}</option>`
    });
    htmlFormTavoli += '</select>';

   lavagna.innerHTML = htmlFormTavoli;

    //lavagna.innerHTML = data.map(tavolo => `
    //   <li><label><input type="checkbox" name="tavoliSelezionati[]" id="id_${tavolo.id_tavolo}" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}</label></li>`).join('');
    //console.log("ID Tavolo arrivato dall'URL:", parseInt(id_tavolo_arrivato_url));
    if(prenotazione){
        const prenotazione_tavoli = await apiGet(API_PRENOTAZIONI, { type: 'prenotazioni', id: prenotazione });
        selezionatavolo(prenotazione_tavoli.id_tavoli );

    }else{
        selezionatavolo(parseInt(id_tavolo_arrivato_url));
    }
    
}


export function controllaPostiOrdineTavolo(tavoliSelezione) {
    const avviso = document.getElementById("avviso1");
    const sezione = document.querySelector('#controllo1');

    const select = document.querySelector('select[name="tavoliSelezionati[]"]');

    const postiTotali = tavoliSelezione.reduce((acc, id) => {
        const option = select?.querySelector(`option[value="${id}"]`);
        return acc + (parseInt(option?.dataset.posti, 10) || 0);
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

    const select = document.querySelector('select[name="tavoliSelezionati[]"]');
    if (!select) return;

    // scorre le option e imposta .selected solo su quella che matcha l'id arrivato da URL
    let optionSelezionata = null;
    select.querySelectorAll('option').forEach(option => {
        const match = parseInt(idTavoloArrivatoUrl) === parseInt(option.value);
        option.selected = match;
        if (match) optionSelezionata = option;
    });

    if (!optionSelezionata) return;
    document.getElementById('numero-persone').value = optionSelezionata.dataset.posti;
}

export function inserisciOrdineTavolo(id_ordine, tavoli) {
    return apiPost(`${ API_ORDINI}?type=tavolo`, { id_ordine, tavoli });
}

export function cambiaOrdineDalTavolo(id_ordine, tavoli) {
    return apiPatch(`${ API_ORDINI}?type=tavolo`, { id_ordine }, { id_ordine, tavoli });
}