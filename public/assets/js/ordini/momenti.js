import { apiGet } from '../apigeneric.js';
import { state } from './variabilistato.js';

export async function caricaMomenti() {
    if (Array.isArray(state.momenti) && state.momenti.length) {
        return state.momenti;
    }

    const momenti = await apiGet(API_ORDINI, { type: 'momenti' });

    state.momenti = Array.isArray(momenti) ? momenti : [];
    return state.momenti;
}

export async function disegnaMomenti() {

    const contenitore = document.getElementById("momenti-servizio");
    if (!contenitore) return;

    const momenti = await caricaMomenti();

    const attivo = momenti.find(
        m => Number(m.id_momento) === Number(state.momentoAttivo)
    );

    contenitore.innerHTML = `
        <div class="momenti-servizio">

            ${
                momenti.map(m=>`
                    <div class="mmomenti">
                        <button
                            class="btn-momento ${Number(m.id_momento)===Number(state.momentoAttivo) ? 'attivo':''}"
                            data-id="${m.id_momento}">
                            ${m.nome_momento}
                        </button>
                    </div>
                `).join("")
            }

        </div>

        ${
            attivo
                ? `<h3>${attivo.nome_servizio}</h3>`
                : ""
        }
    `;
}

export function cambiaMomento(idMomento){
    console.log("cambiaMomento", idMomento);
    state.momentoAttivo = Number(idMomento);

}

export function controllaMomentoSelezionato(){

    if(state.momentoAttivo == null){

        alert("Seleziona un momento del servizio");

        return false;

    }

    return true;

}