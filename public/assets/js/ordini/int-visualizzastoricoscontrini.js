import {recuperaScontrini} from './logica-scontrino.js';
document.addEventListener('DOMContentLoaded', inizializzaStoricoScontrini);

const inputRicerca = document.getElementById('scontrini-storico');
const contenitoreStorico = document.getElementById('storico');

let scontrini = [];

//inizializza
async function inizializzaStoricoScontrini() {
     try {
        const scontrini = await caricaScontrini();
        console.log('Scontrini:', scontrini);
        renderScontrini(scontrini);
    } catch (error) {
        console.error('Errore inizializzazione storico scontrini:', error);
        mostraErrore('Impossibile caricare lo storico degli scontrini.');
    }
}

async function caricaScontrini() {
    try{
        const lista = await recuperaScontrini()
        return lista;
    }catch (error) {
        console.error('Errore nel recupero degli scontrini:', error);
        mostraErrore('Impossibile caricare lo storico degli scontrini.');
    }
}

function renderScontrini(scontrini) {
    console.log('Scontrini recuperati:', scontrini);

    contenitoreStorico.innerHTML = '';

    if (scontrini.length === 0) {
        contenitoreStorico.innerHTML = '<p>Nessuno scontrino trovato.</p>';
        return;
    }

    scontrini.forEach(scontrino => {
        contenitoreStorico.insertAdjacentHTML(
            'beforeend',
            renderScontrino(scontrino)
        );
    });
}

function renderScontrino(scontrino) {
    const idScontrino = Number(scontrino.id_scontrino);

    const data = formattaData(scontrino.data_e_ora_pagamento);

    const totale = Number(scontrino.totale);

    const annullato = Number(scontrino.attivo) === 0;

    return `
        <div class="elemento-storico" data-id="${idScontrino}">

            <div class="info-storico">

            <button class="btn-dettaglio" type="button" data-id="${idScontrino}">   
            <h3>
                    Scontrino #${idScontrino}
                </h3>
                <p>
                    (Dettaglio)
                </p>
            </button>

                <p>
                    Data: ${data}
                </p>

                <p>
                    Totale:
                    <strong>
                        ${formattaEuro(totale)}
                    </strong>
                </p>

                ${
                    annullato
                        ? `<p class="scontrino-annullato">ANNULLATO</p>`
                        : ''
                }

            </div>

            <div class="azioni-storico">

                <button
                    type="button"
                    class="btn-ristampa"
                    data-id="${idScontrino}"
                    ${annullato ? 'disabled' : ''}
                >
                    Ristampa
                </button>

                <button
                    type="button"
                    class="btn-storna"
                    data-id="${idScontrino}"
                    ${annullato ? 'disabled' : ''}
                >
                    Storna
                </button>

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

    return valore.toLocaleString('it-IT');
}

function formattaEuro(valore) {

    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(valore);
}
function mostraErrore(messaggio) {

    contenitoreStorico.innerHTML = `
        <p class="errore">
            ${messaggio}
        </p>
    `;
}
function mostraDettaglioScontrino(idScontrino) {
    //mostra il file creato nella cartella stampa per lo scontrino in una nuova finestra
   //da sviluppare.   
}
function stornaScontrino(idScontrino) {
    //chiamata api
}