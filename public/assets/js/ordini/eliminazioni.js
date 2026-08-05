import { apiDelete } from "../apigeneric.js";


export async function eliminaOrdineClick(id_ordine) {
        const btn_elimina = e.target.closest('.btn-elimina-ordine');
        if (!btn_elimina) return;

        if (!confirm('vuoi eliminare questa comanda?')) return;

        const id_elimina = Number(btn_elimina.dataset.id);

        if (!id_elimina ) {
            throw new Error('Id Mancante nel bottone!');
        }

        if (!Number.isInteger(id_elimina)) {
            throw new Error('Id Mancante o non valido nel bottone!');
        }
        const risposta = await apiDelete(API_ORDINI, {
            type:'composto',
            id: id_ordine
        });    
        return true;
    }
export async function eliminaItemNellOrdineClick(id_ordine) {
        const btn_elimina = e.target.closest('.btn-elimina-item');
        if (!btn_elimina) return;
        
        if (!confirm('vuoi eliminare questo item?')) return;
        const id_elimina = Number(btn_elimina.dataset.id);

        if (!id_elimina ) {
            throw new Error('Id Mancante nel bottone!');
        }

        if (!Number.isInteger(id_elimina)) {
            throw new Error('Id Mancante o non valido nel bottone!');
        }
        const risposta = await apiDelete(API_ORDINI, {
            type:'item_momento',
            id: id_elimina,
            id_momento: id_momento,
            id_comanda_dettaglio: id_comanda_dettaglio
        });    
        return true;
    }

    