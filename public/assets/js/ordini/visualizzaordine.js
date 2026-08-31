import { apiGet } from '../apigeneric.js';
import * as API_scontrino from './logica-scontrino.js';
import { showError } from './variabilistato.js';
import { caricaOrdine } from './ordine.js';


const API_ORDINI = '/ristorante/api/ordini.php';

const NOMI_MOMENTI = {
    1: 'Antipasti',
    2: 'Primi',
    3: 'Secondi',
    4: 'Dolci',
    5: 'Da evadere'
};


let ordineCorrente = null;
let totaleOrdine = 0;
let sconto = 0;


document.addEventListener('DOMContentLoaded', initVisualizzaOrdine);


async function initVisualizzaOrdine() {

    try {

        const idOrdine =
            Number(
                new URLSearchParams(window.location.search)
                    .get('id')
            );


        if (!idOrdine) {

            showError('ID ordine mancante nell\'URL');

            return;
        }


        const items = await caricaOrdine(idOrdine);


        if (!Array.isArray(items) || items.length === 0) {

            showError(
                'Nessun elemento trovato per questo ordine'
            );

            return;
        }


        ordineCorrente = items;


        renderOrderHeader(items[0]);

        renderPrecomanda(items);

        renderRiepilogo(items);

        attachEventListeners();

    } catch (error) {

        console.error(
            'Errore caricamento ordine:',
            error
        );

        showError(
            error.message ||
            'Errore caricamento ordine'
        );
    }
}


/**
 * Intestazione ordine.
 */
function renderOrderHeader(order) {

    const header =
        document.getElementById('order-header');


    header.innerHTML = `

        <div class="order-header">

            <div>

               <p>
                    Tavolo:
                    ${order.numeri_tavoli ?? '-'}
                </p>

                <p>
                    Persone:
                    ${order.numero_persone ?? '-'}
                </p>

                <p>
                    Stato:
                    ${order.nome_stato ?? '-'}
                </p>

            </div>

        </div>

    `;
}


/**
 * Visualizzazione della comanda in stile precomanda.
 */
function renderPrecomanda(items) {

    const container =
        document.getElementById('order-board');


    const grouped =
        raggruppaPerMomento(items);


    const momentiPresenti =
        Object.keys(grouped)
            .sort(
                (a, b) =>
                    Number(a) - Number(b)
            );


    container.innerHTML = `

        <div class="precomanda">

            ${momentiPresenti
                .map(
                    momento =>
                        renderMomento(
                            momento,
                            grouped[momento]
                        )
                )
                .join('')
            }

        </div>

    `;
}


/**
 * Raggruppa gli item per momento.
 */
function raggruppaPerMomento(items) {

    return items.reduce(
        (acc, item) => {

            const momento =
                item.id_momento ?? 0;


            if (!acc[momento]) {
                acc[momento] = [];
            }


            acc[momento].push(item);


            return acc;

        },
        {}
    );
}


/**
 * Renderizza un momento della comanda.
 */
function renderMomento(momento, items) {

    const nomeMomento =
        NOMI_MOMENTI[momento] ??
        items[0]?.nome_momento ??
        `Momento ${momento}`;


    const totaleMomento =
        items.reduce(
            (totale, item) =>
                totale +
                Number(item.prezzo) *
                Number(item.quantita),
            0
        );


    return `

        <section class="precomanda-momento">

            <h3>
                ${nomeMomento}
            </h3>


            <div class="precomanda-items">

                ${items
                    .map(item =>
                        renderItem(item)
                    )
                    .join('')
                }

            </div>


            <div class="precomanda-momento-totale">

                Totale:
                ${totaleMomento.toFixed(2)} €

            </div>

        </section>

    `;
}


/**
 * Renderizza una singola voce della comanda.
 */
