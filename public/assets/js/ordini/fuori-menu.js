import { apiPost } from "../apigeneric.js";
async function inserisciItemFuoriMenu() {
    try {
        //recupero i dati dal DOM
        const nome_item = document.getElementById('nome-item').value;
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        const quantita = parseInt(document.getElementById('quantita').value, 10);
        const tipo_item = document.getElementById('tipo-item').value;
        if (typeof nome_item !== "string" || nome_item === "") {
            throw new Error("Il nome della Pietanza è obbligatorio");
        }

        
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
        const body ={
                tipo: tipo_item,
                categoria: 'fuori_menu',
                in_menu: 'no',
                nome: String(nome_item),
                prezzo: prezzo,
                descrizione: String(descrizione),
                id_iva: 1,
                allergeni: []             
                                
            };
        const id_item = await apiPost(`${API_MENU}?type="item"`, body);

        const body_momento = {
            id_ordine: state.id_ordine,
            id_item: id_item,
            id_momento: 'fuori_menu',
            note: '',
            quantita: quantita,
            
        };
        const id_comanda_dettaglio = await apiPost(`${API_ORDINI}?type="item"` ,body_momento);
        return id_comanda_dettaglio;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}