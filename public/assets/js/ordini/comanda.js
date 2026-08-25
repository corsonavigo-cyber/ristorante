// comanda.js

import { state } from "./variabilistato.js";
import { salvaOrdine } from "./localstorage.js";
import {
    precaricaItemsForm
} from "./items.js";

const NOMI_MOMENTI = {
    1: "ANTIPASTO",
    2: "PRIMO",
    3: "SECONDO",
    4: "DOLCI",
    5: "DA EVADERE SUBITO"
};



function recuperaItem(idItem) {

    return state.items.find(item =>
        Number(item.id_item) === Number(idItem)
    );

}

export function aggiornaVoceComanda(
    idItem,
    {
        idRelazioneItem = null,
        quantita,
        note = '',
        variazione
    } = {}
) {
    const item = recuperaItem(idItem);

    if (!item) {
        console.warn('Item non trovato', idItem);
        return;
    }

    let indice = idRelazioneItem
        ? state.comanda.findIndex(voce =>
            voce.id_relazione_item === idRelazioneItem
        )
        : -1;

    

    const quantitaAttuale = indice === -1
        ? 0
        : Number(state.comanda[indice].quantita);

    const nuovaQuantita = Number.isFinite(Number(variazione))
        ? quantitaAttuale + Number(variazione)
        : Number(quantita);
    //gestione eliminazione
 
    if (nuovaQuantita <= 0) {

        if (indice !== -1) {
            state.comanda.splice(indice, 1);
        }

    } else{
        if (indice !== -1) {
            state.comanda[indice].quantita = nuovaQuantita;
            state.comanda[indice].note = note;
        }else{
            //aggiungi nuova voce
            state.comanda.push({
                id_relazione_item: crypto.randomUUID(),
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
       }

     salvaOrdine(state.idOrdineInserito,false);
       disegnaPreComanda();
       aggiornaInputPerNuovoMomento();
}  


       

  
 

export function aggiornaInputPerNuovoMomento() {
    //resetta gli input  a 0
    const inputs = document.querySelectorAll(`[data-id][data-tipo]`);
    inputs.forEach(el => el.value = 0);
    //valori attuali

    state.comanda.forEach(voce => {

        if (Number(voce.id_momento) !== Number(state.momentoAttivo)) return;
    

        const input = document.querySelector(
            `[data-id="${voce.id_item}"][data-tipo="${voce.tipo}"]`
        );

        if(input){
            //somma totale 
        }

        const note = document.querySelector(
            `[data-id="${voce.id_item}"][data-tipo="${voce.tipo}"].note,
             [data-id="${voce.id_item}"][data-tipo="${voce.tipo}"].note-bev`
        );

        const display = document.querySelector(
            `#quantita-comment-${voce.id_item}`
        );

        // Somma di tutte le quantità dello stesso item nello stesso momento
        const quantitaTotale = state.comanda
            .filter(v =>
                Number(v.id_item) === Number(voce.id_item) &&
                Number(v.id_momento) === Number(state.momentoAttivo)
            )
            .reduce((tot, v) => tot + Number(v.quantita), 0);

        // Solo l'input "principale" mostra il totale
         if (input) {
            input.value = quantitaTotale;
            // Stampa l'attributo data-relazione dentro l'elemento HTML
            
        }

        const btn_meno = document.querySelector(
            `[data-id="${voce.id_item}"][data-tipo="${voce.tipo}"].sottrazione`
        );
        
        if (btn_meno) {
            btn_meno.setAttribute('data-relazione', voce.idRelazioneItem);
        }
        const btn_addizione =document.querySelector(
            `[data-id="${voce.id_item}"][data-tipo="${voce.tipo}"].addizione`
        );
        if (btn_addizione) {
            btn_addizione.setAttribute('data-relazione', voce.idRelazioneItem);
        }
        

        if (display) {
            display.innerHTML = `<strong>${quantitaTotale}</strong>`;
        }

    });

}

function trovaVoce(idItem, momento = state.momentoAttivo, note = '') {

    return state.comanda.findIndex(voce =>

        Number(voce.id_item) === Number(idItem) &&
        Number(voce.id_momento) === Number(momento) &&
        (voce.note ?? '') === (note ?? '')

    );

}
export function eliminaVoce(idRelazioneItem) {
    console.log('entrato elimana');
    console.log(idRelazioneItem);
    state.comanda = state.comanda.filter(
        voce => voce.id_relazione_item !== idRelazioneItem
    );
    console.log(state.comanda);
    salvaOrdine(state.idOrdineInserito, false);
    disegnaPreComanda();
    aggiornaInputPerNuovoMomento();
}

export async function ripristinaQuantitaComanda() {

    await precaricaItemsForm();

    aggiornaInputPerNuovoMomento();

    disegnaPreComanda();

}

function renderVoce(voce) {
    return `
        <li
            data-relazione="${voce.id_relazione_item}"
            data-id="${voce.id_item}"
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

            <button
                type="button"
                class="btn-elimina-voce"
                data-relazione="${voce.id_relazione_item}">
                ✕
            </button>

            <div class="controllo-quantita">

            <button
                type="button"
                class="sottrazione"
                data-id="${item.id_item}"
                data-tipo="${tipo}">
                −
            </button>

            <p
                type="number"
                class="quantita${tipo === 'bevanda' ? '-bevanda' : '-piatto'} quantita"
                data-id="${item.id_item}"
                data-tipo="${tipo}"
                data-relazione="${item.idRelazioneItem}"
                id="quantita${tipo === 'bevanda' ? '-bevanda-' : '-piatto-'}${item.id_item}"
                min="0"> 
                ${state.comanda.find(row => row.id_item === item.id_item)?.quantita || 0}
            </p>
            <button
                type="button"
                class="addizione"
                data-id="${item.id_item}"
                data-tipo="${tipo}">
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