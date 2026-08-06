import * as API_tav_function from '../apigeneric.js';
import { today } from '../tavoli/utils.js';
const APItavoli = '/ristorante/api/tavoli.php';

document.addEventListener('DOMContentLoaded', elencoPrenotazioni);
document.addEventListener('click', attivaPrenotazione);
document.addEventListener('click', eliminaPrenotazioneClick);

function getServizioDaOra(ora) {
  if (!ora) return 'pranzo';
  const [h] = ora.slice(0, 5).split(':').map(Number);
  return h < 15 ? 'pranzo' : 'cena';
}

function renderPrenotazioneCard(prenotazione) {
  return `
    <div class="prenotazione">
      ${prenotazione.nome_prenotazione},
      numero persone: ${prenotazione.numero_persone},
      ${prenotazione.numero_tavoli ? 'numero tavolo ' + prenotazione.numero_tavoli : 'Non Ancora Assegnata A Un Tavolo'},
      ora ${prenotazione.ora_prenotazione} data ${prenotazione.data_in_prenotazione}
      <button type="button" data-id="${prenotazione.id_prenotazione}" data-id-tavolo="${prenotazione.id_tavoli}" class="btn-attiva-prenotazione">Attiva Prenotazione</button>
      <a href="./prenotazioni/modificaprenotazioni.php?id=${prenotazione.id_prenotazione}" data-id="${prenotazione.id_prenotazione}" data-id-tavolo="${prenotazione.id_tavoli ? prenotazione.id_tavoli : 0}" class="btn-modifica-prenotazione">Modifica Prenotazione</a>
      <button class="btn-elimina-prenotazione" data-id="${prenotazione.id_prenotazione}">Elimina 🗑️</button>
    </div>`;
}

function sortByOra(prenotazioni) {
  return [...prenotazioni].sort((a, b) => a.ora_prenotazione.localeCompare(b.ora_prenotazione));
}

function renderSection(containerId, titolo, prenotazioni) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pranzo = sortByOra(prenotazioni.filter(p => getServizioDaOra(p.ora_prenotazione) === 'pranzo'));
  const cena = sortByOra(prenotazioni.filter(p => getServizioDaOra(p.ora_prenotazione) === 'cena'));

  const renderGroup = (label, items) => `
    <h3>${label}</h3>
    ${items.length > 0 ? items.map(renderPrenotazioneCard).join('<br>') : '<p>Nessuna prenotazione in questa sezione.</p>'}
  `;

  container.innerHTML = `
    <h2>${titolo}</h2>
    ${renderGroup('Pranzo', pranzo)}
    ${renderGroup('Cena', cena)}
  `;
}

async function elencoPrenotazioni() {
  const prenotazioni = await API_tav_function.apiGet(API_PRENOTAZIONI, { type: 'prenotazioni' });
  const oggi = today();

  const prenotazioniNonAttive = prenotazioni.filter(prenotazione => prenotazione.attiva === 0);
  const prenotazioniDiOggi = prenotazioni.filter(prenotazione => prenotazione.attiva === 1 && prenotazione.data_in_prenotazione === oggi);
  const prenotazioniFuture = prenotazioni.filter(prenotazione => prenotazione.attiva === 1 && prenotazione.data_in_prenotazione > oggi);

  renderSection('lista_prenotazioni_non_attive', 'Prenotazioni non attive', prenotazioniNonAttive);
  renderSection('lista_prenotazioni_oggi', 'Prenotazioni oggi', prenotazioniDiOggi);
  renderSection('lista_prenotazioni_future_attive', 'Prenotazioni future', prenotazioniFuture);
}


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
        const id_tavolo =btn_disattiva.dataset.tavolo;
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
        window.location.href = `../ordini/inserisciordine.php?id=${id_tavolo}&id_prenotazione=${id_disattiva}`;
            
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
