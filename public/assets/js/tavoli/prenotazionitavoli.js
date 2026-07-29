import { today, gestisciErroreRisposta, leggiId } from './utils.js';
/*
export async function caricaPrenotazioniTavolo(id_tavolo) {
    const risposta = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo&id=${id_tavolo}`);
    const json = await risposta.json();

    // seleziono il div giusto tramite il data-attribute, non un id fisso "prenotato"
    // (un id duplicato per ogni tavolo è invalido in HTML)
    const contenitore = document.querySelector(`#prenotato[data-id-tavolo="${id_tavolo}"]`);
    if (!contenitore) return;

    const prenotazioniOggi = json.data.filter(prenotazione=>data_in_prenotazione === today());  

    if (prenotazioniOggi.length > 0){
        contenitore.innerHTML = json.data.map(p => `
            <h4 class="comment"><b>${p.nome_prenotazione}</b></h4>
            <p class="comment">${p.numero_persone} persone</p>
            <p class="comment">Ora arrivo ${p.ora_prenotazione}</p>
            <p class="comment">${p.data_in_prenotazione}</p>
            <a class="btn" href="modificaprenotazione.php?id=${p.id_prenotazione}">Modifica ✏️</a>
            <button class="btn-elimina-prenotazione" data-id="${tavolo.id_tavolo}">Elimina 🗑️</button>
        `).join('');
    } else {
        contenitore.innerHTML = `<h4>LIBERO</h4>`;
    }

export async function eliminaPrenotazioneClick(e) {
    // ...logica originale, sostituendo il blocco if(!risposta.ok){...}
    // con: await gestisciErroreRisposta(risposta);
    // e la lettura id con: const id_elimina = leggiId(btn_elimina, 'Id Mancante nel bottone!');
}*/