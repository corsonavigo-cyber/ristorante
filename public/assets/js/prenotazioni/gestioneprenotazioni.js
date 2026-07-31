import * as API_tav_function from '../apigeneric.js';

document.addEventListener('DOMContentLoaded', elencoPrenotazioniNonAttive);
document.addEventListener('click', attivaPrenotazione);
document.addEventListener('click', eliminaPrenotazioneClick);


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
        if(!confirm('Procedere alla compillare la comanda?')){
          return;
        }

        //recupero il data set da data-id
        const id_disattiva =btn_disattiva.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_disattiva){
          throw new Error('Non è stato possibile disattivare la Prenotazione , manca ID!');
        }
       
        await API_tav_function.apiPatch(
                `${API_PRENOTAZIONI}?type=prenotazioni`,
                btn_disattiva,
                { id: id_disattiva, attiva: 0 }
              );

              //se il flusso del programma non viene interrotto ricarico i piatti
              window.location.reload();
            
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

  async function elencoPrenotazioniNonAttive() {
    const contentitore = document.getElementById('lista_prenotazioni_non_attive');
    const prenotazioni = await API_tav_function.apiGet(API_PRENOTAZIONI, {type : 'prenotazioni'});
    const prenotazioni_non_attive = prenotazioni.filter(prenotazione => prenotazione.attiva === 0);
    contentitore.innerHTML = prenotazioni_non_attive.map(prenotazione =>`
       <p class="prenotazione">${prenotazione.nome_prenotazione}, numero persone :  ${prenotazione.numero_persone}, 
       numero tavolo ${prenotazione.numero_tavoli}, ora ${prenotazione.ora_prenotazione} data ${prenotazione.data_in_prenotazione} <button type="button" data-id="${prenotazione.id_prenotazione}" data-id-tavolo="${prenotazione.id_tavoli}" class="btn-attiva-prenotazione">Attiva Prenotazione</button>
      <button class="btn-elimina-prenotazione" data-id="${prenotazione.id_prenotazione}">Elimina 🗑️</button>
`).join('<br>');
    
  }

async function tavoloGiaOccupato(id_tavolo) {
    const prenotazioni = await API_tav_function.apiGet(API_PRENOTAZIONI, {
      type: 'tavolo',
      id: id_tavolo
    });

    // TODO: aggiungere qui il controllo degli ordini quando esisterà l'API ordini.
    return prenotazioni.length > 0;
}

  async function attivaPrenotazione(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn_attiva = e.target.closest('.btn-attiva-prenotazione');
        //escludo click per errore
        if(!btn_attiva) return;
        //questa funzione di js genera un alet bool
        if(!confirm('Attivare questa prenotazione?')){
          return;
        }
       
        //recupero il data set da data-id
        const id_attiva =btn_attiva.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_attiva){
          throw new Error('Non è stato possibile attivare la Prenotazione , manca ID!');
        }
        const id_tavolo = btn_attiva.dataset.idTavolo;
        if (!id_tavolo) {
          throw new Error('Non è stato possibile attivare la prenotazione: manca ID tavolo!');
        }

        if (await tavoloGiaOccupato(id_tavolo)) {
          if (confirm('Il tavolo è già occupato. Vuoi modificare questa prenotazione?')) {
            window.location.href = `modificaprenotazione.php?id=${id_attiva}`;
            return;
          }

          await API_tav_function.apiDelete(API_PRENOTAZIONI, {
            type: 'tavolo_prenotazioni',
            id: id_attiva
          });
          window.location.reload();
          return;
        }
        const body ={ 
              id_prenotazione: parseInt(id_attiva), 
              attiva : 1 
            }
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const risposta = await API_tav_function.apiPatch(`${API_PRENOTAZIONI}?type=prenotazioni`,btn_attiva, body);
        
        //se il flusso del programma non viene interrotto ricarico i piatti
        window.location.reload();
    
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
