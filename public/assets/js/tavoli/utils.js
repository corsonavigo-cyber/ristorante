import * as API_tav_function from '../apigeneric.js';

export function today() {
    const d = new Date();
    return d.toISOString().split('T')[0]; // "2026-06-30"
}

export async function erroreRisposta(risposta){
     if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
}

export function leggiId(elemento, params = {}){
    console.log(elemento);
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