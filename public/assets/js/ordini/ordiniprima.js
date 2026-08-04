//--------------------SELETTORI-------------------------------------

//per caricare e selezionare dove avverrà l'insert dei menu
const hid = document.getElementById('per_ordine_id');
const fuorimenupiatto = document.getElementById("form-inserisci-fuorimenu-piat");
const fuorimenubevanda = document.getElementById("form-inserisci-fuorimenu-bev");
const inserisciordine = document.getElementById("form_inserisci_ordine");
const form_modifica_ordine = document.getElementById("form_modifica_ordine");
const contenitore_bev = document.getElementById('bevande_bar');
const contenitore_piatti= document.getElementById('bevande_piatti');

const primo_step = document.getElementById('primo-step');
const secondo_step = document.getElementById('secondo-step');
//funzione di controllo multipla negli inserimenti/modifiche form_inserisci_ordine
let tavoliInUso = [];
let confirmGiaChiesto = false;
let bevande = [];
let piatti = []; 
let comanda = [];
let momentoAttivo = 1;
let iniziaMomentoSelezionato = false;
let idOrdineInserito = null;
let id_tavolo_arrivato_url= new URLSearchParams(window.location.search).get('id');
///_-----------------LOCAL STORAGE--------------

const CHIAVE_ORDINE = "id_ordine";

//manca da configurare drag & drop
//manca nella comanda il riferimento a quella precisa riga dell'ordine per la modifica/cancellazione

//controllo che siamo nella pagina giusta per attivare i listener
if (fuorimenupiatto) {
    //attiva il bottone inserisci
    document.addEventListener('click', inserisciPiattoFuoriMenu);
} else if (fuorimenubevanda) {
    //attiva il bottone inserisci
    document.addEventListener('click', inserisciBevandaFuoriMenu);
}else if (contenitore_bev) {
    document.addEventListener('DOMContentLoaded', precaricaBevandeBar);
}else if (contenitore_piatti) {
    document.addEventListener('DOMContentLoaded', precaricaBevandeCucina);
}else if (inserisciordine) {
    document.addEventListener('input', gestisciInputGlobali);
    document.addEventListener('click', globalClick);

    document.addEventListener('DOMContentLoaded', () => {
        precaricaTavoliForm().then(() => {
            // qui il DOM ha già le checkbox/input generati da precaricaTavoliForm

            document.getElementById('numero-persone').addEventListener('input', controllaPostiTavoloDisponibili);
            document.getElementById('tavoli_checkbox').addEventListener('change', controllaPostiTavoloDisponibili);

            const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
                .map(el => parseInt(el.value));

            if (tavoliSelezionati.length > 0) {
                controllaPostiTavoloDisponibili();
            }
        });
    });
}



async function precaricaBevandePiatti() {
    
    const risposta = await fetch(`${API_ORDINI}?type=oggi`);
    if (!risposta.ok) {
        throw new Error("Errore nel caricamento dei piatti");
    }
    const json = await risposta.json();
    

    // seleziono il div giusto tramite il data-attribute, non un id fisso "prenotato"
   
    
    if (!contenitore_piatti) return;
    const ordiniOggi = json.data.filter(ordini=>ordini.data_e_ora.split(' ')[0] === today());
    const ordiniArray = Object.values(ordiniOggi.reduce((acc, comanda) => {

        if (!acc[comanda.id_ordine]) {
            acc[comanda.id_ordine] = {
                ...comanda,
                servizi: [],
                piatti: [],
                bevande:[]
            };
        }

        acc[comanda.id_ordine].servizi.push(comanda.nome_servizio);
        acc[comanda.id_ordine].bevande.push(comanda.bevande);
        acc[comanda.id_ordine].piatti.push(comanda.piatti);
        return acc;
    }, {})
    
    );
    console.log(ordiniArray);
    const ordiniRaggruppati  = ordiniArray.filter(comanda=> comanda.piatti[0] !== null );

    console.log(ordiniRaggruppati.length + ' lunghezza dell array piatti')
    if (ordiniRaggruppati.length > 0){
        contenitore.innerHTML = ordiniRaggruppati.map(comanda => `
            
            <h4 class="comment"><b>Tav: ${comanda.numero_tavolo}</b></h4>
            <h4 class="comment"><b>${comanda.servizi.join(', ')}</b></h4>
            <p class="comment">${comanda.numero_persone} persone</p>
            <p class="comment">Bevande:<br>${comanda.piatti.join('<br>')}</p>
            <p class="comment">ora di arrivo ${comanda.data_e_ora.split(' ')[1]}</p>
            <button class="btn-elimina-ordine" data-id="${comanda.id_ordine}">Elimina 🗑️</button>
        `).join('');
    } else {
    }

}

async function precaricaBevandeBar() {
    
    const risposta = await fetch(`${API_ORDINI}?type=oggi`);
    if (!risposta.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const json = await risposta.json();
    

    // seleziono il div giusto tramite il data-attribute, non un id fisso "prenotato"
   
    
    if (!contenitore_bev) return;
    const ordiniOggi = json.data.filter(ordini=>ordini.data_e_ora.split(' ')[0] === today());
    const ordiniArray = Object.values(ordiniOggi.reduce((acc, comanda) => {

        if (!acc[comanda.id_ordine]) {
            acc[comanda.id_ordine] = {
                ...comanda,
                servizi: [],
                piatti: [],
                bevande:[]
            };
        }

        acc[comanda.id_ordine].servizi.push(comanda.nome_servizio);
        acc[comanda.id_ordine].bevande.push(comanda.bevande);
        acc[comanda.id_ordine].piatti.push(comanda.piatti);
        return acc;
    }, {})
    
    );
    console.log(ordiniArray);
    const ordiniRaggruppati  = ordiniArray.filter(comanda=> comanda.bevande[0] !== null );

    console.log(ordiniRaggruppati.length + ' lunghezza dell array bevande')
    if (ordiniRaggruppati.length > 0){
        contenitore.innerHTML = ordiniRaggruppati.map(comanda => `
            
            <h4 class="comment"><b>Tav: ${comanda.numero_tavolo}</b></h4>
            <h4 class="comment"><b>${comanda.servizi.join(', ')}</b></h4>
            <p class="comment">${comanda.numero_persone} persone</p>
            <p class="comment">Bevande:<br>${comanda.bevande.join('<br>')}</p>
            <p class="comment">ora di arrivo ${comanda.data_e_ora.split(' ')[1]}</p>
            <button class="btn-elimina-ordine" data-id="${comanda.id_ordine}">Elimina 🗑️</button>
        `).join('');
    } else {
    }

}


async function precaricaTavoliForm(id_tavolo_arrivato_url) {
    // legge l'id dall'URL: modificaprenotazione.php?id=5
    const risposta = await fetch(`${API}`);
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento
       
    const lavagna = document.getElementById('tavoli_checkbox');
   
    id_tavolo_arrivato_url= new URLSearchParams(window.location.search).get('id');
    if(id_tavolo_arrivato_url && confirmGiaChiesto){
        await controllaPostiTavoloDisponibili();
        return;
    }
    lavagna.innerHTML = data.map(tavolo => `
       <li><label><input type="checkbox" name="tavoliSelezionati[]" id="id_${tavolo.id_tavolo}" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}</label></li>`).join('');
    console.log("ID Tavolo arrivato dall'URL:", id_tavolo_arrivato_url);
    await selezionatavolo(id_tavolo_arrivato_url);
    
}
async function selezionatavolo(id_tavolo_arrivato_url){
    if(!id_tavolo_arrivato_url) return;
    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
        checkbox.checked = parseInt(id_tavolo_arrivato_url) === parseInt(checkbox.value)? true : false;
        });

    document.getElementById('numero-persone').value = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id_tavolo_arrivato_url}"]`).dataset.posti;
    }
    
