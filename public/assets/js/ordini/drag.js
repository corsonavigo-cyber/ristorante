export function attachDragAndDrop({
    container,
    cardSelector = '.voce-trascinabile',
    dropzoneSelector = '.momento-dropzone',
    getDragPayload,
    onDrop
} = {}) {
    if (!container) return;

    container.addEventListener('dragstart', e => {
        const card = e.target.closest(cardSelector);
        if (!card || e.target.closest('button')) {
            e.preventDefault();
            return;
        }
        card.classList.add('dragging');
        const payload = typeof getDragPayload === 'function'
            ? getDragPayload(card)
            : { idRelazione: card.dataset.relazione, momentoId: card.dataset.momento };
        e.dataTransfer.setData('text/plain', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';
    });

    container.addEventListener('dragend', e => {
        const card = e.target.closest(cardSelector);
        if (card) card.classList.remove('dragging');
    });

    container.addEventListener('dragenter', e => {
        const zone = e.target.closest(dropzoneSelector);
        if (!zone) return;
        e.preventDefault();
        zone.classList.add('drop-target');
    });

    container.addEventListener('dragover', e => {
        const zone = e.target.closest(dropzoneSelector);
        if (!zone) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    container.addEventListener('dragleave', e => {
        const zone = e.target.closest(dropzoneSelector);
        if (zone) zone.classList.remove('drop-target');
    });

    container.addEventListener('drop', async e => {
        const zone = e.target.closest(dropzoneSelector);
        if (!zone) return;
        e.preventDefault();
        zone.classList.remove('drop-target');

        const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
        const newMomentoId = zone.dataset.momentoId;
        if (payload.momentoId === newMomentoId) return;

        if (typeof onDrop === 'function') {
            await onDrop({ payload, zone });
        }
    });
}