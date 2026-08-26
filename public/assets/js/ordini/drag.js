// drag.js — drag & drop con Pointer Events (mouse + touch)

export function attachDragAndDrop({
    container,
    cardSelector = '.voce-trascinabile',
    dropzoneSelector = '.momento-dropzone',
    getDragPayload,
    onDrop
} = {}) {
    if (!container) return;

    let draggingCard = null;
    let ghost = null;       // clone visivo che segue il dito/mouse
    let payload = null;
    let currentZone = null;

    container.addEventListener('pointerdown', e => {
        const card = e.target.closest(cardSelector);
        if (!card || e.target.closest('button')) return;

        // Solo pointer primario (evita multi-touch accidentali)
        if (!e.isPrimary) return;

        draggingCard = card;
        payload = typeof getDragPayload === 'function'
            ? getDragPayload(card)
            : { idRelazione: card.dataset.relazione, momentoId: card.dataset.momento };

        card.setPointerCapture(e.pointerId);
        card.classList.add('dragging');

        // Ghost: clone posizionato in fixed, che segue il puntatore
        const rect = card.getBoundingClientRect();
        ghost = card.cloneNode(true);
        ghost.classList.add('drag-ghost');
        ghost.style.position = 'fixed';
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        ghost.style.width = `${rect.width}px`;
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '9999';
        document.body.appendChild(ghost);

        e.preventDefault(); // evita scroll/selezione testo durante il drag su touch
    });

    container.addEventListener('pointermove', e => {
        if (!draggingCard || !ghost) return;

        ghost.style.left = `${e.clientX - ghost.offsetWidth / 2}px`;
        ghost.style.top = `${e.clientY - ghost.offsetHeight / 2}px`;

        // Nascondi il ghost per un istante per rilevare cosa c'è sotto il puntatore
        ghost.style.display = 'none';
        const elementSotto = document.elementFromPoint(e.clientX, e.clientY);
        ghost.style.display = '';

        const zone = elementSotto?.closest(dropzoneSelector) ?? null;

        if (zone !== currentZone) {
            if (currentZone) currentZone.classList.remove('drop-target');
            if (zone) zone.classList.add('drop-target');
            currentZone = zone;
        }
    });

    async function terminaDrag(e) {
        if (!draggingCard) return;

        draggingCard.classList.remove('dragging');
        if (currentZone) currentZone.classList.remove('drop-target');
        if (ghost) {
            ghost.remove();
            ghost = null;
        }

        const zone = currentZone;
        const cardPayload = payload;

        draggingCard = null;
        payload = null;
        currentZone = null;

        if (!zone) return; // rilasciato fuori da ogni dropzone: nessuna azione

        const newMomentoId = zone.dataset.momentoId;
        if (cardPayload.momentoId === newMomentoId) return;

        if (typeof onDrop === 'function') {
            await onDrop({ payload: cardPayload, zone });
        }
    }

    container.addEventListener('pointerup', terminaDrag);
    container.addEventListener('pointercancel', terminaDrag);
}