async function disegnaMomenti() {
    const risposta = await fetch(`${API_ORDINI}?type=momenti`); 
    if (!risposta.ok) { 
        throw new Error("Errore nel caricamento dei momenti");
    }
    const jsonmomenti = await risposta.json();
    const contmomento = document.getElementById('momenti-servizio');
    if (!contmomento) return;
    const momentoAttivojson =jsonmomenti.data.find(m=> Number(m.id_momento) === Number(momentoAttivo));
    const stringaTitolo = momentoAttivojson ? `<br><h3>${momentoAttivojson.nome_servizio.toUpperCase()}</h3>` : '';
    
    
    const selettori_momento=jsonmomenti.data.map(m => `<br><div class="mmomenti"><button class="btn-momento ${momentoAttivo === m.id_momento ? 'attivo' : ''}" data-id="${m.id_momento}">${m.nome_servizio}</button></div>`).join("<br>");
    contmomento.innerHTML = `<div class="momenti-servizio">${selettori_momento}</div><div> ${stringaTitolo}</div>`;
}

async function disegnaPreComanda() {
    const comanda =localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
    const visualizza_modifiche_json = document.getElementById('riassunto-ordine');

    if (!visualizza_modifiche_json) return;

    if (!comanda || !(comanda.comanda.length >0)  ) {
        console.log(comanda, comanda.comanda.length );
        visualizza_modifiche_json.innerHTML = `<li>Non hai ancora aggiunto nessun elemento</li>`;
        return;
    }
    
   const raggruppati = comanda.comanda.reduce((acc, e) => {
    console.log("da visualizzare riassunto");
        if (!acc[e.id_momento]) {
            acc[e.id_momento] = [];
        }

        acc[e.id_momento].push(e);
        
        return acc;
    },{});
    
   
    console.log(Object.entries(raggruppati));
    const NOMI_MOMENTI ={
        1: "ANTIPASTO",
        2: "PRIMO",
        3: "SECONDO",
        4: "DOLCI",
        5: "DA EVADERE SUBITO"
        };
    
    visualizza_modifiche_json.innerHTML = Object.entries(raggruppati).map(([idMomento, elementi]) => `
    <h3>${NOMI_MOMENTI[idMomento] ?? `${idMomento}`}</h3>
    <ul class="lista-momento" data-momento-id="${idMomento}">
        ${elementi.map(e => e.note !== "" ? `
            <li data-id="${e.id}" class="voce-trascinabile">
            
                ${e.nome_pietanza} × ${e.quantita} -- ${e.prezzo} €    ${e.note }
            </li>
        ` : `
            <li data-id="${e.id}" class="voce-trascinabile">
            
                ${e.nome_pietanza} × ${e.quantita} -- ${e.prezzo} €   
        ` ).join('')}
    </ul>`).join('<br>');
    }

//cluade per dra&drop
// ogni <ul> dei momenti deve avere un data-momento-id per riconoscere il target


abilitaTrascinamento(visualizza_modifiche_json, {
    onCambiaMomento: (idElemento, nuovoMomentoId) => {
        // aggiorna raggruppati / chiama la tua REST API per salvare il nuovo momento
        console.log(`Elemento ${idElemento} spostato nel momento ${nuovoMomentoId}`);
    },
    onCestina: (idElemento) => {
        console.log(`Elemento ${idElemento} da eliminare`);
    }
});

