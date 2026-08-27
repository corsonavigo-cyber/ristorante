import { attachDragAndDrop } from './dragdrop.js';
import { apiGet,apiPut } from '../apigeneric.js';
import { showError } from './variabilistato.js';
import { eliminaItemNellOrdine } from './eliminazioni.js';


const API_ORDINI = '/ristorante/api/ordini.php';

const NOMI_MOMENTI = {
    1: 'Antipasti',
    2: 'Primi',
    3: 'Secondi',
    4: 'Dolci',
    5: 'Da evadere'
};

document.addEventListener('DOMContentLoaded', () => {
            attachItemActions();
            initVisualizzaOrdine();
        });
async function initVisualizzaOrdine() {
    try {
        const orderId = new URLSearchParams(window.location.search).get('id');
        if (!orderId) {
            return showError('ID ordine mancante nell\'URL');
        }

        const items = await apiGet(API_ORDINI,{
            type:"ordine",
            id:orderId
        });
        
        if (!items?.id_comanda_dettaglio) {
            
            alert('Nessun elemento trovato per questo ordine');
            renderOrderHeader(items[0]);
            return;
        }
        
        renderOrderHeader(items[0]);
        renderOrderBoard(items);
    } catch (error) {
        console.error(error);
        showError(error.message || 'Errore caricamento ordine');
    }
}


function eliminaItemNellOrdineClick() {
    btn_elimina_item = e.target.closest('.btn-elimina-singolo-item');
    if (!btn_elimina_item) return;
    confirm('Vuoi eliminare questo elemento dalla comanda?');
    eliminaItemNellOrdine({
        orderId: btn_elimina_item.dataset.orderId,
        itemId: btn_elimina_item.dataset.itemId,
        momento: btn_elimina_item.dataset.momentoId
    }); 
}
function renderOrderHeader(order) {
    const header = document.getElementById('order-header');
    header.innerHTML = `
        <div class="order-summary">
            <div>
                <h2>Comanda #${order.id_ordine}</h2>
                <p>Tavolo: ${order.numeri_tavoli}</p>
                <p>Persone: ${order.numero_persone}</p>
                <p>Stato: ${order.nome_stato}</p>
            </div>
            <div class="order-actions">
                <a class="btn" href="modificaordine.php?id=${order.id_ordine}">✏️ Modifica</a>
                <a class="btn" href="../tavoli/gestionetavoli.php">Torna agli ordini</a>
            </div>
        </div>
    `;
}

function raggruppaPerMomento(items) {
    return items.reduce((acc, item) => {
        const momento = item.id_momento ?? '0';
        if (!acc[momento]) acc[momento] = [];
        acc[momento].push(item);
        return acc;
    }, {});
}

function renderOrderBoard(items) {
    const board = document.getElementById('order-board');
    const grouped = raggruppaPerMomento(items);
    const momentiPresenti = Object.keys(grouped).sort((a,b) => Number(a) - Number(b));
    const momenti = Object.keys(NOMI_MOMENTI);
    board.innerHTML = `
        <div class="order-board">
            ${momenti.map(momento => renderMomentColumn(momento, grouped[momento] || [], momentiPresenti)).join('')}
        </div>
    `;
    attachDragAndDrop({
        cardSelector: '.item-card',
        dropzoneSelector: '.momento-dropzone',
        onDrop: async ({ card, payload, zone }) => {
            const newMomentoId = zone.dataset.momentoId;
            card.dataset.momentoId = newMomentoId;
            await apiPut(
                API_ORDINI,
                { type: 'item_momento' },
                {
                    id_ordine: Number(payload.orderId),
                    id_comanda_dettaglio: Number(payload.itemId),
                    id_momento: Number(newMomentoId)
                }
            );
        }
    });

}

function renderMomentColumn(momento, items, momentiPresenti) {
    const portataIndex = momentiPresenti.indexOf(momento);
    const portataLabel = portataIndex !== -1 ? ` - Portata ${portataIndex + 1}` : '';
    return `
        <section class="momento-colonna">
            <h3>${NOMI_MOMENTI[momento] ?? `Momento ${momento}`}${portataLabel}</h3>
            <div class="momento-dropzone" data-momento-id="${momento}">
                ${items.map(item => renderOrderItem(item)).join('')}
            </div>
        </section>
    `;
}

function renderOrderItem(item) {
    return `
        <article class="item-card" draggable="true"
            data-item-id="${item.id_comanda_dettaglio}"
            data-momento-id="${item.id_momento}"
            data-order-id="${item.id_ordine}">
            <div class="item-main">
                <div class="item-text">
                    <span class="item-name">${item.nome}</span>
                    <span class="item-meta">Prezzo: ${item.prezzo} €</span>
                </div>
                <div class="item-quantity">
                    <button type="button" class="btn-mini btn-qty-decrement">-</button>
                    <span class="item-quantita">${item.quantita}</span>
                    <button type="button" class="btn-mini btn-qty-increment">+</button>
                </div>
                <div class="item-actions">
                    <button type="button" class="btn-mini btn-edit">✏️</button>
                    <button type="button" class="btn-mini btn-delete-singolo-item">🗑️</button>
                </div>
            </div>
        </article>
    `;
}

function attachItemActions() {
    document.addEventListener('click', async (event) => {
        const button = event.target.closest(
            '.btn-delete-singolo-item, .btn-edit, .btn-qty-increment, .btn-qty-decrement'
        );
        if (!button) return;

        const card = button.closest('.item-card');
        if (!card) return;

        const { itemId, orderId, momentoId: momento } = card.dataset;
        const quantitaEl = card.querySelector('.item-quantita');
        const quantitaCorrente = Number(quantitaEl.textContent.trim());

        
        if (button.matches('.btn-delete')) {
            if (!confirm('Eliminare questo elemento dalla comanda?')) return;

            await eliminaItemNellOrdine({
                orderId,
                itemId,
                momento
            });

            card.remove();
            return;
        }

        let nuovaQuantita;

        if (button.matches('.btn-edit')) {
            const valore = prompt('Inserisci nuova quantità', String(quantitaCorrente));
            const nuovaQuantita = Number(valore);

            if (!Number.isInteger(nuovaQuantita) || nuovaQuantita <= 0) return;
        } else if (button.matches('.btn-qty-increment')) {
            nuovaQuantita = quantitaCorrente + 1;
        } else {
            nuovaQuantita = Math.max(1, quantitaCorrente - 1);
        }

        await apiPut(
            API_ORDINI,
            { type: 'item_quantita_momento' },
            {
                id_ordine: Number(orderId),
                id_comanda_dettaglio: Number(itemId),
                id_momento: Number(momento),
                quantita: nuovaQuantita
            }
        );

        quantitaEl.textContent = String(nuovaQuantita);
    });
}





