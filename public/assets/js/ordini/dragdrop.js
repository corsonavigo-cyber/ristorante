export function attachDragAndDrop({
    cardSelector = '.item-card',
    dropzoneSelector = '.momento-dropzone',
    getDragPayload,
    onDrop
} = {}) {
    const cards = document.querySelectorAll(cardSelector);
    const dropzones = document.querySelectorAll(dropzoneSelector);

    cards.forEach(card => {
        card.addEventListener('dragstart', e => {
            card.classList.add('dragging');
            const payload = typeof getDragPayload === 'function'
                ? getDragPayload(card)
                : { ...card.dataset };
            e.dataTransfer.setData('text/plain', JSON.stringify(payload));
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });

    dropzones.forEach(zone => {
        zone.addEventListener('dragenter', e => {
            e.preventDefault();
            zone.classList.add('drop-target');
        });

        zone.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zone.classList.add('drop-target');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drop-target');
        });

        zone.addEventListener('drop', async e => {
            e.preventDefault();
            zone.classList.remove('drop-target');
            const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
            const newMomentoId = zone.dataset.momentoId;
            if (payload.momentoId === newMomentoId) return;

            const card = document.querySelector(`${cardSelector}[data-item-id="${payload.itemId}"]`);
            if (!card) return;

            const originalParent = card.parentElement;
            const originalNextSibling = card.nextElementSibling;
            zone.appendChild(card);

            try {
                if (typeof onDrop === 'function') {
                    await onDrop({ card, payload, zone, originalParent, originalNextSibling });
                }
            } catch (error) {
                if (originalParent) {
                    if (originalNextSibling) {
                        originalParent.insertBefore(card, originalNextSibling);
                    } else {
                        originalParent.appendChild(card);
                    }
                }
                card.dataset.momentoId = payload.momentoId;
                throw error;
            }
        });
    });
}
