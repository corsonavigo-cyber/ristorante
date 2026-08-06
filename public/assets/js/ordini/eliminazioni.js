import { apiDelete } from '../apigeneric.js';
import { state } from './variabilistato.js';
import { svuotaOrdineSalvato } from './localstorage.js';

const API_ORDINI = '/ristorante/api/ordini.php';

export async function annullaOrdineInCompilazione(idOrdine) {
    const id = Number(idOrdine);

    // Se l’ordine esiste nel DB, elimina ordine e relazioni.
    if (Number.isInteger(id) && id > 0) {
        await apiDelete(API_ORDINI, {
            type: 'composto',
            id
        });
    }

    // Avviene solo dopo DELETE riuscita.
    svuotaOrdineSalvato();

    state.idOrdineInserito = null;
    state.momentoAttivo = 1;

    return true;
}

export async function eliminaOrdineClick(e) {
    const bottone = e.target.closest('.btn-elimina-ordine');
    if (!bottone) return;

    const idOrdine = Number(bottone.dataset.id);

    if (!Number.isInteger(idOrdine) || idOrdine <= 0) {
        throw new Error('ID ordine mancante o non valido nel bottone.');
    }

    if (!confirm('Vuoi eliminare questa comanda?')) return;

    await apiDelete(API_ORDINI, {
        type: 'composto',
        id: idOrdine
    });

    return true;
}


export async function eliminaItemNellOrdine({ orderId, itemId, momento }) {
    return apiDelete(
        API_ORDINI,
        {
            type: 'item_momento',
            id: Number(orderId)
        },
        {
            id_comanda_dettaglio: Number(itemId),
            id_momento: Number(momento)
        }
    );
}
    