function abilitaTrascinamento(container, { onCambiaMomento, onCestina }) {
    let elementoGhost = null;
    let elementoOrigine = null;
    let ulOrigine = null;

    // zona cestino: creala una volta sola, fissa in fondo alla pagina
    let zonaCestino = document.querySelector('.zona-cestino');
    if (!zonaCestino) {
        zonaCestino = document.createElement('div');
        zonaCestino.className = 'zona-cestino';
        zonaCestino.textContent = '🗑️ Trascina qui per eliminare';
        Object.assign(zonaCestino.style, {
            position: 'fixed', bottom: '0', left: '0', width: '100%',
            padding: '16px', textAlign: 'center', background: '#c0392b',
            color: '#fff', transform: 'translateY(100%)', transition: 'transform 0.2s ease',
            zIndex: '9999'
        });
        document.body.appendChild(zonaCestino);
    }

    container.querySelectorAll('.voce-trascinabile').forEach(li => {
        li.style.touchAction = 'none'; // il trascinamento gestisce lui il movimento, niente scroll nativo
        li.style.cursor = 'grab';

        li.addEventListener('pointerdown', e => {
            elementoOrigine = li;
            ulOrigine = li.closest('.lista-momento');

            // ghost: copia visiva che segue il dito/mouse, l'originale resta semi-trasparente
            elementoGhost = li.cloneNode(true);
            Object.assign(elementoGhost.style, {
                position: 'fixed', pointerEvents: 'none', opacity: '0.85',
                width: `${li.offsetWidth}px`, zIndex: '10000', background: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: '4px'
            });
            document.body.appendChild(elementoGhost);
            spostaGhost(e.clientX, e.clientY);

            li.style.opacity = '0.3';
            zonaCestino.style.transform = 'translateY(0)'; // mostra il cestino durante il drag

            li.setPointerCapture(e.pointerId);
        });

        li.addEventListener('pointermove', e => {
            if (!elementoGhost) return;
            spostaGhost(e.clientX, e.clientY);
            evidenziaTarget(e.clientX, e.clientY);
        });

        li.addEventListener('pointerup', e => {
            if (!elementoGhost) return;
            gestisciRilascio(e.clientX, e.clientY);
            pulisci();
        });
    });

    function spostaGhost(x, y) {
        elementoGhost.style.left = `${x - elementoGhost.offsetWidth / 2}px`;
        elementoGhost.style.top = `${y - 20}px`;
    }

    function evidenziaTarget(x, y) {
        document.querySelectorAll('.lista-momento, .zona-cestino').forEach(el => el.classList.remove('drop-target'));
        elementoGhost.style.display = 'none'; // nascondi il ghost un istante per "vedere sotto"
        const sotto = document.elementFromPoint(x, y);
        elementoGhost.style.display = '';

        const ulTarget = sotto?.closest('.lista-momento');
        const cestinoTarget = sotto?.closest('.zona-cestino');
        if (ulTarget) ulTarget.classList.add('drop-target');
        if (cestinoTarget) cestinoTarget.classList.add('drop-target');
    }

    function gestisciRilascio(x, y) {
        elementoGhost.style.display = 'none';
        const sotto = document.elementFromPoint(x, y);
        elementoGhost.style.display = '';

        const idElemento = elementoOrigine.dataset.id;

        if (sotto?.closest('.zona-cestino')) {
            onCestina(idElemento);
            elementoOrigine.remove();
            return;
        }

        const ulTarget = sotto?.closest('.lista-momento');
        if (ulTarget && ulTarget !== ulOrigine) {
            const nuovoMomentoId = ulTarget.dataset.momentoId;
            ulTarget.appendChild(elementoOrigine); // sposta subito nel DOM, ottimistico
            onCambiaMomento(idElemento, nuovoMomentoId);
        }
    }

    function pulisci() {
        elementoOrigine.style.opacity = '';
        elementoGhost?.remove();
        elementoGhost = null;
        zonaCestino.style.transform = 'translateY(100%)';
        document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    }
}
async function precaricaBevandeForm() {
    const comanda =localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
    const rispostabevande = await fetch(`${API_MENU}?type=bevande`);
    const btn_fuorimenu_p = document.getElementById('linkbev');
    btn_fuorimenu_p.setAttribute('href', `nuovopiattofuorimenu.php?id=${comanda.id_ordine}`);

    if (!rispostabevande.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const jsonbevande = await rispostabevande.json();
    bevande = jsonbevande.data;
    const lavagnabevande = document.getElementById('bevande_input');
    //elementi Bevande per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnabevande.innerHTML = jsonbevande.data.filter(b => b.in_menu ===
    'si').map(bevanda => `
    
    <div class="btn-inserisci-bevandamenu-ordine ins-bev" id="nome-bevanda${bevanda.id_bevanda}"
    data-id="${bevanda.id_bevanda}"  data-nome="${bevanda.nome_bevanda}">
    <h3 class="comment" id="nome${bevanda.id_bevanda}"><b>${bevanda.nome_bevanda}</b></h3>
    <p class="comment" id="prezzo-bev${bevanda.id_bevanda}" data-prezzo="${bevanda.prezzo}">Prezzo: ${bevanda.prezzo} €</p>
    
    <div id="modal-${bevanda.id_bevanda}" data-id="${bevanda.id_bevanda}" class="dettaglioModal_bevande" >i</div>
    <div class="operazioni-aritmetiche">
    <button type="button" id="meno-quantita-bev-${bevanda.id_bevanda}" class="sottrazione"   data-id="${bevanda.id_bevanda}"  data-rif="bevanda">-</button>    
        <p id="quantita-bev-comment-${bevanda.id_bevanda}" data-id="${bevanda.id_bevanda}" data-rif="bevanda"> 0 </p>
        <button type="button" id="piu-quantita-bev-${bevanda.id_bevanda}" class="addizione"  data-id="${bevanda.id_bevanda}" data-rif="bevanda" >+</button>    
    </div>
    </div>`).join('');
    }

    async function mostraDettaglioBevanda(id_bevanda_modale){
        const modalBevande = document.getElementById('dettaglioModal_bevande');
        const contenitore = document.getElementById('dettaglioContenuto_bevande');
        console.log(id_bevanda_modale);
        contenitore.innerHTML = bevande.filter(b => b.id_bevanda === id_bevanda_modale).map(bevanda => `
        <div class="btn-inserisci-bevandamenu-ordine" id="nome-bevanda${bevanda.id_bevanda}"
        data-id="${bevanda.id_bevanda}"  data-nome="${bevanda.nome_bevanda}">
        <h3 class="comment" id="nome${bevanda.id_bevanda}"><b>${bevanda.nome_bevanda}</b></h3>
        <p class="comment" id="descrizione${bevanda.id_bevanda}">${bevanda.descrizione}</p>
        <p class="comment" id="prezzo-bev${bevanda.id_bevanda}" data-prezzo="${bevanda.prezzo}">Prezzo: ${bevanda.prezzo} €</p>
        
        <p class="comment">Contiene Alcol: ${bevanda.alcol}</p>
        <label for="quantita-bev-${bevanda.id_bevanda}">Quantità</label>
        <input type="number" step="1" class="quantita-bev"
        id="quantita-bev-${bevanda.id_bevanda}" data-id="${bevanda.id_bevanda}"
        data-tipo="bevanda" value=0 min="0" required>
        
        <br><label for="note-bev-${bevanda.id_bevanda}">Note</label>
        <input type="text" class="note-bev"
        id="note-bev-${bevanda.id_bevanda}" data-note="${bevanda.id_bevanda}" 
        data-tipo="bevanda" maxlength="100" data-id="${bevanda.id_bevanda}" placeholder="... ">
        </div>`).join('');

        modalBevande.showModal();
    }
