// Ascolta entrambi i radio (stesso name="lavagnaTavoli") per mostrare/nascondere la lavagna
import { state } from './variabilistato.js';
import { mostraDettaglioItem } from './items.js';
import { aggiornaVoceComanda, eliminaVoce, initDragAndDropComanda } from './comanda.js';
import { cambiaMomento, controllaMomentoSelezionato, disegnaMomenti } from './momenti.js';
import { ripristinaOrdine, salvaOrdine, svuotaOrdineSalvato, leggiOrdineSalvato } from './localstorage.js';
import { precaricaTavoliForm, controllaTavoloDisponibile } from './tavoli-ordine.js';
import { stampaOrdine, aggiornaComandaNelDb } from './ordine.js';
import { caricaOrdine,  cambiaOrdineDalTavolo } from './ordine.js'; 

//document.addEventListener('input', gestisciInputGlobali);
document.addEventListener('click', globalClick);
document.addEventListener('DOMContentLoaded', initPaginaModificaOrdine); 
const primo_step = document.getElementById('primo-step');
const secondo_step = document.getElementById('secondo-step');
const hid = document.getElementById('per_ordine_id');
const id_ordine_arrivato = new URLSearchParams(window.location.search).get('id_ordine');

async function initPaginaModificaOrdine() {
  
        try {
        // 1. Precarica prima le checkbox dei tavoli nel DOM (altrimenti querySelector le troverebbe vuote)
        await precaricaTavoliForm();

        // 2. Carica l'ordine da modificare e popola lo state (comanda, tavoliInUso, momenti...)
        const ordineLocale = leggiOrdineSalvato();
        console.log(ordineLocale)
        if (ordineLocale && ordineLocale.idOrdineInserito == id_ordine_arrivato) {
            console.log("Ripristino ordine dal localStorage (modifica locale)");
            // Carica dallo stato locale, non dal DB
            state.comanda = ordineLocale.comanda;
            state.tavoliInUso = ordineLocale.tavoliInUso;
            state.idOrdineInserito = ordineLocale.idOrdineInserito;
            
        } else {
            console.log("Primo caricamento dal DB");
            const rispostaOrdine = await caricaOrdine(id_ordine_arrivato);
            popolaStateDaOrdine(rispostaOrdine); // Questa funzione salva anche nel localStorage
        }
      
        
        const idSalvato = Number(id_ordine_arrivato);
        if (!(idSalvato > 0)) {
            throw new Error('ID ordine mancante o non valido in URL.');
        }
        hid.value = idSalvato;
        state.idOrdineInserito = idSalvato;

        // 3. Pre-seleziona nel DOM le checkbox corrispondenti ai tavoli già assegnati (state.tavoliInUso)
        state.tavoliInUso.forEach(id => {
            const checkbox = document.querySelector(
                `input[name="tavoliSelezionati[]"][value="${id}"]`
            );
            if (checkbox) checkbox.checked = true;
        });

        

        // 5. Confronto per vedere se i tavoli spuntati differiscono da quelli salvati a DB:
        const tavoliSpuntati = [
            ...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')
        ].map(el => Number(el.value));

        const tavoliCambiati =
            tavoliSpuntati.length > 0 &&
            [...state.tavoliInUso].sort().join(',') !== [...tavoliSpuntati].sort().join(',');

        if (tavoliCambiati) {
            await cambiaOrdineDalTavolo(idSalvato, tavoliSpuntati);
            state.tavoliInUso = tavoliSpuntati;
        }

        if (tavoliSpuntati.length > 0) {
            await controllaTavoloDisponibile(tavoliSpuntati);
        }
        
        disegnaMomenti();
        
        } catch (error) {
            console.error('Errore durante l\u2019inizializzazione dell\u2019ordine:', error);
            alert(error.message || 'Impossibile caricare i dati dell\u2019ordine.');
        }
        
        initDragAndDropComanda();
    }


