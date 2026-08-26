// comanda.js

import { state } from "./variabilistato.js";
import { salvaOrdine } from "./localstorage.js";


const NOMI_MOMENTI = {
    1: "ANTIPASTO",
    2: "PRIMO",
    3: "SECONDO",
    4: "DOLCI",
    5: "DA EVADERE SUBITO"
};



function recuperaItem(idItem) {
    console.log(state.items)
    return state.items.find(item =>
        Number(item.id_item) === Number(idItem)
    );

}

export function aggiornaVoceComanda(
    idItem,
    {
        idRelazioneItem = null,
        quantita = null, // se passi quantita specifica
        note = '',
        variazione = null // se passi +/- 1
    } = {}
) {
    const item = recuperaItem(idItem);

    if (!item) {
        console.warn('Item non trovato', idItem);
        return;
    }

    let indice = idRelazioneItem 
        ? state.comanda.findIndex(v => v.id_comanda_dettaglio === idRelazioneItem)
        : -1;
    //se non ci sono note e id relazione, significa che sto facendo un aggiunta rapida 
    if (indice === -1 && idRelazioneItem === null) {
        indice = state.comanda.findIndex(v => 
            Number(v.id_item) === Number(idItem) && (v.note || '') === note && Number(v.id_momento) === Number(state.momentoAttivo) &&
        (v.note || '') === note
        );
    }

    const quantitaAttuale = indice !== -1 ? Number(state.comanda[indice].quantita) : 0;
    const nuovaQuantita = (variazione !== null) ? (quantitaAttuale + variazione) : (quantita ?? 1);

    //gestione eliminazione
 
    if (nuovaQuantita <= 0) {

        if (indice !== -1) {
            state.comanda.splice(indice, 1);
        }

    } else if (indice !== -1) {
            state.comanda[indice].quantita = nuovaQuantita;
            if(note !== '' && note !== undefined) state.comanda[indice].note = note;
    }else{
            //aggiungi nuova voce
            state.comanda.push({
                id_comanda_dettaglio: crypto.randomUUID(),
                id_item:  item.id_item,
                tipo: item.tipo,
                nome: item.nome,
                prezzo: Number(item.prezzo),
                id_momento: state.momentoAttivo,
                quantita: nuovaQuantita,
                note: note,
                id_ordine: state.idOrdineInserito
            });
        }
       

     salvaOrdine(state.idOrdineInserito,false);
     disegnaPreComanda();
  
}   


 
export function eliminaVoce(idRelazioneItem) {
    console.log('entrato elimana');
    console.log(idRelazioneItem);
    state.comanda = state.comanda.filter(
        voce => voce.id_comanda_dettaglio !== idRelazioneItem
    );
    console.log(state.comanda);
    salvaOrdine(state.idOrdineInserito, false);
    disegnaPreComanda();
}


function renderVoce(voce) {
    return `
        <li
            data-relazione="${voce.id_comanda_dettaglio}"
            data-id="${voce.id_item}"
            data-momento="${voce.id_momento}"
            draggable="true">
            class="voce-trascinabile">

            <span class="badge-item badge-${voce.tipo}">
                ${voce.tipo}
            </span>

            ${voce.nome}
            ×
            ${voce.quantita}

            —

            ${voce.prezzo.toFixed(2)} €

            ${voce.note ? `<em>(${voce.note})</em>` : ""}

             <button type="button" class="btn-modifica-voce" 
                    data-relazione="${voce.id_comanda_dettaglio}" 
                    data-id="${voce.id_item}">
                ✏️
            </button>
            <button
                type="button"
                class="btn-elimina-voce"
                data-relazione="${voce.id_comanda_dettaglio}">
                ✕
            </button>

            <div class="controllo-quantita">

            <button
                type="button"
                class="sottrazione"
                data-id="${voce.id_item}"
                data-relazione="${voce.id_comanda_dettaglio}"
                data-tipo="${voce.tipo}">
                −
            </button>

            <span class="quantita-display">${voce.quantita}</span>

            <button
                type="button"
                class="addizione"
                data-id="${voce.id_item}"
                data-relazione="${voce.id_comanda_dettaglio}"
                data-tipo="${voce.tipo}">
                +
            </button>

            </div>

        </li>
    `;
}

export function disegnaPreComanda() {
    console.log('disegna precomanda');
    const contenitore = document.getElementById("riassunto-ordine");

    if (!contenitore) return;

    if (state.comanda.length === 0) {
        contenitore.innerHTML =
            "<li>Non hai ancora aggiunto nessun elemento</li>";
        return;
    }

    const raggruppati = state.comanda.reduce((acc, voce) => {

        if (!acc[voce.id_momento]) {
            acc[voce.id_momento] = [];
        }

        acc[voce.id_momento].push(voce);

        return acc;

    }, {});

    contenitore.innerHTML = Object.entries(raggruppati)

        .sort(([a], [b]) => Number(a) - Number(b))

        .map(([momento, voci]) => `
            <li class="titolo-momento">
                ${NOMI_MOMENTI[momento]}
            </li>

            ${voci.map(renderVoce).join("")}
        `)

        .join("");
}


export function totaleComanda() {

    const totaleCent = state.comanda.reduce(

        (totale, voce) =>
            totale +
            Math.round(Number(voce.prezzo) * 100) * Number(voce.quantita),

        0

    );

    return totaleCent / 100;
}