async function precaricaPiattiForm() {
    const comanda = localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
    const id_ordine = comanda.id_ordine? comanda.id_ordine : '';
    const rispostapiatti = await fetch(`${API_MENU}?type=piatti`);
    const btn_fuorimenu = document.getElementById('linkbev');
    btn_fuorimenu.setAttribute('href', `nuovopiattofuorimenu.php?id=${comanda.id_ordine}`);

    if (!rispostapiatti.ok) {
        throw new Error("Errore nel caricamento dei piatti");
    }
    const jsonpiatti = await rispostapiatti.json();
    piatti = jsonpiatti.data;
    const lavagnapiatti = document.getElementById('piatti_input');
    //elementi Piatti per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnapiatti.innerHTML = jsonpiatti.data.filter(piatti => piatti.in_menu === 'si').map(piatto => `
    <div class="piatto" >
    <button type="button" id="nome-piatto${piatto.id_piatto}" class="btn-inserisci-piatto-ordine" data-id="${piatto.id_piatto}"  data-nome="${piatto.nome_piatto}">
    <h3 class="comment" id="nome${piatto.id_piatto}"  data-name="${piatto.nome_piatto}"><b> ${piatto.nome_piatto}</b></h3>
    <p class="comment">${piatto.descrizione}</p>
    <p class="comment" id="prezzo${piatto.id_piatto}" data-prezzo="${piatto.prezzo}">Prezzo: ${piatto.prezzo} € </p>
    <p  class="elenco_allergeni">
        ${piatto.allergeni ? piatto.allergeni.split(', ').map(a => `${a}`).join(',') : 'Nessun allergene'}
    </p>
    <label for="quantita"> Quantità </label>
    <input type="number" step="1" name="quantita" class="quantita" id="quantita${piatto.id_piatto}" data-id="${piatto.id_piatto}" data-tipo="piatto" value=0 min="0" required>
    <br><label for="note${piatto.id_piatto}">Note</label>
    <input type="text" class="note" data-id="${piatto.id_piatto}"
    id="note-${piatto.id_piatto}" data-note="${piatto.id_piatto}"
    data-tipo="piatto" maxlength="100" placeholder="... ">
    </button>
    </div>
    `).join(''); // FIX: id="btn-inserisci-piatto-ordine non chiudeva le virgolette (HTML rotto); allineato al pattern del bottone bevanda (class + data-id). "p.id_piatto" → "piatto.id_piatto"
}




// Salva a che punto siamo e cosa c'è nella comanda
function salvaOrdine(id_ordine, salvatavoli = true) {

    const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
    let ordine = {};
    const step = document.getElementById('secondo-step').classList.contains('hider') ? 1 : 2;
     if(salvatavoli){
        ordine = {
           id_ordine: id_ordine,
           step: step,
           comanda: comanda,
           tavoli: tavoliSelezionati
         }
         tavoliInUso = tavoliSelezionati;
        }else{
            ordine = {
                id_ordine: id_ordine,
                step: step,
                comanda: comanda,
                tavoli : tavoliInUso
            }
            };
        
    localStorage.setItem(CHIAVE_ORDINE, JSON.stringify(ordine));
}



// Al caricamento, ripristina step e comanda salvati
async function ripristinaOrdine() {
        console.log("sono qui 3");
        const risposta = await fetch(`${API_ORDINI}?type=oggi`);
        if (!risposta.ok) {
            throw new Error("Errore nel caricamento dell'ordine");
            return;
        }
        const ordineJson = await risposta.json();
        console.log("sono qui2");
        //controllo se l'ordine è già presente in anagrafica
        if (!ordineJson.data || ordineJson.data.length === 0) {
            console.log("ordine bozza cancellato perché non più nel db");
            svuotaOrdineSalvato();
            primo_step.classList.remove('hider');
            secondo_step.classList.add('hider');
            return;
        }
        console.log("sono qui")
        const ordine = localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];

        comanda = ordine.comanda;
        idOrdineInserito = ordine.id_ordine;
        if (Number(ordine.step) === 2) {
               primo_step.classList.add('hider');
               secondo_step.classList.remove('hider');
                console.log("comandaripristinata",comanda);
                await disegnaMomenti();
                ripristinaQuantitaComanda();
            }
    }
    
    async function ripristinaOrdineLocalS() {
        console.log("sono locals");
        const ordine = localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
        comanda = ordine.comanda;
        idOrdineInserito = ordine.id_ordine;
            
        if (Number(ordine.step) === 2) {
                primo_step.classList.add('hider');
                secondo_step.classList.remove('hider');
                    console.log("comandaripristinata",comanda);
                    await disegnaMomenti();
                    ripristinaQuantitaComanda();
                    
        }
    }


// Da chiamare quando la comanda viene inviata definitivamente al server
function svuotaOrdineSalvato() {
    idOrdineInserito = 0;

    localStorage.removeItem(CHIAVE_ORDINE);

}
/*da inserire in controlla tavoli disponibili*/
function disattivaBottoneTavolo(tavoli) {
    if(!tavoli) return console.log('letto anche se non ci sono tavoli--');
    tavoli.forEach(id_tavolo => {

        const checkbox = document.getElementById(`id_${String(id_tavolo)}`);

        console.warn(`Checkbox id_${id_tavolo} non trovata, salto`);
        checkbox.checked = false;
        checkbox.disabled = true;
    });
}
async function globalClick(e) {
    const btn_avanti = e.target.closest('.btn-avanti');
    const div =document.getElementById('piatti_input');
    const modal_bevande = e.target.closest('.dettaglioModal_bevande');
    const divbev =document.getElementById('bevande_input');
    const idOrdine = Number(hid.value);
    const btn_aggiorna = e.target.closest('.aggiorna'); 
    const btn_indietro = e.target.closest('.btn-indietro'); 
    
    if (btn_avanti) {
        
        e.preventDefault();
        //controllo per evitare che il json salvato invii la funzione senza il permesso dell'utente
        
        
        if (idOrdine > 0) {

            alert("Ordine già inserito.");
           
            idOrdineInserito = idOrdine;
            disegnaMomenti();
            
   
            secondo_step.classList.remove('hider');
            primo_step.classList.add('hider');

            console.log(idOrdine);

            salvaOrdine(idOrdine, false);
            ripristinaQuantitaComanda();
            return;
        }
        


        const id_ordine = await inserisciOrdine();
        
        if(Number.isNaN(id_ordine)){
            return alert("Non è un numero. Riprova.");
        }
        secondo_step.classList.remove('hider');
        primo_step.classList.add('hider');
        console.log(id_ordine);

        alert("Nuovo ordine inserito");
        hid.value = id_ordine;
        idOrdineInserito = id_ordine;

        salvaOrdine(idOrdineInserito, true);
        
        disegnaMomenti();
        ripristinaQuantitaComanda()

        return;
    }

    const btn_momento = e.target.closest('.btn-momento'); 

    if (btn_indietro) {
        e.preventDefault();
        primo_step.classList.remove('hide');
        secondo_step.classList.add('hide');
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.remove('attivo'));
        momentoAttivo = 1;
        return;
    }

    if(modal_bevande){
        
        if(!modal_bevande) return;
        console.log('visto')
        await mostraDettaglioBevanda(Number(modal_bevande.dataset.id));

    }
    const chiudiModal = e.target.closest('.chiudiModal'); 
    if(chiudiModal){
        if(!chiudiModal) return;
        e.preventDefault();

        chiudiModal.closest('dialog').close();
        return;
    }

    if (btn_momento) {
        e.preventDefault();
        momentoAttivo = Number(btn_momento.dataset.id);
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.remove('attivo'));
        btn_momento.classList.add('attivo');
        disegnaMomenti();
        ripristinaQuantitaComanda();
        return;
    }
    
    const btn__inserisci_ordine = e.target.closest(".btn-inserisci-ordine");
    if (btn__inserisci_ordine) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) {
            if(!confirm("vuoi stampare la comada ? ")) return false;
        };
        /*inserisciComandaDb();*/
        return;
    }

    

    if (e.target.classList.contains("sottrazione")) {
    const id = e.target.dataset.id;
    console.log('sottrazione');
    const tipo = e.target.dataset.rif;
    if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
    aggiornaSingolaVoceComanda(
        tipo,
        id,
        momentoAttivo,
        idOrdineInserito,
        false
    );
  
    
    }

    if(e.target.classList.contains("addizione")){
        const id = e.target.dataset.id;
        console.log('addizione');
        const tipo = e.target.dataset.rif;
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
            aggiornaSingolaVoceComanda(
            tipo,
            id,
            momentoAttivo,
            idOrdineInserito
        );
        
    }
}

function gestisciInputGlobali(e) {
    console.log("pigiato A!");
    // Variazione manuale quantità piatti
    if (e.target.classList.contains("quantita") || e.target.classList.contains("note")) {
        const id_piatto = Number(e.target.dataset.id);
        const quantita = document.querySelector(`.quantita[data-id="${id_piatto}"]`);
        const nome_pietanza = document.querySelector(`#nome-piatto${id_piatto}`);
        const prezzo  = document.querySelector(`#prezzo${id_piatto}`);
        const note = document.querySelector(`#note-${id_piatto}`);
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
        aggiornaVoceComanda(
            "piatto",
            nome_pietanza.dataset.nome,
            nome_pietanza.dataset.id,      
            Number(quantita.value), 
            Number(prezzo.dataset.prezzo),
            note.value,
            momentoAttivo,
            idOrdineInserito      
        );        
        salvaOrdine(idOrdineInserito, false);
        disegnaPreComanda();
    }

    // Variazione manuale quantità bevande
    if (e.target.classList.contains("quantita-bev") || e.target.classList.contains("note-bev")) {
        console.log("pigiato B!");
        const id_bevanda = Number(e.target.dataset.id);
        const quantita_bev = document.querySelector(`.quantita-bev[data-id="${id_bevanda}"]`);
        const nome_pietanza = document.querySelector(`#nome-bevanda${id_bevanda}`);
        const note_bev = document.querySelector(`#note-bev-${id_bevanda}`);
        const prezzo  = document.querySelector(`#prezzo-bev${id_bevanda}`);
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
        aggiornaVoceComanda(
            "bevanda",
             nome_pietanza.dataset.nome,
             nome_pietanza.dataset.id,      
             Number(quantita_bev.value),   
             Number(prezzo.dataset.prezzo),
             note_bev.value,
             momentoAttivo,
             idOrdineInserito
        );
        salvaOrdine(idOrdineInserito, false);
        disegnaPreComanda();
        
    }

  
} // <- mancava questa graffa di chiusura

