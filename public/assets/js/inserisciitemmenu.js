import * as  API_function from './commonMenu.js';

const form = document.getElementById('form_inserisci_pietanza');

document.addEventListener('click', inserisciPiattoClick);
document.addEventListener('input', API_function.nomeGiaEsistente);

async function inserisciPiattoClick(e){
    
    
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-inserisci');
        
        //escludo click per errore
        if(!btn) return;

        //recupero il nome del piatto dal form INPUT
        const nome_piatto = document.getElementById('nome-item').value.trim();
        

        //questa funzione di js genera un alet bool
        if(!confirm(`vuoi inserire ${nome_item}?`)){
          return;
        }
        //recupero gli altri dati dal form INPUT
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        const allergeniSelezionati = [...document.querySelectorAll('input[name="allergeniSelezionati[]"]:checked')].map(el =>  parseInt(el.value));        
        const in_menu = document.querySelector('input[name="in_menu"]:checked').value;
        const categoria = document.querySelector('input[name="categoria"]:checked').value;
        const id_iva = document.querySelector('input[name="id_iva"]:checked').value;
        const tipo = document.querySelector('input[name="tipo"]:checked').value;


      //validazione dati
      // Nome item
        if (typeof nome_item !== "string" || nome_item === "") {
            throw new Error("Il nome del Prodotto è obbligatorio");
        }

        // Descrizione
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }

        // Prezzo
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }

        const payload = {
            tipo : tipo,
            categoria : categoria,
            in_menu : in_menu,
            nome : nome,
            prezzo : prezzo,
            descrizione : descrizione,
            id_iva : id_iva
        };

        if(!payload) return;
        console.log(payload);
        //chiamo l'api_post dal commonMenu
        const id_inserito = API_function.apiPost(payload);
       
        //se il flusso del programma non viene interrotto ritorno alla pagina gestione bevande non attivi
        alert('Prodotto inserito con successo!');
        //reindirizzo il cliente
        window.location.href = "bevandenonattivi.php";
       
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }


