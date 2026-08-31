/**
 * Invia l'ordine al back-end per generare lo scontrino nel DB
 */
export async function generaScontrino(idOrdine, totale, dettagli) {
    const response = await fetch('/api/scontrino.php?type=nuovo_scontrino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_ordine: idOrdine,
            totale: totale,
            dettagli: dettagli // Array di oggetti: {id_item, quantita, prezzo_unitario, iva}
        })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.data || 'Errore nella creazione scontrino');
    
    return result.data; // Ritorna l'id_scontrino creato
}

/**
 * Richiama la funzione di stampa scontrino dal back-end
 */
export async function stampaScontrino(idScontrino) {
    const response = await fetch('/api/scontrino.php?type=stampa_scontrino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_scontrino: idScontrino })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.data || 'Errore nella stampa');
    return result.data;
}

// Esempio di gestione nel globalClick del tuo file principale
const btnEmettiScontrino = e.target.closest('#btn-emetti-scontrino');
if (btnEmettiScontrino) {
    e.preventDefault();
    
    if (!confirm('Emettere lo scontrino fiscale per questo ordine?')) return;

    try {
        // 1. Calcola il totale e prepara i dettagli dai dati che hai ricevuto
        // I dati arrivano nel formato che hai postato (array di oggetti)
        const totale = state.comanda.reduce((sum, item) => sum + (item.quantita * item.prezzo), 0);
        
        const dettagli = state.comanda.map(item => ({
            id_item: item.id_item,
            quantita: item.quantita,
            prezzo_unitario: item.prezzo,
            aliquota_iva: 22 // O prendi quello dal DB se disponibile
        }));

        // 2. Crea Scontrino
        const idScontrino = await generaScontrino(state.idOrdineInserito, totale, dettagli);
        
        // 3. Stampa Scontrino
        await stampaScontrino(idScontrino);

        alert('Scontrino emesso e stampato con successo!');
        
        // 4. Opzionale: Vai alla pagina di gestione tavoli o pulisci
        window.location.href = '../tavoli/gestionetavoli.php';

    } catch (error) {
        console.error('Errore:', error);
        alert('Errore scontrino: ' + error.message);
    }
}