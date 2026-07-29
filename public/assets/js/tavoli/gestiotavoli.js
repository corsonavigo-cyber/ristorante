import * as API_tav_function from './apitavoli.js';
import * as Utilis from './utilis.js';

document.addEventListener('DOMContentLoaded', caricaTavoli);
document.addEventListener('click', eliminaTavoloClick);
document.addEventListener('click', eliminaPrenotazioneClick);

async function caricaTavoli(){
    const tavoli = await API_tav_function.apiGet(API);
    const lavagna = document.getElementById('lavagna_tavoli');
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande  
    lavagna.innerHTML = json.data.map(tavolo=>`
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