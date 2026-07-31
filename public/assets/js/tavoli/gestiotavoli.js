import * as API_tav_function from '../apigeneric.js';
import * as Utilis from './utils.js';

document.addEventListener('DOMContentLoaded', caricaTavoli);
/*document.addEventListener('click', eliminaTavoloClick);*/

async function caricaTavoli(){
    const tavoli = await API_tav_function.apiGet(API);
    const lavagna = document.getElementById('lavagna_tavoli');
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande  
    lavagna.innerHTML = tavoli.map(tavolo=>`
    <div class="tavolo" id="${tavolo.id_tavolo}">
       
       <h3 class="comment"><b>Numero Tavolo ${tavolo.numero_tavolo}</b></h3>

       <p class="comment">Posti max ${tavolo.posti_max} prenotabili</p>
       <p class="comment">Posti min ${tavolo.posti_min} prenotabili</p> 
       <!--per visualizzazione in caso di tavolo prenotato-->
       <div class=tavolo id=prenotato data-id-tavolo="${tavolo.id_tavolo}">  </div> 
       <!--link AJAX per inviare la modifica tavolo-->
       <a class="btn" href="modificatavolo.php?id=${tavolo.id_tavolo}">Modifica ✏️</a>

       <!--button AJAX per richiedere l'eliminazione del tavolo-->

       <button class="btn-elimina" data-id="${tavolo.id_tavolo}">Elimina 🗑️</button>
    </div>`).join('');
    /*json.data.forEach(tavolo => caricaPrenotazioniTavolo(tavolo.id_tavolo));*/
  }

  async function eliminaTavoloClick(e){
    
    
    try{

        //seleziono l'elemento bottone per l'elimina
        const btn = e.target.closest('.btn-elimina');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi eliminare quest tavolo?')){
          return;
        }
        //recupero il data set da data-id
        const id_elimina = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_elimina){
          throw new Error('Id Mancante nel bottone!');
        }
         //  controllo se il tavolo ha prenotazioni attive collegate
        const prenotazioniCollegate = await API_tav_function.apiGet(API_PRENOTAZIONI,{type:tavolo, id : id_elimina});
        console.log('prenotazioniCollegate ' + prenotazioniCollegate);
        // se ci sono prenotazioni, avviso l'utente che verranno scollegate
        if (prenotazioniCollegate.length > 0) {
            if (!confirm('Questo tavolo ha prenotazioni collegate. Eliminandolo verranno rimosse anche le relazioni con le prenotazioni. Continuare?')) {
                return;
            }
            // elimino prima le relazioni tavolo-prenotazione
            const eliminaRelazione = await  API_tav_function.apiDelete(API_PRENOTAZIONI,{type:tavolo, id : id_elimina});
        } else {
            // nessuna prenotazione collegata, conferma standard
            if(!confirm('vuoi eliminare quest tavolo?')){
              return;
            }
        }
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta = await fetch(`/ristorante_classic/api/tavoli.php?id=${id_elimina}`, {
            method: 'DELETE'
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i tavoli
        await caricaTavoli();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }