import { apiPost } from '../apigeneric.js';
import { inserisciItemOrdine } from './ordine.js';
import { state } from './variabilistato.js';
import {inserisciItemFuoriMenu} from '.fuori-menu.js'
const API_MENU = '/ristorante/api/menu.php';

const bottoneInserisci = document.querySelector('.btn-inserisci-item');

if (bottoneInserisci) {
    bottoneInserisci.addEventListener('click', async () => {
        try {
            await inserisciPiattoFuoriMenu();
        } catch (errore) {
            console.error('Errore inserimento fuori menu:', errore);
            alert(errore.message || 'Errore durante l\'inserimento del piatto fuori menu.');
        }
    });
}

/*manca da inserire la relezione item ordine(l'id ordine asrrivs ds url*/
async function inserisciPiattoFuoriMenu() {
    const nomePiatto = document.getElementById('nome-piatto')?.value?.trim() ?? '';
    const descrizione = document.getElementById('descrizione')?.value?.trim() ?? '';
    const prezzo = Number.parseFloat(document.getElementById('prezzo')?.value ?? '');
    const tipoSelezionato = document.querySelector('input[name="tipo"]:checked')?.value ?? null;
    const idOrdine = Number(
        document.querySelector('.btn-inserisci-piattomenu-ordine')?.dataset?.id
        ?? state.idOrdineInserito
        ?? 0
    );
    const idMomento = Number(
        document.querySelector('input[name="momento"]:checked')?.value ?? 5
    );

    if (!nomePiatto) {
        throw new Error('Il nome del piatto è obbligatorio');
    }

    if (!descrizione) {
        throw new Error('La descrizione è obbligatoria');
    }

    if (!Number.isFinite(prezzo) || prezzo <= 1) {
        throw new Error('Inserisci un prezzo valido');
    }

    if (!tipoSelezionato) {
        throw new Error('Seleziona il tipo del prodotto');
    }

    if (!Number.isInteger(idOrdine) || idOrdine <= 0) {
        throw new Error('Nessun ordine valido da aggiornare');
    }

    const payloadItem = {
        tipo: tipoSelezionato,
        categoria: 'fuori_menu',
        in_menu: 'no',
        nome: nomePiatto,
        prezzo,
        descrizione,
        id_iva: 1,
        allergeni: []
    };

    const idItem = await apiPost(`${API_MENU}?type=item`, payloadItem);

    if (!idItem) {
        throw new Error('Inserimento piatto non riuscito.');
    }

    const risultato = await inserisciItemOrdine(idOrdine, [
        {
            id_item: Number(idItem),
            id_momento: idMomento,
            quantita: 1,
            note: ''
        }
    ]);

    return risultato;
}