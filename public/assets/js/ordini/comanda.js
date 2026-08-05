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
    quantita,
    note = ""
) {

    const indice = trovaVoce(idItem);
    const item = recuperaItem(idItem);

    if (!item) {
        console.warn("Item non trovato", idItem);
        return;
    }

    if (quantita <= 0) {

        if (indice !== -1) {
            state.comanda.splice(indice, 1);
        }

    } else {

        const elemento = recuperaAnagrafica(tipo, id);

        if (elemento) {
            nome = elemento.nome;
            prezzo = elemento.prezzo;
        }

        if (indice !== -1) {

            state.comanda[indice].quantita = quantita;
            state.comanda[indice].note = note;

        } else {

            state.comanda.push({

                id_item: item.id_item,
                tipo: item.tipo,
                categoria: item.categoria,

                nome: item.nome,

                prezzo: Number(item.prezzo),

                id_momento: state.momentoAttivo,

                quantita,

                note,

                id_ordine: state.idOrdineInserito

            });

        }

    }

    salvaOrdine(state.idOrdineInserito, false);

    disegnaPreComanda();

    aggiornaInputPerNuovoMomento();

    console.log(state.comanda);

}

export function aggiornaInputPerNuovoMomento() {

    state.comanda.forEach(voce => {

        if (
            Number(voce.id_momento) !==
            Number(state.momentoAttivo)
        ) {
            return;
        }

        const input = document.querySelector(
            ` [data-id="${voce.id_item}"][data-tipo="${voce.tipo}"]`
        );

        const note = document.querySelector(
            ` [data-id="${voce.id_item}"][data-tipo="${voce.tipo}"].note,  [data-id="${voce.id_item}"][data-tipo="${voce.tipo}"].note-bev`
        );

        const display = document.querySelector(
            `#quantita-comment-${voce.id_item}`
        );

        if (input) {
            input.value = voce.quantita;
        }

        if (note) {
            note.value = voce.note;
        }

        if (display) {
            display.innerHTML =
                `<strong>${voce.quantita}</strong>`;
        }

    });

}
function trovaVoce(idItem, momento = state.momentoAttivo) {

    return state.comanda.findIndex(voce =>

        Number(voce.id_item) === Number(idItem) &&
        Number(voce.id_momento) === Number(momento)

    );

}
export function eliminaVoce(idItem) {

    state.comanda = state.comanda.filter(voce =>

        !(
            Number(voce.id_item) === Number(idItem) &&
            Number(voce.id_momento) === Number(state.momentoAttivo)
        )

    );

}

export async function ripristinaQuantitaComanda() {

    await precaricaItemsForm();

    aggiornaInputPerNuovoMomento();

    disegnaPreComanda();

}

function renderVoce(voce) {

    return `
        <li
            data-id="${voce.id}"
            class="voce-trascinabile">

            <span class="badge-item badge-${voce.tipo}">
    ${voce.tipo}
</span>

${voce.nome}
            ×
            ${voce.quantita}

            —

            ${voce.prezzo} €

            ${voce.note || ""}

        </li>
    `;

}

export function disegnaPreComanda() {

    const contenitore =
        document.getElementById("riassunto-ordine");

    if (!contenitore) {
        return;
    }

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

    contenitore.innerHTML =
        Object.entries(raggruppati)
            .map(([momento, voci]) => `

<h3>${NOMI_MOMENTI[momento] ?? momento}</h3>

<ul
    class="lista-momento"
    data-momento-id="${momento}">

    ${voci.map(renderVoce).join("")}

</ul>

`)
            .join("<br>");

}

export function totaleComanda(){

    return state.comanda.reduce(

        (tot,v)=>
            tot+(v.prezzo*v.quantita),

        0

    );

}