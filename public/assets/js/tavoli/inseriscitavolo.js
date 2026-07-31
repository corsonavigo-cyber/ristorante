import * as API_tav_function from '../apigeneric.js';
import * as Utilis from './utils.js';

document.addEventListener('click', inserisciTavoloClick);
document.addEventListener('input',  Utilis.controllaNumeroDisponibile);

async function inserisciTavoloClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-inserisci');
        
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi inserire questo tavolo?')){
          return;
        }
        //recupero i dati dal form INPUT
        const numero_tavolo = document.getElementById('numero-tavolo').value;
        const posti_max_tavolo = document.getElementById('posti-max-tavolo').value;
        const posti_min_tavolo = document.getElementById('posti-min-tavolo').value;
         
        //validazione dati
        if (!numero_tavolo || !posti_max_tavolo || !posti_min_tavolo || numero_tavolo<0 || numero_tavolo>200 || posti_max_tavolo < 0|| posti_max_tavolo>30 ||posti_min_tavolo < 0|| posti_min_tavolo>30 ) {
            throw new Error('Tutti i campi sono obbligatori, inserisci dei valori congrui');
        }
        const payload={
                    numero_tavolo: parseInt(numero_tavolo),
                    posti_max: parseInt(posti_max_tavolo),
                    posti_min: parseInt(posti_min_tavolo)
        }
        const id_tavolo =  await API_tav_function.apiPost(API, payload);
        
        alert('tavolo inserito con successo!');
        window.location.href = "gestiotavoli.php";
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

 