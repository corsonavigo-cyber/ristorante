export async function generaScontrino( idOrdine, totale, dettagli ) { 
    if (!Number.isInteger(Number(idOrdine)) || Number(idOrdine) <= 0) { 
        throw new Error('ID ordine non valido.'); 
    } 
    if (!Number.isFinite(Number(totale)) || Number(totale) < 0) { 
        throw new Error('Totale scontrino non valido.');
     }
    if (!Array.isArray(dettagli) || dettagli.length === 0) { 
        throw new Error('Dettagli scontrino mancanti.'); 
    } 
    const response = await fetch( `${API_SCONTRINO}?type=nuovo_scontrino`,
         { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ id_ordine: Number(idOrdine), 
            totale: Number(totale), dettagli: dettagli }) 
        
        } ); 
        let result; 
        try { 
            result = await response.json();
         } catch {
             throw new Error( 'Risposta non valida dal server.' );
             } 
     if (!response.ok || !result.success) { 
        throw new Error( result.data || 'Errore nella creazione dello scontrino.' ); 
    } 
    const idScontrino = Number(result.data);
    if (!Number.isInteger(idScontrino) || idScontrino <= 0) { 
        throw new Error( 'Il server non ha restituito un ID scontrino valido.' );
     } 
    return idScontrino; 
    }


export async function stampaScontrino(idScontrino) { 
    if ( !Number.isInteger(Number(idScontrino)) || Number(idScontrino) <= 0 ) { 
        throw new Error('ID scontrino non valido.'); 
    } 
    const response = await fetch( `${API_SCONTRINO}?type=stampa_scontrino`,
         {
         method: 'POST', headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ id_scontrino: Number(idScontrino) }) 
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