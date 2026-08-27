import { state } from './variabilistato.js';
import { mostraDettaglioItem } from './items.js';
import { aggiornaVoceComanda, eliminaVoce, initDragAndDropComanda } from './comanda.js';
import { cambiaMomento, controllaMomentoSelezionato, disegnaMomenti } from './momenti.js';
import { ripristinaOrdine, salvaOrdine, svuotaOrdineSalvato, leggiOrdineSalvato } from './localstorage.js';
import { precaricaTavoliForm, controllaTavoloDisponibile } from './tavoli-ordine.js';
import { inserisciOrdine, inserisciOrdineStato, inserisciOrdineTavolo,  inserisciItemOrdine, stampaOrdine } from './ordine.js';
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

        if (idSalvato > 0) {
            hid.value = idSalvato;
            state.idOrdineInserito = idSalvato;

            secondo_step.classList.remove('hider');
            primo_step.classList.add('hider');

            await disegnaMomenti();
            
        } else if (!primo_step.classList.contains('hider')) {
            await precaricaTavoliForm();

            const ordineRipristinato = await ripristinaOrdine();

            if (ordineRipristinato && state.idOrdineInserito) {
                hid.value = state.idOrdineInserito;
                secondo_step.classList.remove('hider');
                primo_step.classList.add('hider');
                disegnaMomenti();
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
    initDragAndDropComanda();
}

async function globalClick(e) {
    const idOrdine = Number(hid.value);
    const dialog = document.getElementById("dettaglioModal_item");
    // 1. Elimina ordine in corso
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
        //bottone Salva&Stampa
    const btnSalvaStampa = e.target.closest('#salva-ordine-stampa');
    if (btnSalvaStampa) {
        e.preventDefault();

        const idSalvato = parseInt(state.idOrdineInserito || hid.value);

        if (!(idSalvato > 0)) {
            alert('Nessun ordine da salvare.');
            return;
        }

        if (state.comanda.length === 0) {
            alert('La comanda è vuota, aggiungi almeno una voce.');
            return;
        }

        if (!confirm('L\u2019ordine verrà salvato e inviato alla cucina/bar')) {
            return;
        }
        console.log('Salvataggio e invio ordine con ID:', typeof( idSalvato), 'Voci:', state.comanda);
        try {
            await inserisciItemOrdine(idSalvato, state.comanda);
        } catch (error) {
            console.error('Errore durante il salvataggio dell\u2019ordine:', error);
            alert(error.message || 'Impossibile salvare la comanda.');
            return; // fermati qui: niente stampa se l'ordine non è stato salvato
        }

        try {
            await stampaOrdine(idSalvato);
        } catch (error) {
            console.error('Errore durante la stampa dell\u2019ordine:', error);
            alert('Ordine salvato, ma la stampa è fallita: ' + (error.message || 'errore sconosciuto'));
            svuotaOrdineSalvato(); // l'ordine ESISTE comunque a DB, ha senso svuotare lo stato locale
            return;
        }

        svuotaOrdineSalvato();
        alert('Ordine salvato e inviato alla cucina/bar con successo.');
        window.location.href = '/ordini';
        return;
    }
    // 2. Pulsante Avanti (Creazione o Ripresa Ordine)
    const btnAvanti = e.target.closest('.btn-avanti');
    if (btnAvanti) {
        e.preventDefault();

        try {
            const ordineLocale = leggiOrdineSalvato();
            const idSalvato = Number(
                ordineLocale?.idOrdineInserito ?? state.idOrdineInserito
            );

            if (idSalvato > 0) {
                const riprendi = confirm(
                    'È presente un ordine parzialmente compilato. Vuoi riprenderlo? Se scegli "No", verrà creato un nuovo ordine e quello precedente sarà eliminato.'
                );

                if (riprendi) {
                    hid.value = idSalvato;
                    state.idOrdineInserito = idSalvato;
                    state.step = parseInt(2);
                    secondo_step.classList.remove('hider');
                    primo_step.classList.add('hider');
                    aggiornaVoceComanda(state.idOrdineInserito, true);
                    await disegnaMomenti();
                    
                    return;
                }
            }

            if (idOrdine > 0) {
                state.idOrdineInserito = idOrdine;

                secondo_step.classList.remove('hider');
                primo_step.classList.add('hider');

                await disegnaMomenti();
                return;
            }

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
            
        } catch (error) {
            console.error('Errore nella creazione o ripresa dell\u2019ordine:', error);
            alert(error.message || 'Impossibile avviare l\u2019ordine.');
        }
        return;
    }

    // 3. Elimina singola voce
    const btn_elimina = e.target.closest('.btn-elimina-voce');
    if (btn_elimina) {
        e.preventDefault();
        const idRelazione = btn_elimina.dataset.relazione;
        eliminaVoce(idRelazione);
        return;
    }

    // 4. Pulsante Indietro
    const btnIndietro = e.target.closest('.btn-indietro');
    if (btnIndietro) {
        e.preventDefault();
        primo_step.classList.remove('hider');
        secondo_step.classList.add('hider');
        document.querySelectorAll('.btn-momento').forEach(b => b.classList.remove('attivo'));
        state.momentoAttivo = 1;
        return;
    }

    // 5. Pulsante Dettaglio
       const modalItem = e.target.closest('.btn-dettaglio');
    if (modalItem) {
        console.log('Clic su bottone Dettagli per item con ID:', modalItem.dataset.id);
        e.preventDefault();
        await mostraDettaglioItem(Number(modalItem.dataset.id));
        return;
    }
    
    const btnChiudi = e.target.closest('#btn-annulla-item') ;

    if (btnChiudi) {

        e.preventDefault();
        dialog.close();

        return;
    }
    
    
    const salvaModal = e.target.closest('#btn-salva-item');
    if(salvaModal){
        e.preventDefault();

        const idItem = Number(dialog.dataset.idItem);
        const idRelazioneItem = dialog.dataset.idRelazione;
        console.log("relazione "+idRelazioneItem);
        const quantita = Number(
                dialog.querySelector('.quantita-item').value
            );

        const note = dialog.querySelector('.note-item').value;

        aggiornaVoceComanda(idItem, {
            idRelazioneItem: idRelazioneItem,
            quantita: quantita,
            note: note
            });

            console.log('noteInput trovato:', note, 'valore:', note?.value);

            dialog.close();
        }

    
    const btnMomento = e.target.closest('.btn-momento');

    if (btnMomento) {

        e.preventDefault();

        cambiaMomento(Number(btnMomento.dataset.id));


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
        e.preventDefault();
        if (!controllaMomentoSelezionato()) return;
        const idRelazione = btnSottrazione.dataset.relazione;
        const idItem = btnSottrazione.dataset.id;
        aggiornaVoceComanda(idItem , {id_comanda_dettaglio : idRelazione, variazione: -1});
        return;
    }

    const btnAddizione = e.target.closest('.addizione');
    if (btnAddizione) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) return;

        const idRelazione = btnAddizione.dataset.relazione;
        const idItem = btnAddizione.dataset.id;
        aggiornaVoceComanda(idItem , {id_comanda_dettaglio : idRelazione, variazione: 1});
        return;
    }

    const btnModifica = e.target.closest('.btn-modifica-voce');
    if (btnModifica) {
        e.preventDefault();
        const idRelazione = btnModifica.dataset.relazione;
        const idItem = btnModifica.dataset.id;
        
        // Trova la voce nello stato
        const voce = state.comanda.find(v => v.id_comanda_dettaglio === idRelazione);
        if (voce) {
            // Riusiamo la funzione mostraDettaglioItem, ma dobbiamo dirle che è una modifica
            mostraDettaglioItem(idItem, voce); 
        }   
        return;
    }

}
    async function gestisciInputGlobali(e) {
    const target = e.target;
    
    // Controlliamo se l'elemento è una nota o un input quantità manuale
    const isNote = target.classList.contains('note') || target.classList.contains('note-bev');
    const isQuantita = target.classList.contains('quantita');

    if (!isNote && !isQuantita) return;

    if (!controllaMomentoSelezionato()) { 
        target.value = 0; 
        return; 
    }

    const id_item = Number(target.dataset.id);
    const tipo = target.dataset.tipo;
    const idRelazione = target.dataset.relazione; // Recupera l'UUID (idRelazioneItem)

    // Trova i relativi elementi della stessa riga identificandoli con l'UUID
    const quantitaInput = document.querySelector(`input[data-id="${id_item}"][data-tipo="${tipo}"][data-relazione="${idRelazione}"].quantita`)
                          || document.querySelector(`p[data-id="${id_item}"][data-tipo="${tipo}"][data-relazione="${idRelazione}"]`);
    
    const noteInput = document.querySelector(`[data-id="${id_item}"][data-tipo="${tipo}"][data-relazione="${idRelazione}"].note`) 
                      || document.querySelector(`[data-id="${id_item}"][data-tipo="${tipo}"][data-relazione="${idRelazione}"].note-bev`);

    let valoreQuantita = quantitaInput ? Number(quantitaInput.value || quantitaInput.textContent) : 0;

    // Se scrive una nota ma la quantità è a 0, la forza a 1
    if (isNote && target.value.trim() !== '' && valoreQuantita === 0) {
        valoreQuantita = 1;
        if (quantitaInput) {
            if (quantitaInput.tagName === 'INPUT') quantitaInput.value = 1;
            else quantitaInput.textContent = '1';
        }
    }

    // Aggiorna lo stato globale e la precomanda rispettando i parametri richiesti
    aggiornaVoceComanda(id_item, {
        idRelazioneItem: idRelazione,
        quantita: valoreQuantita,
        note: noteInput ? noteInput.value : ''
    });
}
