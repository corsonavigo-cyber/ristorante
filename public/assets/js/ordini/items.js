import { apiGet } from "../apigeneric.js";
import { state } from "./variabilistato.js";

function aggiornaLinkFuoriMenu() {
    const link = document.getElementById("linkbev");
    if (!link) return;

    link.href = `nuovopiattofuorimenu.php?id=${state.idOrdineInserito ?? ""}`;
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

    state.piatti = state.items.filter(item => item.tipo === "piatto");
    state.bevande = state.items.filter(item => item.tipo === "bevanda");

    renderItems(state.piatti, "piatti_input", "piatto");
    renderItems(state.bevande, "bevande_input", "bevanda");
}

function renderItems(items, containerId, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items
        .filter(item => item.in_menu === "si")
        .map(item => renderItemCard(item, tipo))
        .join("");
}

function renderItemCard(item, tipo) {
    const allergeniText = item.nomi_allergeni ?? item.allergeni ?? item.lista_allergeni ?? "";

    return `

<div class="${tipo} ${tipo === 'bevanda' ? 'bevanda' : 'piatto'}">

<button
    type="button"
    class="btn-inserisci-${tipo}-ordine ${tipo === 'bevanda' ? 'ins-bev' : ''}"
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
    class="quantita${tipo === 'bevanda' ? '-bev' : ''}"
    data-id="${item.id_item}"
    data-tipo="${tipo}"
    id="quantita${tipo === 'bevanda' ? '-bev-' : ''}${item.id_item}"
    value="0"
    min="0">

<br>

<label>Note</label>

<input
    type="text"
    class="note${tipo === 'bevanda' ? '-bev' : ''}"
    id="note-${tipo === 'bevanda' ? 'bev-' : ''}${item.id_item}"
    data-id="${item.id_item}"
    data-tipo="${tipo}"
    maxlength="100"
    placeholder="...">

</button>

</div>

`;
}
//da modificare con le correzioni

export function mostraDettaglioItem(idItem) {

    const modal = document.getElementById("dettaglioModal_bevande");
    const contenitore = document.getElementById("dettaglioContenuto_bevande");

    if (!modal || !contenitore) return;

    const item = state.bevande.find(
        b => Number(b.id_item) === Number(idItem)
    );

    if (!item) return;

    const contieneAlcol = item.categoria === 'item_alcolica' ? 'Sì' : 'No';
    const allergeniText = item.nomi_allergeni ?? item.allergeni ?? item.lista_allergeni ?? 'Nessun allergene';

    contenitore.innerHTML = `

<div
class="btn-inserisci-itemmenu-ordine"
id="nome-item${item.id_item}"
data-id="${item.id_item}"
data-nome="${item.nome}">

<h3 class="comment">
<b>${item.nome}</b>
</h3>

<p class="comment">
${item.descrizione}
</p>

<p
class="comment"
id="prezzo-bev${item.id_item}"
data-prezzo="${item.prezzo}">
Prezzo: ${item.prezzo} €
</p>

<p class="comment">
Contiene Alcol: ${contieneAlcol}
</p>

<p class="elenco_allergeni">
${allergeniText}
</p>

<label>Quantità</label>

<input
type="number"
class="quantita-bev"
id="quantita-bev-${item.id_item}"
data-id="${item.id_item}"
data-tipo="bevanda"
value="0"
min="0">

<br>

<label>Note</label>

<input
type="text"
class="note-bev"
id="note-bev-${bevanda.id_item}"
data-id="${item.id_item}"
data-tipo="item"
maxlength="100"
placeholder="...">

</div>

`;

    modal.showModal();
}