function controllaMomentoSelezionato() {
    if (momentoAttivo === null) {
        alert("Seleziona prima un momento del servizio (es. Antipasto, Primo)!");
        return false;
    }
    return true;
}

//--------------------------COMANDA-------------------
async function inserisciComandaDb(id_ordine, comanda){

    
    
    if (!comanda || comanda.length === 0) {
        alert("elementi non selezionati");
        return;
    }
    if (!id_ordine && id_ordine !== 0 && !(hid.value === "" ) && (hid.value !== id_ordine)) {
        alert("ID ordine non valido");
        return;
    } 
    await inserisciOrdinePiatto(comanda.filter(e => e.tipo === "piatto").map(e => e.id));
    await inserisciOrdineBevanda(comanda.filter(e => e.tipo === "bevanda").map(e => e.id));
    await stampaComanda(id_ordine, comanda);
    svuotaOrdineSalvato();
}

async function stampaComanda(id_ordine,comanda){

}

function aggiornaVoceComanda(tipo, nome_pietanza, id, quantita, prezzo, note, momentoAttivo, id_ordine) {
    // Cerca se l'elemento dello stesso tipo, id e nello stesso momento di servizio esiste già nell'array comanda
    const indice = comanda.findIndex(el => el.tipo === tipo && el.id === id && el.id_momento === momentoAttivo);
    // (rinominato il parametro della callback da id_momento a el: prima "ombreggiava" il campo id_momento dell'oggetto, confondendo la lettura)
    
    if (quantita <= 0) {
        // Rimozione (Deselezione quando la quantità torna a 0)
        if (indice !== -1) comanda.splice(indice, 1);
    } else {
        // Recupero il nome dell'elemento dall'anagrafica corretta, sovrascrivendo i parametri passati
        if (tipo === "piatto") {
            const piatto = piatti.find(el => el.id === id);
            if (piatto) {
                nome_pietanza = piatto.nome_piatto;
                prezzo = piatto.prezzo;
                
            }
        } else {
            const bevanda = bevande.find(el => el.id === id);
            if (bevanda) {
                nome_pietanza = bevanda.nome_bevanda;
                prezzo = bevanda.prezzo;
                
            }
        }

        if (indice !== -1) {
            // Aggiornamento quantità esistente
            comanda[indice].quantita = quantita;
            comanda[indice].note = note;
        } else {
            // Inserimento nuova voce
            comanda.push({
                tipo: tipo,
                id: id,
                nome_pietanza: nome_pietanza,
                prezzo: prezzo,
                id_momento: momentoAttivo,
                quantita: quantita,
                note,
                id_ordine
            });
        }
    }

    salvaOrdine(id_ordine, false); 
    disegnaPreComanda();
    aggiornaInputPernuovoMomento();
    console.log("Comanda Aggiornata:", comanda);
}


