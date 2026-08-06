import { apiGet } from '../apigeneric.js';

export function today() {
    const d = new Date();
    return d.toISOString().split('T')[0]; // "2026-06-30"
}

export function mostraAvviso(sezione, avviso, messaggio, positivo = false) {
    if (!sezione || !avviso) {
        console.error('Elemento sezione o avviso non trovato');
        return;
    }

    if (messaggio) {
        avviso.textContent = messaggio;
        sezione.classList.remove('warning', 'controllopositivo');
        sezione.classList.add(positivo ? 'controllopositivo' : 'warning');
    } else {
        avviso.textContent = '';
        sezione.classList.remove('warning', 'controllopositivo');
    }
}

export async function erroreRisposta(risposta) {
    const json = await risposta.json().catch(() => null);
    return new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
}

export function leggiId(elemento, params = {}){
    if (!elemento) throw new Error('Elemento non trovato per leggere l\'id');
    const idDalDataset = elemento.dataset.id;
    const idDalParams = params.id;

    if (!idDalDataset) {
        throw new Error('id non trovato nel dataset dell\'elemento passato');
    }

    if (idDalParams && String(idDalParams) !== String(idDalDataset)) {
        console.log(idDalParams, typeof(idDalParams) , idDalDataset, typeof(idDalDataset));
        throw new Error('L\'id nel dataset e quello nei params non coincidono');
    }

    return idDalDataset;
}

export function validaCampiTavolo(numero, postiMax, postiMin) {
    if (!numero || !postiMax || !postiMin ||
        numero < 0 || numero > 200 ||
        postiMax < 0 || postiMax > 30 ||
        postiMin < 0 || postiMin > 30) {
        throw new Error('Tutti i campi sono obbligatori, inserisci dei valori congrui');
    }
}

export async function controllaNumeroDisponibile(){
   
    const tavoli = await API_tav_function.apiGet(API);
    const numeri = tavoli.map(item => item.numero_tavolo);
    const avviso = document.getElementById("avviso");
    const da_inserire = document.getElementById("numero-tavolo");
    //selettore di classe con il puinto
    const sezione = document.querySelector('#controllo');
    
    
    if(!da_inserire.value){
       sezione.classList.add('warning');
       avviso.innerHTML=`il tavolo deve avere un numero!`;
       return;
    }
    if(numeri.includes(parseInt(da_inserire.value))){
       sezione.classList.remove('controllopositivo');
       sezione.classList.add('warning');
       avviso.innerHTML=`il tavolo ${da_inserire.value} è già esistente!`;
      
    }else{
       sezione.classList.remove('warning');
       avviso.innerHTML="";
       sezione.classList.add('controllopositivo');
       
    }

 }