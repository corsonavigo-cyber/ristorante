import { apiGet } from '../apigeneric.js'; 
import * as API_scontrino from './logica-scontrino.js';
import { showError } from './variabilistato.js';
import { caricaOrdine } from './ordine.js';

let totaleIvaOrdine = 0;

const NOMI_MOMENTI = {
1: 'Antipasti',
2: 'Primi',
3: 'Secondi',
4: 'Dolci',
5: 'Da evadere' };
let ordineCorrente = null;
let totaleOrdine = 0;
let sconto = 0; 
let aliquoteIva = {}; 
document.addEventListener( 'DOMContentLoaded', initVisualizzaOrdine );

async function initVisualizzaOrdine() 
{ 
try 
{ 
    const idOrdine = Number( new URLSearchParams( window.location.search ).get('id') );
    if (!Number.isInteger(idOrdine) || idOrdine <= 0) { 
        showError( 'ID ordine non valido.' );
        return;
        } 
    const [ items, iva ] = await Promise.all([
            caricaOrdine(idOrdine), caricaAliquoteIva()
            ]);
    if ( !Array.isArray(items) || items.length === 0 ) {
            showError( 'Nessun elemento trovato per questo ordine' );
            return;
            } 
    ordineCorrente = items;
    aliquoteIva = creaMappaAliquoteIva(iva);
    renderOrderHeader(items[0]);
    renderPrecomanda(items); 
    renderRiepilogo(items);
    attachEventListeners();
    } catch (error) { 
    console.error( 'Errore caricamento ordine:', error );
    showError( error.message || 'Errore caricamento ordine' ); 
} 
}

async function caricaAliquoteIva() { 
return apiGet( API_SCONTRINO, { type: 'iva' } ); 
} 

function creaMappaAliquoteIva(iva) { 
if (!Array.isArray(iva)) { 
    throw new Error( 'Formato aliquote IVA non valido.' ); 
} 
return iva.reduce( (mappa, valore) => { 
    const idIva = Number(valore.id_iva); 
    const aliquota = Number(valore.aliquota); 
    if ( Number.isInteger(idIva) && Number.isFinite(aliquota) ) { 
        mappa[idIva] = aliquota; 
    } 
    return mappa; 
}, {} ); 
} 

function renderOrderHeader(order) { 
const header = document.getElementById( 'order-header' ); 
header.innerHTML = ` 
<div class="order-header">
    <div> 
    <p> Tavolo: ${order.numeri_tavoli ?? '-'} </p> 
    <p> Persone: ${order.numero_persone ?? '-'} </p> 
    <p> Stato: ${order.nome_stato ?? '-'} </p> 
    </div> 
    </div> 
    `; 
}
    
function renderPrecomanda(items) {
    totaleIvaOrdine = 0;
    const container = document.getElementById( 'order-board' ); 
    const grouped = raggruppaPerMomento(items); 
    const momentiPresenti = Object.keys(grouped).sort( (a, b) => Number(a) - Number(b) ); 
    container.innerHTML = `
        <div class="precomanda"> 
        ${momentiPresenti.map( momento => renderMomento( momento, grouped[momento] ) ) .join('') } 
        </div> `; 
} 

function raggruppaPerMomento(items) { 
return items.reduce( (acc, item) => { 
    const momento = item.id_momento ?? 0; 
    if (!acc[momento]) { 
        acc[momento] = []; 
    } 
    acc[momento].push(item); 
    return acc; 
}, {} ); 
} 
function renderMomento(momento, items) {

    const nomeMomento =
        NOMI_MOMENTI[momento] ??
        items[0]?.nome_momento ??
        `Momento ${momento}`;

    return `
        <section class="precomanda-momento">

            <h3>
                ${nomeMomento}
            </h3>

            <div class="precomanda-items">

                ${items
                    .map(item => renderItem(item))
                    .join('')
                }

            </div>

        </section>
    `;
}


/**
 * Renderizza una singola voce della comanda.
 */
function renderItem(item) {

    const prezzo =Number(item.prezzo);

    const quantita =Number(item.quantita);

    const totaleRiga = prezzo * quantita;

    const aliquota = aliquoteIva[Number(item.id_iva)];

    if (!Number.isFinite(aliquota)) {
        throw new Error(
            `Aliquota IVA non trovata per id_iva ${item.id_iva}`
        );
    }

    const ivaRiga = totaleRiga * aliquota /(100 + aliquota);

    totaleIvaOrdine += ivaRiga;

    return `
        <div class="precomanda-item">

            <div class="precomanda-item-info">

                <span class="precomanda-quantita">
                    ${quantita} ×
                </span>

                <span class="precomanda-nome">
                    ${item.nome}
                </span>

            

            <span class="precomanda-prezzo">
                ${totaleRiga.toFixed(2)} €   
             </span>

            <span class="precomanda-iva">
                   di cui IVA ${aliquota}% --- ${ivaRiga.toFixed(2)} €
            </span>

            ${
                item.note
                    ? `
                        <div class="precomanda-nota">
                            Nota: ${item.note}
                        </div>
                    `
                    : ''
            }

        </div>
    `;
}
        