//aggiorna una singola voce di 1 comanda
// aggiorna una singola voce di 1 comanda
function aggiornaSingolaVoceComanda(tipo, id, momentoAttivo, id_ordine, operazione = true) {
    // Cerca se l'elemento (stesso tipo, id, momento di servizio) esiste già in comanda
    const indice = comanda.findIndex(el => el.tipo === tipo && el.id === id && el.id_momento === momentoAttivo);
    const displ = document.querySelector(`#quantita-bev-comment-${Number(id)}`);

    if (indice !== -1) {
        // Voce esistente: incrementa/decrementa quantità
        let pezzi = Number(comanda[indice].quantita);
         
        if(operazione){
                pezzi +=  1;
                comanda[indice].quantita = pezzi;
        }else{
                pezzi -=  1;
                comanda[indice].quantita = pezzi;
                if (comanda[indice].quantita <= 0) {
                    console.log('ukokpoedfagg');
                    // Quantità azzerata: rimuovi la voce (deselezione)
                    comanda.splice(indice, 1);
                    salvaOrdine(id_ordine, false);
                    console.log('sono sottrazione  controllo' + pezzi);
                    displ.innerHTML = `<strong>0</strong>`;

                    }
                console.log('sono sottrazione ' + pezzi);
        }
        

        
    }else{
        
        if(!operazione) return;
        let nome_pietanza, prezzo;

        if (tipo === "piatto") {
            const piatto = piatti.find(e => e.id_piatto === Number(id));
            if (!piatto) return console.warn(`Piatto id ${id} non trovato`);
            nome_pietanza = piatto.nome_piatto;
            prezzo = piatto.prezzo;
        } else if (tipo === "bevanda") {
            const bevanda = bevande.find(e => e.id_bevanda === Number(id) );
            if (!bevanda) return console.warn(`Bevanda id ${id} non trovata`);
            nome_pietanza = bevanda.nome_bevanda;
            prezzo = bevanda.prezzo;
        }

        comanda.push({
            tipo ,
            id,
            nome_pietanza,
            prezzo,
            id_momento: momentoAttivo,
            quantita: 1,
            note: "",
            id_ordine
        });
        
       
    }

    salvaOrdine(id_ordine, false);
    disegnaPreComanda();
    aggiornaInputPernuovoMomento();
    console.log("Comanda aggiornata:", comanda);
}

// Ripristina i valori numerici degli input grafici quando si cambia momento del servizio

async function aggiornaInputPernuovoMomento() {

    const ordine = localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
    if (!ordine || !(Number(idOrdineInserito) === Number(ordine.id_ordine))) return;
    if (ordine.comanda.length === 0) return;

    

    
    console.log("sto ripopolando le voci già inserite " + ordine.comanda[0]);
    if(ordine.comanda.length > 0){
        
        // Popola gli input grafici con i valori della comanda
        ordine.comanda.forEach(voce => {
            const displ = document.querySelector(`#quantita-bev-comment-${Number(voce.id)}`);
            if(!(Number(momentoAttivo) === Number(voce.id_momento) )) return;
            console.log('sto mdisegnando i valori precompilati');
            const input = document.querySelector(`[data-id="${voce.id}"][data-tipo="${voce.tipo}"]`);
            const input_note = document.querySelector(`[data-note="${voce.id}"][data-tipo="${voce.tipo}"]`);
            if (input) input.value = voce.quantita;
            if(input_note) input_note.value = voce.note;
            displ.innerHTML = `<strong>${voce.quantita}</strong>`;
        });
    }
    
    
}
async function ripristinaQuantitaComanda() {
    await Promise.all([precaricaPiattiForm(), precaricaBevandeForm()]);
    await aggiornaInputPernuovoMomento();
    await disegnaPreComanda();
}


