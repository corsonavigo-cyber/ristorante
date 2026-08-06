import { state } from './variabilistato.js';
import { mostraDettaglioItem } from './items.js';
import { aggiornaVoceComanda, ripristinaQuantitaComanda } from './comanda.js';
import { controllaMomentoSelezionato, disegnaMomenti } from './momenti.js';
import { ripristinaOrdine, salvaOrdine, svuotaOrdineSalvato, leggiOrdineSalvato } from './localstorage.js';
import { precaricaTavoliForm, controllaTavoloDisponibile } from './tavoli-ordine.js';
import { inserisciOrdine, inserisciOrdineStato, inserisciOrdineTavolo,inserisciComanda, inserisciItemOrdine } from './ordine.js';
import { apiPost, apiDelete } from '../apigeneric.js';

document.addEventListener('input', gestisciInputGlobali);
document.addEventListener('click', globalClick);

const primo_step = document.getElementById('primo-step');
const secondo_step = document.getElementById('secondo-step');
const hid = document.getElementById('per_ordine_id');


document.addEventListener('DOMContentLoaded', initPaginaOrdine);

async function initPaginaOrdine() {
    try {
        await precaricaTavoliForm();

        const ordineRipristinato = await ripristinaOrdine();

        if (ordineRipristinato && state.idOrdineInserito) {
            hid.value = state.idOrdineInserito;
            secondo_step.classList.remove('hider');
            primo_step.classList.add('hider');
            disegnaMomenti();
            ripristinaQuantitaComanda();
        } else {
            const ordineLocale = leggiOrdineSalvato();

            if (ordineLocale?.tavoli?.length) {
                ordineLocale.tavoli.forEach(id => {
                    const checkbox = document.querySelector(
                        `input[name="tavoliSelezionati[]"][value="${id}"]`
                    );

                    if (checkbox) checkbox.checked = true;
                });
            }
        }

        const tavoliSelezionati = [
            ...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')
        ].map(el => Number(el.value));

        if (tavoliSelezionati.length > 0) {
            await controllaTavoloDisponibile(tavoliSelezionati);
        }
    } catch (error) {
        console.error('Errore durante l’inizializzazione dell’ordine:', error);
        alert(error.message || 'Impossibile caricare i dati dell’ordine.');
    }
}

    async function globalClick(e) {
    const btn_avanti = e.target.closest('.btn-avanti');
    const modal_item = e.target.closest('.dettaglioModal_item');
    const idOrdine = Number(hid.value);
    const btn_indietro = e.target.closest('.btn-indietro'); 

    const btnEliminaOrdine = e.target.closest('.btn-elimina-ordine-in-corso');

    if (btnEliminaOrdine) {
        e.preventDefault();

        const ordineLocale = leggiOrdineSalvato();
        const idDaEliminare = Number(
            hid.value ||
            state.idOrdineInserito ||
            ordineLocale?.idOrdineInserito
        );

        if (!confirm('Vuoi annullare definitivamente l’ordine in compilazione?')) {
            return;
        }

        try {
            // Se esiste già nel DB, elimina ordine e relazioni collegate.
            if (idDaEliminare > 0) {
                await apiDelete(API_ORDINI, {
                    type: 'composto',
                    id: idDaEliminare
                });
            }

            // Solo dopo DELETE riuscita, elimina il salvataggio locale.
            svuotaOrdineSalvato();

            state.idOrdineInserito = null;
            state.momentoAttivo = 1;
            hid.value = '';

            secondo_step.classList.add('hider');
            primo_step.classList.remove('hider');

            document.querySelectorAll('.btn-momento').forEach(button => {
                button.classList.remove('attivo');
            });

            alert('Ordine in compilazione annullato.');
        } catch (error) {
            console.error('Errore durante l’annullamento dell’ordine:', error);
            alert(error.message || 'Impossibile annullare l’ordine.');
        }

        return;
    }
    
   if (btn_avanti) {
    e.preventDefault();

    try {
        const ordineLocale = leggiOrdineSalvato();
        const idSalvato = Number(
            ordineLocale?.idOrdineInserito ?? state.idOrdineInserito
        );

        // 1. Ripresa ordine parziale: non creare nulla nel database.
        if (idSalvato > 0) {
            const riprendi = confirm(
                'È presente un ordine parzialmente compilato. Vuoi riprenderlo?'
            );

            if (riprendi) {
                hid.value = idSalvato;
                state.idOrdineInserito = idSalvato;

                secondo_step.classList.remove('hider');
                primo_step.classList.add('hider');

                await disegnaMomenti();
                ripristinaQuantitaComanda();
                return;
            }
        }

        // 2. Se l'ordine è già stato valorizzato nel campo hidden, apri lo step 2.
        if (idOrdine > 0) {
            state.idOrdineInserito = idOrdine;

            secondo_step.classList.remove('hider');
            primo_step.classList.add('hider');

            await disegnaMomenti();
            ripristinaQuantitaComanda();
            return;
        }

        // 3. Nuovo ordine: crea ordine + relazioni iniziali.
        const nuovoIdOrdine = await inserisciOrdine();

        if (!Number.isInteger(Number(nuovoIdOrdine)) || Number(nuovoIdOrdine) <= 0) {
            throw new Error('ID del nuovo ordine non valido');
        }

        // Usa qui le firme già definite nei tuoi moduli.
        await inserisciOrdineStato(nuovoIdOrdine /*, ID_STATO_APERTO */);
        await inserisciOrdineTavolo(nuovoIdOrdine /*, tavoliSelezionati */);

        hid.value = nuovoIdOrdine;
        state.idOrdineInserito = nuovoIdOrdine;
        salvaOrdine(nuovoIdOrdine, true);

        secondo_step.classList.remove('hider');
        primo_step.classList.add('hider');

        await disegnaMomenti();
        ripristinaQuantitaComanda();
    } catch (error) {
        console.error('Errore nella creazione o ripresa dell’ordine:', error);
        alert(error.message || 'Impossibile avviare l’ordine.');
    }
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

    if(modal_item){
        
        if(!modal_item) return;
        console.log('visto')
        await mostraDettaglioItem(Number(modal_item.dataset.id));

    }
    const chiudiModal = e.target.closest('.chiudiModal'); 
    if(!chiudiModal) return;
    if(chiudiModal){
        
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
        /*inserire la relazione piatti item nel db*/
        return;
    }

    

    const btnSottrazione = e.target.closest('.sottrazione');
    const btnAddizione = e.target.closest('.addizione');

    if (btnSottrazione) {
        if (!controllaMomentoSelezionato()) {
            btnSottrazione.value = 0;
            return;
        }

        aggiornaVoceComanda(btnSottrazione.dataset.id, { variazione: -1 });
        return;
    }

    if (btnAddizione) {
        if (!controllaMomentoSelezionato()) {
            btnAddizione.value = 0;
            return;
        }

        aggiornaVoceComanda(btnAddizione.dataset.id, { variazione: 1 });
        return;
    }
}

function gestisciInputGlobali(e) {
    console.log("pigiato A!");
    // Variazione manuale quantità piatti
    if (e.target.classList.contains("quantita") || e.target.classList.contains("note")) {
        if(!e.target.dataset.id) return;
        const id_item = Number(e.target.dataset.id);
        const quantita = document.querySelector(`.quantita[data-id="${id_item}"]`);
        const note = document.querySelector(`.note[data-id="${id_item}"]`);
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
        aggiornaVoceComanda(id_item, {
            quantita: quantita.value,
            note: note.value,
        });
        salvaOrdine(state.idOrdineInserito, false);
    }
   
}