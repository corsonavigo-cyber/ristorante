import { apiGet } from "../apigeneric.js";
import { state } from "./variabilistato.js";

function aggiornaLinkFuoriMenu() {
    const link = document.getElementById("linkbev");
    if (!link) return;

    link.href = `nuovofuorimenu.php?id=${state.idOrdineInserito ?? ""}`;
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
    <div class="controllo-quantita">


    <button
    type="button"
    class="addizione"
    data-id="${item.id_item}"
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




<br>
  <strong>+</strong>
</button>
</div>

</div>

</div>

`;
}

export function mostraDettaglioItem(idItem, voceEsistente = null) {

    const modal = document.getElementById("dettaglioModal_item");
    const contenitore = document.getElementById("dettaglioContenuto_item");
   
    if (!modal || !contenitore) return;
    console.log('sono qui in mostra dettaglio item', idItem);

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


         // Se voceEsistente è passata, usiamo i suoi valori, altrimenti 0 e ''
    const qtaDefault = voceEsistente ? voceEsistente.quantita : 0;
    const noteDefault = voceEsistente ? voceEsistente.note : '';
    const idRelazione = voceEsistente ? voceEsistente.id_comanda_dettaglio : '';


    contenitore.innerHTML = `
        <div class="dettaglio-container" data-id="${item.id_item}">
            <h3><b>${item.nome}</b></h3>
            <p>${item.descrizione}</p>
            <label>Quantità</label>
            <input type="number" class="quantita-item" value="${qtaDefault}">
            <label>Note</label>
            <input type="text" class="note-item" value="${noteDefault}">
        </div>
    `;

    modal.dataset.idItem = idItem;
    modal.dataset.idRelazione = idRelazione;

    modal.close();
    

    modal.showModal();
}