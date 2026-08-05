import { state } from './variabilistato.js';

import {
    precaricaItemsForm,
    mostraDettaglioItem
} from './items.js';

import {
    aggiornaVoceComanda,
    disegnaPreComanda,
    ripristinaQuantitaComanda
} from './comanda.js';

import {
    controllaMomentoSelezionato,
    disegnaMomenti
} from './momenti.js';

import {
    ripristinaOrdine,
    salvaOrdine,
    svuotaOrdineSalvato
} from './localstorage.js';

import {
    precaricaTavoliForm,
    controllaTavoloDisponibile,
    selezionatavolo
} from './tavoli-ordine.js';

import { inserisciOrdine, inserisciOrdineStato, inserisciOrdineTavolo,inserisciComanda, inserisciItemOrdine } from './ordine.js';
import { apiPost } from '../apigeneric.js';

document.addEventListener('input', gestisciInputGlobali);
document.addEventListener('click', globalClick);

const primo_step = document.getElementById('primo-step');
const secondo_step = document.getElementById('secondo-step');
const hid = document.getElementById('per_ordine_id');


document.addEventListener('DOMContentLoaded', () => {
        precaricaTavoliForm().then(() => {
            // qui il DOM ha già le checkbox/input generati da precaricaTavoliForm


            const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
                .map(el => parseInt(el.value));

            if (tavoliSelezionati.length > 0) {
                controllaTavoloDisponibile(tavoliSelezionati);
            }
        });
    });


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
           
            state.idOrdineInserito = idOrdine;
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
        state.idOrdineInserito = id_ordine;

        salvaOrdine(state.idOrdineInserito, true);
        
        disegnaMomenti();
        ripristinaQuantitaComanda()

        return;
    }

    const btn_momento = e.target.closest('.btn-momento'); 

    if (btn_indietro) {
        e.preventDefault();
        primo_step.classList.remove('hider');
        secondo_step.classList.add('hider');
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.remove('attivo'));
        state.momentoAttivo = 1;
        return;
    }

    if(modal_bevande){
        
        if(!modal_bevande) return;
        console.log('visto')
        await mostraDettaglioItem(Number(modal_bevande.dataset.id));

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
        state.momentoAttivo = Number(btn_momento.dataset.id);
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
    aggiornaVoceComanda(id, {
        variazione: -1
    });
  
    
      }

    if(e.target.classList.contains("addizione")){
        const id = e.target.dataset.id;
        console.log('addizione');
        const tipo = e.target.dataset.rif;
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
                    aggiornaVoceComanda(id, {
            variazione: 1
        });

        
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
        aggiornaVoceComanda(id_piatto, {
            quantita: quantita.value,
            note: note.value,
        });
        salvaOrdine(state.idOrdineInserito, false);
    }
}