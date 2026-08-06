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
            type: "dettaglio",
            in_menu: "si"
        }
    );

    const { piatti, bevande } = separaItems(state.items);

    state.piatti = piatti;
    state.bevande = bevande;

    renderItems(piatti, "piatti_input", "piatto");
    renderItems(bevande, "bevande_input", "bevanda");
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

<button
    type="button"
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

<p class="elenco_allergeni">
${allergeniText ? allergeniText.split(", ").join(", ") : "Nessun allergene"}
</p>

<label>Quantità</label>

<input
    type="number"
    class="quantita${tipo === 'bevanda' ? '-bevanda' : '-piatto'}"
    data-id="${item.id_item}"
    data-tipo="${tipo}"
    id="quantita${tipo === 'bevanda' ? '-bevanda-' : '-piatto-'}${item.id_item}"
    value="0"
    min="0">

<br>

<label>Note</label>

<input
    type="text"
    class="note${tipo === 'bevanda' ? '-bevanda' : 'piatto'}"
    id="note-${tipo === 'bevanda' ? 'bevanda-' : 'piatto'}${item.id_item}"
    data-id="${item.id_item}"
    data-tipo="${tipo}"
    maxlength="100"
    placeholder="...">

</button>

</div>

`;
}

export function mostraDettaglioItem(idItem) {

    const modal = document.getElementById("dettaglioModal_bevande");
    const contenitore = document.getElementById("dettaglioContenuto_bevande");

    if (!modal || !contenitore) return;

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
        class="quantita-item"
        id="quantita-item-${item.id_item}"
        data-id="${item.id_item}"
        data-tipo="${item.tipo}"
        value="0"
        min="0">

    <br>

    <label>Note</label>

    <input
        type="text"
        class="note-item"
        id="note-item-${item.id_item}"
        data-id="${item.id_item}"
        data-tipo="${item.tipo}"
        maxlength="100"
        placeholder="...">

</div>
`;

    modal.showModal();
}