function renderRiepilogo(items) { 
totaleOrdine = calcolaTotale(items); 
console.log('sono tot '+ totaleOrdine)
const container = document.getElementById( 'order-total' ); 
container.innerHTML = ` 
        <div class="riepilogo-ordine"> 
        <div class="riga-totale"> 
        <span> Subtotale  </span>
        <strong id="subtotale"> ${totaleOrdine.toFixed(2)} € </strong> </div>
        <div class="riga-sconto">
        <label for="sconto"> Sconto </label>
        <div> 
        <input id="sconto" type="number" min="0" max="100" step="0.01" value="0" > 
        <span>%</span> 
        </div> 
        </div> 
        <div class="riga-totale finale">
            
            <span> Totale </span> 
            <strong id="totale-finale"> ${totaleOrdine.toFixed(2)} €  --- </strong> 

            <span>IVA</span>
            <strong id="totale-iva">${totaleIvaOrdine.toFixed(2)} € </strong>
            </div>
            </div> `; 
        } 

function calcolaTotale(items) { 
    
    return items.reduce( (totale, item) => { return totale + Number(item.prezzo) * Number(item.quantita); 

    }, 0 ); 
} 
function attachEventListeners() { 
    const inputSconto = document.getElementById( 'sconto' ); 
    inputSconto?.addEventListener( 'input', aggiornaSconto ); 
    const btnScontrino = document.getElementById( 'btn-emetti-scontrino' ); 
    btnScontrino?.addEventListener( 'click', emettiScontrino );
    }

function aggiornaSconto(event) { 
    let valore = Number(event.target.value); 
    if (!Number.isFinite(valore)) { valore = 0; } 
    valore = Math.min( 100, Math.max(0, valore) ); 
    sconto = valore;
    const totaleScontato = calcolaTotaleScontato(); 
    const ivaScontata =totaleIvaOrdine * (1 - sconto / 100);
    document.getElementById('totale-finale' ).textContent = `${totaleScontato.toFixed(2)} €`;
    document.getElementById('totale-iva').textContent =  `${ivaScontata.toFixed(2)} €`;

}

function calcolaTotaleScontato() { 
    return Number( ( totaleOrdine - (totaleOrdine*( sconto / 100)) ).toFixed(2) );
    } 
    


async function emettiScontrino(e) {

    e.preventDefault();

    if (!ordineCorrente?.length) {
        showError('Ordine non disponibile.');
        return;
    }
    if (!confirm('Emettere lo scontrino fiscale per questo ordine?')) {
        return;
    }
    const button = document.getElementById('btn-emetti-scontrino');
    try {

        button.disabled = true;
        const ordine =ordineCorrente[0];
        const totaleFinale = calcolaTotaleScontato();
        if (!Number.isFinite(totaleFinale)) {
            throw new Error(
                'Totale finale non valido.'
            );
        }
        const dettagli = preparaDettagliScontrino(
                ordineCorrente
            );
        
        const idScontrino =
            await API_scontrino.generaScontrino(
                Number(ordine.id_ordine),
                totaleFinale,
                dettagli
            );
        let idScontrinoParsed = Number(idScontrino);

        if (idScontrino === 0) {
            console.log('Scontrino già esistente per questo ordine. Recupero ID scontrino esistente...');

            const scontrino = await API_scontrino.recuperaScontrinoAttivo(ordine.id_ordine);
            console.log('Scontrino esistente:', scontrino);
            const idScontrinoEsistente = parseInt(scontrino.id_scontrino);
            console.log('ID scontrino esistente:', idScontrinoEsistente);

            idScontrinoParsed = idScontrinoEsistente;

        }
        console.log('ID scontrino generato:',idScontrinoParsed);
        await API_scontrino.stampaScontrino(
           idScontrinoParsed
        );


        alert('Scontrino emesso e stampato con successo!' );


        window.location.href = '../tavoli/gestionetavoli.php';


    } catch (error) {

        console.error( 'Errore emissione scontrino:',error);
        showError(error.message ||'Errore durante l\'emissione dello scontrino.');
        button.disabled = false;
    }
}

function preparaDettagliScontrino(items) {

    return items.map(item => {

        const idIva =Number(item.id_iva);
        const aliquota =aliquoteIva[idIva];
        if (!Number.isFinite(aliquota)) {
            throw new Error(
                `Aliquota IVA non trovata per id_iva ${idIva}.`
            );
        }
        return {
            id_item:Number(item.id_item),
            quantita:Number(item.quantita),
            prezzo_unitario_storico:Number(item.prezzo),
            aliquota_iva_storica:aliquota
            };
    });
}