function renderItem(item) {

    const prezzo =
        Number(item.prezzo);


    const quantita =
        Number(item.quantita);


    const totale =
        prezzo * quantita;


    return `

        <div class="precomanda-item">

            <div class="precomanda-item-info">

                <span class="precomanda-quantita">
                    ${quantita} ×
                </span>

                <span class="precomanda-nome">
                    ${item.nome}
                </span>

            </div>


            <span class="precomanda-prezzo">
                ${totale.toFixed(2)} €
            </span>

            ${
                item.note
                    ? `
                        <div class="precomanda-nota">
                            Nota: ${item.note}
                        </div>
                    `
                    : ''
            }

        </div>

    `;
}


/**
 * Renderizza il riepilogo economico.
 */
function renderRiepilogo(items) {

    totaleOrdine =
        calcolaTotale(items);


    const container =
        document.getElementById('order-total');


    container.innerHTML = `

        <div class="riepilogo-ordine">

            <div class="riga-totale">

                <span>
                    Subtotale
                </span>

                <strong id="subtotale">
                    ${totaleOrdine.toFixed(2)} €
                </strong>

            </div>


            <div class="riga-sconto">

                <label for="sconto">
                    Sconto
                </label>

                <div>

                    <input
                        id="sconto"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value="0"
                    >

                    <span>%</span>

                </div>

            </div>


            <div class="riga-totale finale">

                <span>
                    Totale
                </span>

                <strong id="totale-finale">
                    ${totaleOrdine.toFixed(2)} €
                </strong>

            </div>

        </div>

    `;
}


/**
 * Calcola il totale dell'ordine.
 */
function calcolaTotale(items) {

    return items.reduce(
        (totale, item) => {

            return totale +
                Number(item.prezzo) *
                Number(item.quantita);

        },
        0
    );
}


/**
 * Registra gli eventi della pagina.
 */
function attachEventListeners() {

    const inputSconto =
        document.getElementById('sconto');


    inputSconto?.addEventListener(
        'input',
        aggiornaSconto
    );


    const btnScontrino =
        document.getElementById(
            'btn-emetti-scontrino'
        );


    btnScontrino?.addEventListener(
        'click',
        emettiScontrino
    );
}


/**
 * Aggiorna il totale applicando lo sconto.
 *
 * Lo sconto rimane esclusivamente lato frontend.
 */
function aggiornaSconto(event) {

    let valore =
        Number(event.target.value);


    if (!Number.isFinite(valore)) {
        valore = 0;
    }


    valore =
        Math.min(
            100,
            Math.max(0, valore)
        );


    sconto = valore;


    const totaleScontato =
        totaleOrdine *
        (1 - sconto / 100);


    document.getElementById(
        'totale-finale'
    ).textContent =
        `${totaleScontato.toFixed(2)} €`;
}


/**
 * Emissione dello scontrino.
 */
async function emettiScontrino() {

    if (!ordineCorrente?.length) {
        return;
    }


    const ordine =
        ordineCorrente[0];


    const totaleFinale =
        totaleOrdine *
        (1 - sconto / 100);


    const conferma =
        confirm(
            `Emettere lo scontrino di ${totaleFinale.toFixed(2)} €?`
        );


    if (!conferma) {
        return;
    }


    const button =
        document.getElementById(
            'btn-emetti-scontrino'
        );


    try {

        button.disabled = true;


        /*
         * Qui il backend riceve l'id dell'ordine.
         *
         * Se successivamente vorrai gestire lo sconto
         * fiscalmente, dovremo aggiungerlo esplicitamente
         * al payload.
         */
        const idScontrino =
            await API_scontrino.generaScontrino(
                ordine.id_ordine,
                totaleFinale
            );


        alert(
            'Scontrino emesso con successo.'
        );


        window.location.href =
            '../tavoli/gestionetavoli.php';


    } catch (error) {

        console.error(
            'Errore emissione scontrino:',
            error
        );


        showError(
            error.message ||
            'Errore durante l\'emissione dello scontrino'
        );


        button.disabled = false;
    }
}