export function popolaStateDaOrdine(rispostaApi) {
    // Se rispostaApi è direttamente l'array, usalo direttamente
    // Se invece a volte è un oggetto {data: [...]} e a volte solo l'array, gestisci entrambi
    const righe = Array.isArray(rispostaApi) ? rispostaApi : (rispostaApi?.data ?? []);
    
    console.log('Righe processate:', righe);
    
    if (righe.length === 0) {
        console.warn("Nessuna riga trovata, verifica la struttura dei dati.");
        return;
    }

    // Dati comuni a tutte le righe
    const prima = righe[0];
    state.idOrdineInserito = prima.id_ordine;
    document.getElementById('per_ordine_id').value = prima.id_ordine;
    document.getElementById('numero-persone').value = prima.numero_persone;
    // id_tavoli può essere "1" o "1,2,3"
    state.tavoliInUso = String(prima.id_tavoli)
        .split(',')
        .map(Number);

    // Ricostruiamo la comanda
    state.comanda = righe.map(riga => ({
        id_comanda_dettaglio: riga.id_comanda_dettaglio,
        id_item: riga.id_item,
        id_momento: riga.id_momento,
        tipo: riga.tipo,
        nome: riga.nome,
        quantita: Number(riga.quantita), // Assicuriamoci che sia un numero
        note: riga.note ?? '',
        prezzo: Number(riga.prezzo)
    }));

    

    // Salva nel localStorage
    salvaOrdine(state.idOrdineInserito, true);
    // Salva una copia "congelata" per il confronto futuro
    state.comandaOriginale = JSON.parse(JSON.stringify(state.comanda)); 
}


async function globalClick(e) {
    const idOrdine = Number(hid.value);
    const dialog = document.getElementById("dettaglioModal_item");

    //1. Radio Sì/No: mostra/nasconde la lavagna tavoli
    const radioLavagna = e.target.closest('input[name="lavagnaTavoli"]');
    if (radioLavagna) {
        const tavoliBox = document.getElementById('tavoli_checkbox');
        if (radioLavagna.value === 'si') {
            tavoliBox.style.display = '';
            // Popola la lavagna solo la prima volta (se è vuota), evita richieste ripetute
            if (!tavoliBox.hasChildNodes()) {
                await precaricaTavoliForm();
            }
        } else {
            tavoliBox.style.display = 'none';
        }
        return;
    }
    // 2. Pulsante Avanti (Creazione o Ripresa Ordine)
    const btnAvanti = e.target.closest('.btn-avanti');
    if (btnAvanti ) {
        e.preventDefault();
    try {
        const ordineLocale = leggiOrdineSalvato();
        const idSalvato = Number(
            ordineLocale?.idOrdineInserito ?? state.idOrdineInserito
        );
        if (!(idSalvato > 0)) {
            alert('Nessun ordine da modificare.');
            return;
        }

        
        const tavoliSpuntati = [
            ...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')
        ].map(input => Number(input.value));

        
        const tavoliCambiati =
            tavoliSpuntati.length > 0 &&
            [...state.tavoliInUso].sort().join(',') !== [...tavoliSpuntati].sort().join(',');

        if (tavoliCambiati) {
            await cambiaOrdineDalTavolo(idSalvato, tavoliSpuntati);
            state.tavoliInUso = tavoliSpuntati;
            salvaOrdine(idSalvato, true);
        }

        hid.value = idSalvato;
        state.idOrdineInserito = idSalvato;
        state.step = 2;
        secondo_step.classList.remove('hider');
        primo_step.classList.add('hider');

        await disegnaMomenti();
    } catch (error) {
        console.error('Errore nella modifica dell\u2019ordine:', error);
        alert(error.message || 'Impossibile aggiornare l\u2019ordine.');
    }
    return;
}

    //3.bottone Salva&Stampa
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
            try {
                await aggiornaComandaNelDb(idSalvato,state.comanda);
            } catch (error) {
                console.error('Errore durante il salvataggio dell’ordine:',error);
                alert(error.message ||'Impossibile salvare la comanda.');
                return;
            }
            try {
                await stampaOrdine(idSalvato, true);
            } catch (error) {
                console.error('Errore durante la stampa dell’ordine:',error);
                alert('Ordine salvato, ma la stampa è fallita: ' +(error.message || 'errore sconosciuto'));
                return;
            }

            svuotaOrdineSalvato();

            alert('Ordine salvato e inviato alla cucina/bar con successo.');
            //svuotaOrdineSalvato();
            alert('Ordine salvato e inviato alla cucina/bar con successo.');
            //window.location.href = '../tavoli/gestionetavoli.php';
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
        aggiornaVoceComanda(idItem , {idRelazioneItem : idRelazione, variazione: -1});
        return;
    }

    const btnAddizione = e.target.closest('.addizione');
    if (btnAddizione) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) return;

        const idRelazione = btnAddizione.dataset.relazione;
        const idItem = btnAddizione.dataset.id;
        console.log(idRelazione,idItem)

        aggiornaVoceComanda(idItem , {idRelazioneItem : idRelazione, variazione: 1});
        return;
    }

    const btnModifica = e.target.closest('.btn-modifica-voce');
    if (btnModifica) {
        e.preventDefault();
        const idRelazione = btnModifica.dataset.relazione;
        const idItem = btnModifica.dataset.id;
        // Trova la voce nello stato
        const voce = state.comanda.find(v => v.id_comanda_dettaglio === Number(idRelazione));
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





