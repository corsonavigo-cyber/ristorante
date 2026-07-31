import * as API_tav_function from '../apigeneric.js';
import * as Utils from './utils.js';

document.addEventListener('DOMContentLoaded', precaricaTavolo);
document.addEventListener('click', modificaTavoloClick);

async function precaricaTavolo() {
    //funzione dell'URL in js per la ricerca al suo interno
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const tavolo = await API_tav_function.apiGet(API, { id: id});
    console.log(tavolo);
    
    document.getElementById('numero-tavolo').value = parseInt(tavolo.numero_tavolo);
    document.getElementById('posti-max-tavolo').value  = parseInt( tavolo.posti_max);
    document.getElementById('posti-min-tavolo').value = parseInt(tavolo.posti_min);
    
}
async function modificaTavoloClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-modifica');
        
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi modificare questo tavolo?')){
          return;
        }
        //recupero i dati dal form INPUT
        const numero_tavolo = document.getElementById('numero-tavolo');
        const posti_max_tavolo = document.getElementById('posti-max-tavolo');
        const posti_min_tavolo = document.getElementById('posti-min-tavolo');     
       
    
        const id = Utils.leggiId(btn);

        if (!numero_tavolo.value || !posti_max_tavolo.value || !posti_min_tavolo.value || numero_tavolo.value<0 || numero_tavolo.value>200 || posti_max_tavolo.value < 0|| posti_max_tavolo.value>30 ||posti_min_tavolo.value < 0|| posti_min_tavolo.value>30 ) {
            throw new Error('Tutti i campi sono obbligatori, inserisci dei valori congrui');
        }
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const  body = {
                    id: id,
                    numero_tavolo: parseInt(numero_tavolo.value),
                    posti_max: parseInt(posti_max_tavolo.value),
                    posti_min: parseInt(posti_min_tavolo.value)
            }
        await API_tav_function.apiPut(API, btn, body);
        
        alert('tavolo modificato con successo!');
        window.location.href = "gestionetavoli.php";
    
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }