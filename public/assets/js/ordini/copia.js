import { state } from './variabilistato.js';
import { mostraDettaglioItem } from './items.js';
import { aggiornaVoceComanda, ripristinaQuantitaComanda, eliminaVoce } from './comanda.js';
import { cambiaMomento, controllaMomentoSelezionato, disegnaMomenti } from './momenti.js';
import { ripristinaOrdine, salvaOrdine, svuotaOrdineSalvato, leggiOrdineSalvato } from './localstorage.js';
import { precaricaTavoliForm, controllaTavoloDisponibile } from './tavoli-ordine.js';
import { inserisciOrdine, inserisciOrdineStato, inserisciOrdineTavolo, inserisciComanda, inserisciItemOrdine } from './ordine.js';
import { apiPost, apiDelete } from '../apigeneric.js';
import { annullaOrdineInCompilazione } from './eliminazioni.js';

document.addEventListener('input', gestisciInputGlobali);
document.addEventListener('click', globalClick);

const primo_step = document.getElementById('primo-step');
const secondo_step = document.getElementById('secondo-step');
const hid = document.getElementById('per_ordine_id');

document.addEventListener('DOMContentLoaded', initPaginaOrdine);

async function initPaginaOrdine() {
    try {
        const ordineLocale = leggiOrdineSalvato();
        const idSalvato = Number(ordineLocale?.idOrdineInserito ?? state.idOrdineInserito);

        // Ordine già confermato in precedenza (idSalvato valido in localStorage):
        // salta lo step 1 e apri sempre lo step 2 al reload, senza chiedere conferma di nuovo.
        if (idSalvato > 0) {
            hid.value = idSalvato;
            state.idOrdineInserito = idSalvato;

            secondo_step.classList.remove('hider');
            primo_step.classList.add('hider');

            await disegnaMomenti();
            ripristinaQuantitaComanda();
        } else if (!primo_step.classList.contains('hider')) {
            await precaricaTavoliForm();

            const ordineRipristinato = await ripristinaOrdine();

            if (ordineRipristinato && state.idOrdineInserito) {
                hid.value = state.idOrdineInserito;
                secondo_step.classList.remove('hider');
                primo_step.classList.add('hider');
                disegnaMomenti();
                ripristinaQuantitaComanda();
            } else if (ordineLocale?.tavoli?.length) {
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
        console.error('Errore durante l\u2019inizializzazione dell\u2019ordine:', error);
        alert(error.message || 'Impossibile caricare i dati dell\u2019ordine.');
    }
}

async function globalClick(e) {
    // IMPORTANTE: closest() vuole il selettore CSS con il punto (es. '.btn-avanti'),
    // e ritorna l'ELEMENTO (o null) - non un booleano come classList.contains().
    const idOrdine = Number(hid.value);

    const btnEliminaOrdine = e.target.closest('.btn-elimina-ordine-in-corso');
    if (btnEliminaOrdine) {
        e.preventDefault();

        const ordineLocale = leggiOrdineSalvato();
        const idDaEliminare = Number(
            hid.value || state.idOrdineInserito || ordineLocale?.idOrdineInserito
        );

        if (!confirm('Vuoi annullare definitivamente l\u2019ordine in compilazione?')) return;

        try {
            await annullaOrdineInCompilazione(idDaEliminare);

            hid.value = '';
            secondo_step.classList.add('hider');
            primo_step.classList.remove('hider');

            document.querySelectorAll('.btn-momento').forEach(button => {
                button.classList.remove('attivo');
            });

            alert('Ordine in compilazione annullato.');
        } catch (error) {
            console.error('Errore durante l\u2019annullamento dell\u2019ordine:', error);
            alert(error.message || 'Impossibile annullare l\u2019ordine.');
        }
        return;
    }

    const btnAvanti = e.target.closest('.btn-avanti');
    if (btnAvanti) {
        e.preventDefault();

        try {
            const ordineLocale = leggiOrdineSalvato();
            const idSalvato = Number(
                ordineLocale?.idOrdineInserito ?? state.idOrdineInserito
            );

            // 1. Ripresa ordine parziale: non creare nulla nel database.
            if (idSalvato > 0) {
                const riprendi = confirm(
                    'È presente un ordine parzialmente compilato. Vuoi riprenderlo? Se scegli "No", verrà creato un nuovo ordine e quello precedente sarà eliminato.'
                );
                

                if (riprendi) {
                    hid.value = idSalvato;
                    state.idOrdineInserito = idSalvato;
                    state.step =  parseInt(2);
                    secondo_step.classList.remove('hider');
                    primo_step.classList.add('hider');
                    aggiornaVoceComanda(state.idOrdineInserito, true);
                    await disegnaMomenti();
                    ripristinaQuantitaComanda();
                    return;
                }
            }

            // 2. Ordine già valorizzato nel campo hidden: apri step 2.
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

            await inserisciOrdineStato(nuovoIdOrdine);
            await inserisciOrdineTavolo(nuovoIdOrdine);

            hid.value = nuovoIdOrdine;
            state.idOrdineInserito = nuovoIdOrdine;
            salvaOrdine(nuovoIdOrdine, true);

            secondo_step.classList.remove('hider');
            primo_step.classList.add('hider');

            await disegnaMomenti();
            ripristinaQuantitaComanda();
        } catch (error) {
            console.error('Errore nella creazione o ripresa dell\u2019ordine:', error);
            alert(error.message || 'Impossibile avviare l\u2019ordine.');
        }
        return;
    }
    const btn_elimina = e.target.closest('.btn-elimina-voce');
    if (btn_elimina) {
        e.preventDefault();
        const idRelazione = btn_elimina.dataset.relazione;
        eliminaVoce(idRelazione);
        return;
    }

    const btnIndietro = e.target.closest('.btn-indietro');
    if (btnIndietro) {
        e.preventDefault();
        primo_step.classList.remove('hider');
        secondo_step.classList.add('hider');
        document.querySelectorAll('.btn-momento').forEach(b => b.classList.remove('attivo'));
        state.momentoAttivo = 1;
        return;
    }

    // Verifica che questa sia davvero la classe usata sul bottone "Dettagli" della card.
    const modalItem = e.target.closest('.btn-dettaglio');
    if (modalItem) {
        console.log('Clic su bottone Dettagli per item con ID:', modalItem.dataset.id);
        e.preventDefault();
        await mostraDettaglioItem(Number(modalItem.dataset.id));
        return;
    }
    const btnChiudi = e.target.closest('.chiudiModal') ;

    if (btnChiudi) {

        e.preventDefault();

        const dialog = btnChiudi.closest('dialog');

        if (btnChiudi.dataset.salva === "true") {

            const idItem = Number(dialog.dataset.idItem);

            const quantita = Number(
                dialog.querySelector('.quantita').value
            );

            const note = dialog.querySelector('.note').value;

            aggiornaVoceComanda(idItem, {
                quantita,
                note
            });

            salvaOrdine(state.idOrdineInserito, false);

            aggiornaQuantitaItemsRenderizzati();

            disegnaPreComanda();

        }

        dialog.close();

        return;
    }

    const btnMomento = e.target.closest('.btn-momento');

    if (btnMomento) {

        e.preventDefault();

        cambiaMomento(Number(btnMomento.dataset.id));

        aggiornaQuantitaItemsRenderizzati();

        return;
    }

    const btnInserisciOrdine = e.target.closest('.btn-inserisci-ordine');
    if (btnInserisciOrdine) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) {
            if (!confirm('Vuoi stampare la comanda?')) return;
        }
        return;
    }

    const btnSottrazione = e.target.closest('.sottrazione');
    if (btnSottrazione) {
        if (!controllaMomentoSelezionato()) return;
        const id_relazione = btnSottrazione.dataset.relazione;
        aggiornaVoceComanda(btnSottrazione.dataset.id, {id_relazione_item : id_relazione, quantita: quantita ,note:  '' ,variazione: -1});
        return;
    }

    const btnAddizione = e.target.closest('.addizione');
    if (btnAddizione) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) return;
        aggiornaVoceComanda(btnSottrazione.dataset.id, {idRelazioneItem : id_relazione, quantita: quantita ,note:  '' ,variazione: +1});
        return;
    }
}

function gestisciInputGlobali(e) {
    const isQuantita = e.target.classList.contains('quantita');
    const isNote = e.target.classList.contains('note');
 
    if (!isQuantita && !isNote) return;
    if (!e.target.dataset.id) return;
 
    const id_item = Number(e.target.dataset.id);
    const quantita = document.querySelector(`.quantita[data-id="${id_item}"]`);
    const note = document.querySelector(`.note[data-id="${id_item}"]`);
 
    if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
 
    // Se l'utente scrive una nota mentre la quantità è ancora 0, la portiamo a 1
    // (altrimenti la nota resterebbe associata a un item con quantità nulla).
    if (isNote && note.value.trim() !== '' && Number(quantita.value) === 0) {
        quantita.value = 1;
    }
 
    aggiornaVoceComanda(id_item, {
        quantita: quantita.value,
        note: note?.value,
    });
 
    salvaOrdine(state.idOrdineInserito, false);
}