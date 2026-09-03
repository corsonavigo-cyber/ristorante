import {recuperaComandeOggi, caricaOrdine, stampaOrdine} from './ordine.js';
const contenitoreBar = document.getElementById('comande-bar');
const contenitoreCucina = document.getElementById('comande-cucina');
const destinazione = contenitoreBar ? 'bar' : contenitoreCucina ? 'cucina' : null;

const visualizzaDettaglio = document.getElementById('comanda-dettaglio');

const contenitoreComande = contenitoreBar ? contenitoreBar : contenitoreCucina;
if (contenitoreBar || contenitoreCucina) {
    document.addEventListener('DOMContentLoaded', inizializzaGestioneComande);

}else if (visualizzaDettaglio) {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('Pagina dettaglio comanda caricata');
        const urlParams = new URLSearchParams(window.location.search);
        const idComanda = Number(urlParams.get('id'));
       
    
        if (!idComanda) {
            mostraErrore('ID Comanda non specificato.');
            return;
        }
    
        try {
            const dettaglio = await recuperaDettaglioComanda(idComanda);
            console.log('Dettaglio comanda:', dettaglio);
            renderDettaglioComanda(dettaglio, destinazione);
        } catch (error) {
            console.error('Errore nel recupero del dettaglio della comanda', error);
            mostraErrore('Impossibile caricare il dettaglio della comanda.');
        }
    });
}

function renderDettaglioComanda(dettaglio, destinazione) {
    const tipo = destinazione === 'bar' ? 'bevanda' : 'piatto';

    const righe = Array.isArray(dettaglio)
        ? dettaglio.filter(item => item.tipo === tipo)
        : [];

    if (righe.length === 0) {
        visualizzaDettaglio.innerHTML = `
            <p>Nessun prodotto destinato a ${destinazione}.</p>
        `;
        return;
    }

    const ordine = righe[0];

    const perMomento = righe.reduce((gruppo, item) => {
        const idMomento = item.id_momento ?? 0;

        if (!gruppo[idMomento]) {
            gruppo[idMomento] = {
                nome: item.nome_momento ?? `Momento ${idMomento}`,
                items: []
            };
        }

        gruppo[idMomento].items.push(item);
        return gruppo;
    }, {});

    visualizzaDettaglio.innerHTML = `
        <h3>Ordine #${ordine.id_ordine}</h3>
        <p>Tavoli: ${ordine.numeri_tavoli ?? '-'}</p>
        <p>Persone: ${ordine.numero_persone ?? '-'}</p>
        <p>Stato: ${ordine.nome_stato ?? '-'}</p>

        ${Object.values(perMomento).map(momento => `
            <section class="comanda-momento">
                <h4>${momento.nome}</h4>
                <ul>
                    ${momento.items.map(item => `
                        <li class="comanda-item">
                            <strong>${item.quantita} × ${item.nome}</strong>
                            ${item.note ? `<small>Nota: ${item.note}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </section>
        `).join('')}
    `;
}

document.addEventListener('click', catturaclicK);


//inizializza
async function inizializzaGestioneComande() {
     try {
        const comande = await recuperaComandeOggi();
        console.log('Comande:', comande);
        renderComande(comande);
    } catch (error) {
        console.error('Errore inizializzazione storico :', error);
        mostraErrore('Impossibile caricare lo storico .');
    }
}


function renderComande(comande) {
    console.log('Comande recuperate:', comande);

    contenitoreComande.innerHTML = '';

    if (comande.length === 0) {
        contenitoreComande.innerHTML = '<p>Nessuno Comanda trovata.</p>';
        return;
    }

    comande.forEach(comande => {
        contenitoreComande.insertAdjacentHTML(
            'beforeend',
            renderComanda(comande)
        );
    });
}

function renderComanda(comanda) {
    const idComanda = Number(comanda.id_ordine);

    const data = formattaData(comanda.data_e_ora);
    const numeroPersone = comanda.numero_persone ?? '-';
    const tavoli = Array.isArray(comanda.numeri_tavoli)
        ? comanda.numeri_tavoli.join(', ')
        : comanda.numeri_tavoli?.trim() || '-';
    const nomeStato = comanda.nome_stato ;

    return `
        <div class="elemento-storico" data-id="${idComanda}">

            <div class="info-storico">

            <button class="btn-dettaglio" type="button" data-id="${idComanda}">   
            <h3 class="btn-dettaglio" data-id="${idComanda}">
                    Comanda #${idComanda}
                </h3>
                <p class="btn-dettaglio" data-id="${idComanda}">
                    (Dettaglio)
                </p>
            </button>

                <p>
                   Ora di Arrivo: ${data}
                </p>

                <p>
                 <strong>
                    Tavoli: ${tavoli}
                    </strong>
                </p>

                ${nomeStato}

            </div>

            <div class="azioni-storico">

                <button
                    type="button"
                    class="btn-ristampa"
                    data-id="${idComanda}"
                >
                    Ristampa
                </button>

                <a href="modificaordine.php?id=${idComanda}" class="btn">
                    Modifica
                </a>

            </div>

        </div>
    `;
}

function formattaData(data) {

    if (!data) {
        return '-';
    }

    const valore = new Date(data);

    if (Number.isNaN(valore.getTime())) {
        return data;
    }

    return valore.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}


function mostraErrore(messaggio) {

    contenitoreComande.innerHTML = `
        <p class="errore">
            ${messaggio}
        </p>
    `;
}

function mostraDettaglioComanda(idComanda,tipo) {
    if (!Number.isInteger(idComanda) || idComanda <= 0) {
        console.error('ID Comanda non valido:', idComanda);
        mostraErrore('ID Comanda non valido.');
        return;
    }
    if(!tipo || (tipo !== 'bevanda' && tipo !== 'piatto')){
        console.error('Tipo non valido:', tipo);
        mostraErrore('Tipo non valido.');
        return;
    }

    window.location.href = `visualizzaunoComanda.php?id=${idComanda}&tipo=${tipo}`;

}
async function ristampaComandaClick(idComanda, tipo = null) {
    try{
        return await stampaOrdine(idComanda, false, tipo);
    }catch (error) {
        console.error('Errore nella ristampa dello Comanda:', error);
        mostraErrore('Impossibile ristampare lo Comanda.');
        return null;
    }
}

async function catturaclicK(e){
    console.log('Evento click catturato:', e.target);
    if(e.target.closest('.btn-dettaglio-bar')|| e.target.closest('.btn-dettaglio-cucina')){
        const idComanda = parseInt(e.target.dataset.id);
        if (!idComanda) {
            console.error('ID Comanda non trovato nel dataset del pulsante.');
            mostraErrore('Impossibile visualizzare il dettaglio dello Comanda.');
            return;
        }
        tipo = e.target.closest('.btn-dettaglio-bar') ? 'bevanda' : 'piatto';
        mostraDettaglioComanda(idComanda,tipo);
        
    }

    
    if(e.target.closest('.btn-ristampa')){
        
        const idComanda = parseInt(e.target.dataset.id);
        if (!idComanda) {
            console.error('ID Comanda non trovato nel dataset del pulsante.');
            mostraErrore('Impossibile ristampare lo Comanda.');
            return;
        }
        const tipo = contenitoreBar
            ? 'bevanda'
            : contenitoreCucina
                ? 'piatto'
                : null;
        const risultato = await ristampaComandaClick(idComanda, tipo);
        if (risultato) {
            alert('Comanda ristampata correttamente.');
        }
    }
}