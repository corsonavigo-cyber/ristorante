import { attachDragAndDrop } from './dragdrop.js';

const API_ORDINI = '/ristorante/api/ordini.php';

const NOMI_MOMENTI = {
    1: 'Antipasti',
    2: 'Primi',
    3: 'Secondi',
    4: 'Dolci',
    5: 'Da evadere'
};

document.addEventListener('DOMContentLoaded', initVisualizzaOrdine);

async function initVisualizzaOrdine() {
    try {
        const orderId = new URLSearchParams(window.location.search).get('id');
        if (!orderId) {
            return showError('ID ordine mancante nell\'URL');
        }

        const items = await fetchOrderItems(orderId);
        if (!items || !items.length) {
            return showError('Ordine non trovato o senza elementi');
        }

        renderOrderHeader(items[0]);
        renderOrderBoard(items);
    } catch (error) {
        console.error(error);
        showError(error.message || 'Errore caricamento ordine');
    }
}

async function fetchOrderItems(orderId) {
    const params = new URLSearchParams({ type: 'ordine', id: orderId });
    const response = await fetch(`${API_ORDINI}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
    }
    const json = await response.json();
    return json.data ?? [];
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
                <a class="btn" href="gestisciordini.php">Torna agli ordini</a>
            </div>
        </div>
    `;
}

function groupItemsByMoment(items) {
    return items.reduce((acc, item) => {
        const momento = item.id_momento ?? '0';
        if (!acc[momento]) acc[momento] = [];
        acc[momento].push(item);
        return acc;
    }, {});
}

function renderOrderBoard(items) {
    const board = document.getElementById('order-board');
    const grouped = groupItemsByMoment(items);
    const activeMomenti = Object.keys(grouped).sort((a,b) => Number(a) - Number(b));
    const momenti = Object.keys(NOMI_MOMENTI);
    board.innerHTML = `
        <div class="order-board">
            ${momenti.map(momento => renderMomentColumn(momento, grouped[momento] || [], activeMomenti)).join('')}
        </div>
    `;
    attachDragAndDrop({
        cardSelector: '.item-card',
        dropzoneSelector: '.momento-dropzone',
        onDrop: async ({ card, payload, zone }) => {
            const newMomentoId = zone.dataset.momentoId;
            card.dataset.momentoId = newMomentoId;
            try {
                await updateItemMoment(payload.orderId, payload.itemId, Number(newMomentoId));
            } catch (error) {
                throw error;
            }
        }
    });
    attachItemActions();
}

function renderMomentColumn(momento, items, activeMomenti) {
    const portataIndex = activeMomenti.indexOf(momento);
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
                    <button type="button" class="btn-mini btn-delete">🗑️</button>
                </div>
            </div>
        </article>
    `;
}

function attachItemActions() {
    document.querySelectorAll('.item-card .btn-delete').forEach(button => {
        button.addEventListener('click', async (event) => {
            const card = event.target.closest('.item-card');
            const itemId = card.dataset.itemId;
            const orderId = card.dataset.orderId;
            const momento = card.dataset.momentoId;
            if (!confirm('Eliminare questo elemento dalla comanda?')) {
                return;
            }
            await deleteOrderItem(orderId, itemId, momento);
            card.remove();
        });
    });

    document.querySelectorAll('.item-card .btn-edit').forEach(button => {
        button.addEventListener('click', async (event) => {
            const card = event.target.closest('.item-card');
            const itemId = card.dataset.itemId;
            const orderId = card.dataset.orderId;
            const momento = card.dataset.momentoId;
            const quantitaEl = card.querySelector('.item-quantita');
            const currentQuantity = Number(quantitaEl.textContent.trim());
            const newQuantity = prompt('Inserisci nuova quantità', String(currentQuantity));
            if (!newQuantity || Number(newQuantity) <= 0) return;
            await updateOrderItemQuantity(orderId, itemId, momento, Number(newQuantity));
            quantitaEl.textContent = String(Number(newQuantity));
        });
    });

    document.querySelectorAll('.item-card .btn-qty-increment').forEach(button => {
        button.addEventListener('click', async (event) => {
            const card = event.target.closest('.item-card');
            const itemId = card.dataset.itemId;
            const orderId = card.dataset.orderId;
            const momento = card.dataset.momentoId;
            const quantitaEl = card.querySelector('.item-quantita');
            const currentQuantity = Number(quantitaEl.textContent.trim());
            const newQuantity = currentQuantity + 1;
            await updateOrderItemQuantity(orderId, itemId, momento, newQuantity);
            quantitaEl.textContent = String(newQuantity);
        });
    });

    document.querySelectorAll('.item-card .btn-qty-decrement').forEach(button => {
        button.addEventListener('click', async (event) => {
            const card = event.target.closest('.item-card');
            const itemId = card.dataset.itemId;
            const orderId = card.dataset.orderId;
            const momento = card.dataset.momentoId;
            const quantitaEl = card.querySelector('.item-quantita');
            const currentQuantity = Number(quantitaEl.textContent.trim());
            const newQuantity = Math.max(1, currentQuantity - 1);
            await updateOrderItemQuantity(orderId, itemId, momento, newQuantity);
            quantitaEl.textContent = String(newQuantity);
        });
    });
}

async function deleteOrderItem(orderId, itemId, momento) {
    const response = await fetch(`${API_ORDINI}?type=item_momento&id=${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_comanda_dettaglio: Number(itemId), id_momento: Number(momento) })
    });
    if (!response.ok) {
        throw new Error('Impossibile eliminare l\'elemento');
    }
    return response.json();
}

async function updateOrderItemQuantity(orderId, itemId, momento, quantita) {
    const response = await fetch(`${API_ORDINI}?type=item_quantita_momento`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_ordine: Number(orderId), id_comanda_dettaglio: Number(itemId), id_momento: Number(momento), quantita })
    });
    if (!response.ok) {
        throw new Error('Impossibile aggiornare la quantità');
    }
    return response.json();
}

async function updateItemMoment(orderId, itemId, newMomento) {
    const response = await fetch(`${API_ORDINI}?type=item_momento`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_ordine: Number(orderId), id_comanda_dettaglio: Number(itemId), id_momento: Number(newMomento) })
    });
    if (!response.ok) {
        throw new Error('Impossibile spostare l\'elemento');
    }
    return response.json();
}

function showError(message) {
    const container = document.getElementById('order-error');
    const board = document.getElementById('order-board');
    const header = document.getElementById('order-header');
    container.textContent = message;
    board.innerHTML = '';
    header.innerHTML = '';
}
