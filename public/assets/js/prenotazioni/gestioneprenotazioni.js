import * as API_tav_function from '../apigeneric.js';
import {today,erroreRisposta,leggiId} from '../tavoli/utils.js';

export async function eliminaPrenotazioneClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'elimina
        const btn_elimina = e.target.closest('.btn-elimina-prenotazione');
        //escludo click per errore
        if(!btn_elimina) return;
        
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi eliminare questa prenotazione?')){
          return;
        }
        
        //recupero il data set da data-id
        const id_elimina = btn_elimina.dataset.id;

        
        //blocco l'esecuzione se non arriva l'id
        if(!id_elimina){
          throw new Error('Id Mancante nel bottone!');
        }
        console.log('ciaoooo '+id_elimina)
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risultato = await API_tav_function.apiDelete(API_PRENOTAZIONI, {
                        type: 'tavolo_prenotazioni',
                        id: id_elimina
                    });
        console.log('Eliminazione prenotazione', risultato);

        if (risultato === false) {
            throw new Error('Eliminazione prenotazione non riuscita');
        }
        
         window.location.reload();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
