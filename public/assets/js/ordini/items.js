import { apiGet } from "../apigeneric.js";
import { state } from "./variabilistato.js";

function aggiornaLinkFuoriMenu() {
    const link = document.getElementById("linkbev");
    if (!link) return;

    link.href = `nuovopiattofuorimenu.php?id=${state.idOrdineInserito ?? ""}`;
}

export async function precaricaPiattiForm() {

    aggiornaLinkFuoriMenu();

    state.piatti = await apiGet(
        API_MENU,
        { type: "dettaglio", in_menu: "si", tipo: "piatto" }
    );

    const contenitore = document.getElementById("piatti_input");
    if (!contenitore) return;

    contenitore.innerHTML = state.piatti
        .filter(p => p.in_menu === "si")
        .map(piatto => {
            const allergeniText = piatto.nomi_allergeni ?? piatto.allergeni ?? piatto.lista_allergeni ?? "";
            return `

<div class="piatto">

<button
    type="button"
    class="btn-inserisci-piatto-ordine"
    id="nome-piatto${piatto.id_item}"
    data-id="${piatto.id_item}"
    data-nome="${piatto.nome}">

<h3 class="comment">
<b>${piatto.nome}</b>
</h3>

<p class="comment">
${piatto.descrizione}
</p>

<p
class="comment"
id="prezzo${piatto.id_item}"
data-prezzo="${piatto.prezzo}">
Prezzo: ${piatto.prezzo} €
</p>

<p class="elenco_allergeni">
${allergeniText
    ? allergeniText.split(", ").join(", ")
    : "Nessun allergene"}
</p>

<label>Quantità</label>

<input
type="number"
class="quantita"
data-id="${piatto.id_item}"
data-tipo="piatto"
id="quantita${piatto.id_item}"
value="0"
min="0">

<br>

<label>Note</label>

<input
type="text"
class="note"
id="note-${piatto.id_item}"
data-id="${piatto.id_item}"
data-tipo="piatto"
maxlength="100"
placeholder="...">

</button>

</div>

`; }).join("");
}

export async function precaricaBevandeForm() {

    aggiornaLinkFuoriMenu();

    state.bevande = await apiGet(
        API_MENU,
        { type: "dettaglio", in_menu: "si", tipo: "bevanda" }
    );

    const contenitore = document.getElementById("bevande_input");
    if (!contenitore) return;

    contenitore.innerHTML = state.bevande
        .filter(b => b.in_menu === "si")
        .map(bevanda => `

<div
class="btn-inserisci-bevandamenu-ordine ins-bev"
id="nome-bevanda${bevanda.id_item}"
data-id="${bevanda.id_item}"
data-nome="${bevanda.nome}">

<h3 class="comment">
<b>${bevanda.nome}</b>
</h3>

<p
class="comment"
id="prezzo-bev${bevanda.id_item}"
data-prezzo="${bevanda.prezzo}">
Prezzo: ${bevanda.prezzo} €
</p>

<div
class="dettaglioModal_bevande"
id="modal-${bevanda.id_item}"
data-id="${bevanda.id_item}">
i
</div>

<div class="operazioni-aritmetiche">

<button
type="button"
class="sottrazione"
data-id="${bevanda.id_item}"
data-rif="bevanda">
-
</button>

<p
id="quantita-bev-comment-${bevanda.id_item}"
data-id="${bevanda.id_item}"
data-rif="bevanda">
0
</p>

<button
type="button"
class="addizione"
data-id="${bevanda.id_item}"
data-rif="bevanda">
+
</button>

</div>

</div>

`).join("");
}

export function mostraDettaglioBevanda(idBevanda) {

    const modal = document.getElementById("dettaglioModal_bevande");
    const contenitore = document.getElementById("dettaglioContenuto_bevande");

    if (!modal || !contenitore) return;

    const bevanda = state.bevande.find(
        b => Number(b.id_item) === Number(idBevanda)
    );

    if (!bevanda) return;

    const contieneAlcol = bevanda.categoria === 'bevanda_alcolica' ? 'Sì' : 'No';
    const allergeniText = bevanda.nomi_allergeni ?? bevanda.allergeni ?? bevanda.lista_allergeni ?? 'Nessun allergene';

    contenitore.innerHTML = `

<div
class="btn-inserisci-bevandamenu-ordine"
id="nome-bevanda${bevanda.id_item}"
data-id="${bevanda.id_item}"
data-nome="${bevanda.nome}">

<h3 class="comment">
<b>${bevanda.nome}</b>
</h3>

<p class="comment">
${bevanda.descrizione}
</p>

<p
class="comment"
id="prezzo-bev${bevanda.id_item}"
data-prezzo="${bevanda.prezzo}">
Prezzo: ${bevanda.prezzo} €
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
id="quantita-bev-${bevanda.id_item}"
data-id="${bevanda.id_item}"
data-tipo="bevanda"
value="0"
min="0">

<br>

<label>Note</label>

<input
type="text"
class="note-bev"
id="note-bev-${bevanda.id_item}"
data-id="${bevanda.id_item}"
data-tipo="bevanda"
maxlength="100"
placeholder="...">

</div>

`;

    modal.showModal();
}