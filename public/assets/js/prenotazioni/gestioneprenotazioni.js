import * as API_tav_function from '../apigeneric.js';

export async function eliminaPrenotazioneClick(e){

    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'elimina
        const btn_elimina = e.target instanceof Element
          ? e.target.closest('.btn-elimina-prenotazione')
          : null;
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

  export async function disattivaPrenotazione(e){

    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn_disattiva = e.target instanceof Element
          ? e.target.closest('.btn-disattiva-prenotazione')
          : null;
        //escludo click per errore
        if(!btn_disattiva) return;
        //questa funzione di js genera un alet bool
        if(!confirm('disattivare questa prenotazione?')){
          return;
        }

        //recupero il data set da data-id
        const id_disattiva =btn_disattiva.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_disattiva){
          throw new Error('Non è stato possibile disattivare la Prenotazione , manca ID!');
        }
        if(await togliPrenotazioneDalTavolo(id_disattiva)){
              await API_tav_function.apiPatch(
                `${API_PRENOTAZIONI}?type=prenotazioni`,
                btn_disattiva,
                { id: id_disattiva, attiva: 0 }
              );

              //se il flusso del programma non viene interrotto ricarico i piatti
              window.location.reload();
            }
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }

  }

  async function togliPrenotazioneDalTavolo(id_disattiva){


    try{
        if(!parseInt(id_disattiva)){
          throw new Error('Tavolo non dissociato, manca ID!');
        }
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito
        const eliminaRelazione = await API_tav_function.apiDelete(API_PRENOTAZIONI, {
          type: 'tavolo',
          id: id_disattiva
        });

        return eliminaRelazione;
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
        return false;
    }

  }
