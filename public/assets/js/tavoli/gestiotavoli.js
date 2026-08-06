import * as API_tav_function from '../apigeneric.js';
import * as Utilis from './utils.js';
import  {eliminaPrenotazioneClick, disattivaPrenotazione} from '../prenotazioni/gestioneprenotazioni.js';


document.addEventListener('DOMContentLoaded', caricaTavoli);
document.addEventListener('click', eliminaTavoloClick);
document.addEventListener('click', eliminaPrenotazioneClick);
document.addEventListener('click', disattivaPrenotazione);


async function caricaTavoli (){
    const tavoli = await API_tav_function.apiGet(API);
    const lavagna = document.getElementById('lavagna_tavoli');
   
    if (!lavagna) {
        throw new Error('Elemento lavagna_tavoli non trovato');
    }
    

    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande
    lavagna.innerHTML = tavoli.map(tavolo => `
    <div class="tavolo" id="${tavolo.id_tavolo}">
       
       <h3 class="comment"><b>Numero Tavolo ${tavolo.numero_tavolo}</b></h3><a class="btn" href="modificatavolo.php?id=${tavolo.id_tavolo}">✏️</a>
       <button type="button" class="btn-elimina" data-id="${tavolo.id_tavolo}">🗑️</button>
       <p class="comment">Posti max ${tavolo.posti_max} </p>
       <!--per visualizzazione in caso di tavolo prenotato-->
       <div class="tavolo" id="prenotato" data-id-tavolo="${tavolo.id_tavolo}">  </div> 
       <!--link AJAX per inviare la modifica tavolo-->
       
    </div>`).join('');
    tavoli.forEach(tavolo =>  caricaElementiTavolo(tavolo.id_tavolo));
}

const oraInMinuti = (ora) => {
    const [ore, minuti] = ora.split(":").map(Number);
    return ore * 60 + minuti;
};

const adesso = new Date();
const minutiAttuali = adesso.getHours() * 60 + adesso.getMinutes();

const fasceOrarie = [
    { inizio: "12:00", fine: "15:00" },
    { inizio: "19:00", fine: "23:30" }
];

const fasciaLavoro = fasceOrarie.find(fascia =>
    minutiAttuali >= oraInMinuti(fascia.inizio) &&
    minutiAttuali <= oraInMinuti(fascia.fine)
);
//da inserire carica ordini su tavololo, se c'è un ordine la prenotazione viene disattivata automaticamente
async function recuperaPrenotazioniTavolo(id_tavolo) {
    return await API_tav_function.apiGet(API_PRENOTAZIONI, {
        type: 'tavolo',
        id: id_tavolo
    });
}

async function recuperaOrdiniTavolo(id_tavolo) {
    return await API_tav_function.apiGet(API_ORDINI, {
        type: 'stato',
        id: id_tavolo,
        id_stato: 1
    });
}

function filtraPrenotazioniOggi(prenotazioni) {
    if (!fasciaLavoro) return [];

    return prenotazioni.filter(prenotazione =>
        prenotazione.data_in_prenotazione === Utilis.today() &&
        oraInMinuti(prenotazione.ora_prenotazione) >= oraInMinuti(fasciaLavoro.inizio) &&
        oraInMinuti(prenotazione.ora_prenotazione) <= oraInMinuti(fasciaLavoro.fine)
    );
}

function determinaPrecedenza(ordini) {
    return ordini.length > 0 ? 'ordine' : 'prenotazione';
}

function mostraTavoloLibero(contenitore, id_tavolo) {

    contenitore.innerHTML = `
        <a href="../prenotazioni/inserisciprenotazioni.php?id=${id_tavolo}"
           class="btn btn-inserisci-prenotazione">
           Prenota
        </a>

        <h4>LIBERO</h4>

        <a href="../ordini/inserisciordine.php?id=${id_tavolo}"
           class="btn btn-inserisci-comanda">
           +Comanda
        </a>
    `;
}