async function inserisciPiattoFuoriMenu() {
    try {
        //recupero i dati dal DOM
        const nome_piatto = document.getElementById('nome-piatto').value;
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        if (typeof nome_piatto !== "string" || nome_piatto === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }

        
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
 
        const risposta = await fetch(`${API}?type=piatti`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_piatto: String(nome_piatto),
                descrizione: String(descrizione),
                prezzo: prezzo,
                allergeni: [],
                in_menu: 'no',
                categoria: 'altro'
            })
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        // FIX: .json() ritorna una Promise, serve await prima di leggere .id
        const json = await risposta.json();
        const id_piatto = json.id;
        await inserisciOrdinePiatto(id_piatto);
        return id_piatto;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciBevandaFuoriMenu() {
    try {
        const nome_bevanda = document.getElementById('nome-bevanda').value;
        const descrizione = document.getElementById('descrizione').dataset.id;
        const prezzo = document.getElementById('prezzo');
        const alcol = document.querySelector('input[name="alcol"]:checked');

        if (typeof nome_bevanda !== "string" || nome_piatto === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
        const risposta = await fetch(`${API}?type=bevande`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_bevanda: String(nome_bevanda),
                descrizione: String(descrizione),
                prezzo: prezzo,
                allergeni: [],
                in_menu: 'no',
                alcol: alcol
            })
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        const json = await risposta.json();
        const id_bevanda = json.id;
        await inserisciOrdineBevanda(id_bevanda);
        return id_bevanda;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdine() { 
    try {
        const numero_persone = document.getElementById('numero-persone').value;

        const numPersone = parseInt(numero_persone);
        if (Number.isNaN(numPersone) || numPersone <= 0) {
            throw new Error("Inserisci un numero persone valido");
        }
        const tavoli = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
        if (tavoli.length === 0) {
            throw new Error("Seleziona almeno un tavolo");
        }
        
        console.log("Tavoli selezionati:", tavoli);
        const body = {
            id_stato: parseInt(1),
            numero_persone:  parseInt(numPersone),
            tavoli: tavoli
        };

        
        const risposta = await fetch(`${API_ORDINI}?type=ordinecompleto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        const json = await risposta.json();
     
        const id_ordine = parseInt(json.data.id_ordine)
     
        return id_ordine;
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdinePiatto(id_piatto) {
    try {
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = document.querySelector('input[name="momento"]:checked');
        if(!id_momento){
            alert('devi selezionare quando va somministrata la bevanda!')
            return;
        }
        const id_ordine_arrivato_url = parseInt(new URLSearchParams(window.location.search).get('id'));
        if(!id_ordine_arrivato_url){
           return;
        }
        
        if (typeof quantita !== "number" || Number.isNaN(quantita) || quantita <= 1) {
            throw new Error("Inserisci una quantità valida");
        }


        const body = {
            id_ordine: id_ordine_arrivato_url,
            id_piatto: id_piatto,
            id_momento: id_momento,
            quantita: quantita
        };

        const risposta = await fetch(`${API_ORDINI}?type=ordinepiatto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        const json = await risposta.json();
        const id_ordine = json.id;
        return id_ordine;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function cambiaOrdineDalTavolo(id_ordine, tavoli) {
    try {
        if (!id_ordine) {
            throw new Error('Ordine non variato, manca ID!');
        }
        if (!tavoli) {
            throw new Error('Ordine non variato, manca ID!');
        }

        const aggiornaRelazione = await fetch(`${API_ORDINI}?type=tavolo&id=${id_ordine}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_ordine: parseInt(id_ordine),
                tavoli: tavoli
            })
        });

        if (!aggiornaRelazione.ok) {
            const json = await aggiornaRelazione.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${aggiornaRelazione.status}`);
        }

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdineBevanda(id_bevanda) {
    try {
        
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = parseInt(document.getElementById('btn-inserisci-bevandamenu-ordine').dataset.id);
        if(!id_momento){
            alert('devi selezionare quando va somministrata la bevanda!');
            return;
        }
        const id_ordine_arrivato_url = parseInt(new URLSearchParams(window.location.search).get('id'));

        
        
        if (typeof quantita !== "number" || Number.isNaN(quantita) || quantita <= 1) {
            throw new Error("Inserisci una quantità valida");
        }
        

        const body = {
            id_ordine: id_ordine_arrivato_url,
            id_bevanda: id_bevanda,
            id_momento: id_momento,
            quantita: quantita
        };

        const risposta = await fetch(`${API_ORDINI}?type=ordinebevanda`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

       /*da configurare l'id ordine window.location.href = "inserisciordini.php";*/

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdineTavolo() {
    try {
        const tavoli = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
        const id_ordine = parseInt(document.getElementById('btn-avanti').dataset.id);
        const body = {
            id_ordine: id_ordine,
            tavoli: tavoli
        };

        const risposta = await fetch(`${API_ORDINI}?type=tavolo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        return true;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdineStato(id_ordine,id_stato = 1) {
    try {

        const body = {
            id_ordine: id_ordine,
            id_stato: parseInt(id_stato)
        };

        const risposta = await fetch(`${API_ORDINI}?type=stato`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        return true;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}
/*modificare per funzione*/
async function precaricaFormModificaComanda() {
   
    const id_ordine = new URLSearchParams(window.location.search).get('id');
    if (!id_ordine) return;

    const risposta = await fetch(`${API}?type=ordine&id=${id_ordine}`);
    const json = await risposta.json();
    const ordine = json.data;
    if (ordine || ordine.length === 0) return;
    //step_1
    document.getElementById('numero-persone').value =  parseFloat(ordine.numero_persone || 0) ;

    const tavoliComanda = [...new Set(tavoli.map(tavolo => tavolo.id_tavolo))];

    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
        checkbox.checked = tavoliComanda.includes(parseInt(checkbox.value));
    });
    //step_2 
    comanda = json.data.map(voce => ({
        tipo: voce.tipo.toLowerCase(),
        id: voce.tipo === "PIATTO"
            ? parseInt(voce.id_piatto)
            : parseInt(voce.id_bevanda),
        nome: voce.tipo === "PIATTO"
            ? voce.nome_bevanda
            : voce.nome_bevanda,
        prezzo: parseFloat(voce.prezzo),
        quantita: parseInt(voce.quantita),
        id_momento: parseInt(voce.id_momento)
    }));
     

    document.querySelectorAll(".quantita, .quantita-bev").forEach(input => input.value = 0);
    comanda.forEach(voce => {
        const input = document.querySelector(`[data-id="${voce.id}"][data-tipo="${voce.tipo}"]`);
        if (input) {
            input.value = voce.quantita;
        }
    });

}

/*async function modificaPrenotazioneClick(e) {
    try {
        const btn = e.target.closest('.btn-modifica-prenotazione');
        if (!btn) return;
        if (!confirm('vuoi modificare questa Prenotazione?')) return;

        const id_modifica = btn.dataset.id;
        if (!id_modifica) throw new Error('ID Prenotazione mancante');

        const nome_prenotazione = document.getElementById('nome-prenotazione').value.trim();
       
        const tavoliSelezionati = Array.from(document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')).map(el => parseInt(el.value));
        const attivo = parseInt(document.querySelector('input[name="attiva"]:checked').value, 10);
        const numero_persone = parseInt(document.getElementById('numero-persone').value, 10);

        if (!nome_prenotazione) throw new Error('Il nome della prenotazione è obbligatorio');
        if (!ora_prenotazione) throw new Error("L'ora della prenotazione è obbligatoria");
        if (Number.isNaN(numero_persone) || numero_persone <= 0) throw new Error('Inserisci un numero di persone valido');

        const type = 'prenotazioni_tavolo';

        const body = {
            nome_prenotazione: String(nome_prenotazione),
            ora_prenotazione: `${ora_prenotazione}`,
            data_in_prenotazione: String(data_in_prenotazione),
            attiva: attivo, // chiave "attiva" per matchare $body['attiva'] lato PHP
            numero_persone: numero_persone,
            tavoli: tavoliSelezionati
        };

        const risposta = await fetch(`${API}?type=${type}&id=${id_modifica}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await risposta.json().catch(() => null);

        if (!risposta.ok || !json?.success) {
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        alert('Prenotazione modificata con successo!');
        window.location.href = "gestioneprenotazioni.php";

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}
*/
//------------------------------DELETE-----------------------------------------
async function eliminaOrdineClick(id_ordine) {
    try {       

        const risposta = await fetch(`${API_ORDINI}?type=ordine&id=${id_ordine}`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        return;
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}





async function eliminaComandaClick(e) {
    try {
        const btn_elimina = e.target.closest('.btn-elimina-ordine');
        if (!btn_elimina) return;

        if (!confirm('vuoi eliminare questa comanda?')) return;

        const id_elimina = Number(btn_elimina.dataset.id);

        if (!id_elimina ) {
            throw new Error('Id Mancante nel bottone!');
        }

        if (!Number.isInteger(id_elimina)) {
            throw new Error('Id Mancante o non valido nel bottone!');
        }

        const risposta = await fetch(`${API_ORDINI}?type=composto&id=${id_elimina}`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.reload();
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function eliminaBevandaDallaComandaClick(e) {
    try {
        const btn_elimina_bevanda = e.target.closest('.btn-dissocia-bevanda');
        if (!btn_elimina) return;
        
        const id_elimina = btn_elimina.dataset.id;
        if (!id_elimina) {
            throw new Error('Id Mancante nel bottone!');
        }

        const risposta = await fetch(`${API_ORDINI}?type=ordine_bevanda&id=${id_elimina}`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.reload();
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function eliminaPiattoDallaComandaClick(e) {
    try {
        const btn_elimina_piatto = e.target.closest('.btn-dissocia-piatto');
        if (!btn_elimina) return;
        
        const id_elimina = btn_elimina.dataset.id;
        if (!id_elimina) {
            throw new Error('Id Mancante nel bottone!');
        }

        const risposta = await fetch(`${API_ORDINI}?type=ordine_piatto&id=${id_elimina}`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.reload();
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}





//utilità



  function today(){
    const d = new Date();
    return d.toISOString().split('T')[0]; // "2026-06-30"
  }

  function oggi(){
    const d = new Date();
    return d.toLocaleString("it-IT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}
    async function mostraDataOra() {
    
    const dataOggi = document.getElementById('oggi');
    dataOggi.innerHTML = `<p>${oggi()}</p>`
     
   }



    async function controllaTavoloDisponibile(tavoliSelezionati,ordine){
    const avviso = document.getElementById("avviso");
    const sezione = document.querySelector('#controllo');

    // guard: niente tavoli
    if(tavoliSelezionati.length === 0){
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `l'ordine ha bisogno di essere associato almeno tavolo!`;
        return false;
    }

    const risposta = await fetch(`${API_ORDINI}?type=oggi`);
    const jsonordini = await risposta.json();

    const jsonTavoliConOrdine = jsonordini.data.filter(p =>
        p.id_tavoli && tavoliSelezionati.some(id => p.id_tavoli.includes(id)) // FIX: tipi normalizzati a monte (int), un solo controllo
    );

  
    if (!(ordine) || ordine.length === 0) {
        console.log(`ordine ${ordine.length}! condizione falsa`);
        return false;
    }
    console.log(ordine)
    // cerca se ordine ha esattamente gli stessi tavoli selezionati
     const stessiTavoli = tavoliSelezionati.every(t => ordine.tavoli.includes(t));

    if (jsonTavoliConOrdine.length>0 || stessiTavoli >0) {
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `Questo tavolo ha già un ordine attivo!`;
        return false;
    }
    let tavoliSelezione = tavoliSelezionati;
    // somma posti letti da data-posti delle checkbox selezionate, non dagli id grezzi
    return true;
    }
   

async function controllaPostiOrdineTavolo(tavoliSelezione){
    const postiTotali = tavoliSelezione.reduce((acc, id) => {
        const checkbox = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id}"]`);
        return acc + (parseInt(checkbox?.dataset.posti, 10) || 0);
    }, 0);
    const numeroPersone = parseInt(document.getElementById('numero-persone').value, 10); // FIX: cast esplicito
    if (Number.isNaN(numeroPersone) || numeroPersone <= 0) {
        sezione.classList.add('warning');
        avviso.innerHTML = `Inserisci un numero di persone valido`;
        return false;
    }

     console.log(tavoliSelezione);
    // FIX: confronto diretto, niente più chained comparison invalido
    if (numeroPersone > postiTotali) {
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `Hai bisogno di più tavoli per ${numeroPersone} persone ti mancano da inserire ${numeroPersone-postiTotali}. Se vuoi procedere comunque, premi inserisci.`;
        return false;
    }

    return true;
}



 async function controllaPostiTavoloDisponibili(){
    
    const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
    console.log(tavoliSelezionati)
    const avviso = document.getElementById("avviso1");
    const sezione = document.querySelector('#controllo1');
    const ordine = localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
    console.log("entrato controllo funzione");

    if(tavoliSelezionati.length === 0){
        sezione.classList.remove( 'controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = "devi obbligatoriamente selezionare almeno un tavolo per procedere!";
        
        return false;
       
    }
    console.log("ordine 4 ", ordine);

    const controllo = await  controllaTavoloDisponibile(tavoliSelezionati, ordine);

     
    console.log('controllo :' + controllo);

    if (confirmGiaChiesto && ordine && Object.keys(ordine).length > 0) {
        console.log('controllo sono ordine già chiesto? :' + confirmGiaChiesto + ordine);
        tavoliInUso = tavoliSelezionati;
        idOrdineInserito = ordine.id_ordine;
        hid.value = Number(idOrdineInserito);
        hid.value = ordine.id_ordine;
        await disegnaMomenti();
        ripristinaOrdine();
        ripristinaQuantitaComanda();
        return true;
        }

    if (!controllo && !confirmGiaChiesto){
        console.log('già chiesto? ' + ordine.length )
        confirmGiaChiesto = true;
        if(ordine.length === 0) return;
        console.log("entrato controllo funzione tavolo in uso " + ordine.tavoli );
        const conferma = confirm(`Il tavolo id ${ordine.tavoli} ha già un inserimento in corso, vuoi utilizzarlo ?`);
        if(!conferma){
           svuotaOrdineSalvato();
           await disattivaBottoneTavolo(ordine.tavoli);
           await precaricaTavoliForm();

           return false;
        }
        console.log(conferma + 'ciao');
        hid.value = ordine.id_ordine;
        comanda = ordine.comanda;
        console.log('recuperando la comanda in bozza hai recuperato i piatti che avevi selezionato prima! '+ comanda )
        tavoliInUso = tavoliSelezionati;
        //Sostituire i parametri di un url in js in modo dinamico 
        const params = new URLSearchParams(window.location.search);
        params.set('id', tavoliInUso[0]);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);



       
        console.log('nooooooovo URL ' );
        await ripristinaOrdineLocalS();
        ripristinaQuantitaComanda();
        return true;
    
    }
    
    sezione.classList.remove('warning');
    avviso.innerHTML = "";
    sezione.classList.add('controllopositivo');
    
    return true;
}



