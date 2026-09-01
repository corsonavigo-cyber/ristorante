export async function generaScontrino(idOrdine, totale, dettagli) {

    const id = Number(idOrdine);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('ID ordine non valido.');
    }

    const response = await fetch(
        `${API_SCONTRINO}?type=nuovo_scontrino`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_ordine: id,
                totale: Number(totale),
                dettagli: dettagli
            })
        }
    );

    const text = await response.text();

    console.log('Risposta RAW server:', text);

    let result;

    try {
        result = JSON.parse(text);
    } catch {
        throw new Error(
            `Risposta non valida dal server. HTTP ${response.status}: ${text}`
        );
    }

    if (!response.ok || !result.success) {
        throw new Error(
            result.data ||
            'Errore durante la generazione dello scontrino.'
        );
    }

    return result.data;
}

export async function stampaScontrino(idScontrino) { 
    const id = Number(idScontrino);
    if ( !Number.isInteger(Number(idScontrino)) || Number(idScontrino) <= 0 ) { 
        throw new Error('ID scontrino non valido.'); 
    } 
    const response = await fetch( `${API_SCONTRINO}?type=stampa_scontrino`,
         {
         method: 'POST', headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ id_scontrino: idScontrino}) 
        } ); 
        let result;
        try { 
            result = await response.json(); 
        } catch { 
            throw new Error( 'Risposta non valida dal server.' ); 
        } 
        if (!response.ok || !result.success) {
             throw new Error( result.data || 'Errore durante la stampa dello scontrino.' );
             } 

return result.data;

}