function mostraPrenotazioni(contenitore, prenotazioni) {

    contenitore.innerHTML = prenotazioni.map(p => `
        <h4 class="comment"><b>${p.nome_prenotazione}</b></h4>
        <p class="comment">${p.numero_persone} persone</p>
        <p class="comment">Ora arrivo ${p.ora_prenotazione}</p>
        <p class="comment">${p.data_in_prenotazione}</p>

        <a class="btn"
           href="modificaprenotazione.php?id=${p.id_prenotazione}">
           Modifica ✏️
        </a>

        <button
            class="btn-elimina-prenotazione"
            data-id="${p.id_prenotazione}">
            Elimina 🗑️
        </button>

        <button
            class="btn-disattiva-prenotazione"
            data-id="${p.id_prenotazione}">
            Apri Ordine
        </button>
    `).join('');
}


function mostraOrdini(contenitore, ordini, id_tavolo) {

    contenitore.innerHTML = ordini.map(o => `
        <h4 class="comment"><b>Ordine Aperto</b></h4>

        <p class="comment">Tavolo ${id_tavolo}</p>

        <p class="comment">
            Stato: ${o.id_stato === 1 ? 'In corso' : 'Chiuso'}
        </p>

        <a class="btn"
           href="../ordini/visualizzaordine.php?id=${o.id_ordine}">
           Visualizza Ordine
        </a>

        <button
            class="btn-elimina-ordine"
            data-id="${o.id_ordine}">
            Elimina Ordine
        </button>
    `).join('');
}


async function caricaElementiTavolo(id_tavolo) {

    console.log(`Caricamento elementi per il tavolo ${id_tavolo}`);

    const prenotazioni = await recuperaPrenotazioniTavolo(id_tavolo);
    const ordini = await recuperaOrdiniTavolo(id_tavolo);

    const contenitore = document.querySelector(
        `#prenotato[data-id-tavolo="${id_tavolo}"]`
    );

    if (!contenitore) return;

    const prenotazioniOggi = filtraPrenotazioniOggi(prenotazioni);

    if (determinaPrecedenza(ordini) === 'ordine') {
        mostraOrdini(contenitore, ordini, id_tavolo);
        return;
    }

    if (prenotazioniOggi.length > 0) {
        mostraPrenotazioni(contenitore, prenotazioniOggi);
        return;
    }

    mostraTavoloLibero(contenitore, id_tavolo);
}


async function eliminaTavoloClick(e) {
    try {
        const btn = e.target instanceof Element ? e.target.closest('.btn-elimina') : null;

        if (!btn) return;

        const idElimina = btn.dataset.id;

        if (!idElimina) {
            throw new Error('Id mancante nel bottone!');
        }

        if (!confirm('Vuoi eliminare questo tavolo?')) {
            return;
        }

        const [prenotazioniCollegate, ordiniAperti] = await Promise.all([
        API_tav_function.apiGet(API_PRENOTAZIONI, {
            type: 'tavolo',
            id: idElimina
        }),

        API_tav_function.apiGet(API_ORDINI, {
            type: 'stato',
            id: idElimina,
            id_stato: 1
            })
        ]);

        const haOrdiniAperti = Array.isArray(ordiniAperti) && ordiniAperti.length > 0;

        if (haOrdiniAperti) {
            alert(
                'Impossibile eliminare il tavolo: sono presenti ordini aperti associati.'
            );
            return;
        }

        const haPrenotazioni = Array.isArray(prenotazioniCollegate) &&
            prenotazioniCollegate.length > 0;

        if (haPrenotazioni) {
            const conferma = confirm(
                'Questo tavolo ha prenotazioni collegate. ' +
                'Eliminandolo verranno rimosse anche le relazioni con le prenotazioni. Continuare?'
            );

            if (!conferma) return;

            await API_tav_function.apiDelete(API_PRENOTAZIONI, {
                type: 'tavolo',
                id: idElimina
            });
        }

        await API_tav_function.apiDelete(API, { id: idElimina });
        window.location.reload();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
}
