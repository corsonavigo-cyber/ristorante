import { apiGet } from "../apigeneric.js";
import { state } from "./variabilistato.js";

function aggiornaLinkFuoriMenu() {
    const link = document.getElementById("linkbev");
    if (!link) return;

    link.href = `nuovopiattofuorimenu.php?id=${state.idOrdineInserito ?? ""}`;
}

function separaItems(items) {
    return {
        piatti: items.filter(i => i.tipo === "piatto"),
        bevande: items.filter(i => i.tipo === "bevanda")
    };
}

export async function precaricaItemsForm(){
    aggiornaLinkFuoriMenu();
    
    state.items = await apiGet(
        API_MENU,
        {
            type: "menu",
            in_menu: "si"
        }
    );

    const { piatti, bevande } = separaItems(state.items);

    state.piatti = piatti;
    state.bevande = bevande;

    renderItems(piatti, "piatti_input", "piatto");
    renderItems(bevande, "bevande_input", "bevanda");

    aggiornaQuantitaItemsRenderizzati();
}

function renderItems(items, containerId, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items
        .map(item => renderItemCard(item, tipo))
        .join("");
}

function renderItemCard(item, tipo) {
    
    const allergeniText = item.nomi_allergeni ?? item.allergeni ?? item.lista_allergeni ?? "";

    return `

<div class="${tipo} ${tipo === 'bevanda' ? 'bevanda' : 'piatto'}">

<div
    class="btn-inserisci-${tipo}-ordine ${tipo === 'bevanda' ? 'ins-bevanda' : 'ins-piatto'}"
    id="nome-${tipo}${item.id_item}"
    data-id="${item.id_item}"
    data-nome="${item.nome}"
    data-tipo="${tipo}">

    <h3 class="comment">
        <b>${item.nome}</b>
    </h3>

    <p class="comment">
        ${item.descrizione}
    </p>

    <p class="comment" id="prezzo${tipo}${item.id_item}" data-prezzo="${item.prezzo}">
        Prezzo: ${item.prezzo} €
    </p>

</div>

<button
    type="button"
    class="btn-dettaglio"
    data-id="${item.id_item}"
    data-tipo="${tipo}">
    Dettagli
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

</div>

`;
}
function aggiornaQuantitaItemsRenderizzati() {

    const quantitaPerItem = new Map();

    state.comanda
        .filter(voce => Number(voce.id_momento) === Number(state.momentoAttivo))
        .forEach(voce => {

            const key = `${voce.tipo}-${voce.id_item}`;

            quantitaPerItem.set(
                key,
                (quantitaPerItem.get(key) ?? 0) + Number(voce.quantita)
            );

        });

    quantitaPerItem.forEach((quantita, key) => {

        const display = document.getElementById(`quantita-${key}`);

        if (display) {
            display.value = quantita;
        }

    });

}
export function mostraDettaglioItem(idItem) {

    const modal = document.getElementById("dettaglioModal_item");
    const contenitore = document.getElementById("dettaglioContenuto_item");
    console.log(document.getElementById("dettaglioModal_bevande"));
    console.log(document.getElementById("dettaglioContenuto_item"));
    if (!modal || !contenitore) return;
    console.log('sono qui', idItem);

    const item = state.items.find(
        i => Number(i.id_item) === Number(idItem)
    );

    if (!item) return;

    const allergeniText =
        item.nomi_allergeni ??
        item.allergeni ??
        item.lista_allergeni ??
        "Nessun allergene";

    const infoAggiuntive = item.tipo === "bevanda"
        ? `
            <p class="comment">
                Contiene Alcol: ${item.categoria === "item_alcolica" ? "Sì" : "No"}
            </p>
        `
        : `
            <p class="comment">
                Categoria: ${item.categoria}
            </p>
        `;

    contenitore.innerHTML = `
<div
    class="btn-inserisci-itemmenu-ordine"
    id="nome-item${item.id_item}"
    data-id="${item.id_item}"
    data-nome="${item.nome}"
    data-tipo="${item.tipo}">

    <h3 class="comment">
        <b>${item.nome}</b>
    </h3>

    <p class="comment">
        ${item.descrizione}
    </p>

    <p
        class="comment"
        id="prezzo-item${item.id_item}"
        data-prezzo="${item.prezzo}">
        Prezzo: ${item.prezzo} €
    </p>

    ${infoAggiuntive}

    <p class="elenco_allergeni">
        ${allergeniText}
    </p>

    <label>Quantità</label>

   <input
        type="number"
        class="quantita-item quantita"
        id="quantita-item-${item.id_item}"
        data-id="${item.id_item}"
        data-tipo="${item.tipo}"
        value="0"
        min="0">
    <br>

    <label>Note</label>

    <input
        type="text"
        class="note-item note"
        id="note-item-${item.id_item}"
        data-id="${item.id_item}"
        data-tipo="${item.tipo}"
        maxlength="100"
        placeholder="...">

    

    <br>
</div>
`;

    modal.showModal();
}