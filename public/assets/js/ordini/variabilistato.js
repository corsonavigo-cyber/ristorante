export const CHIAVE_ORDINE = "id_ordine";

export const state = {
    comanda: [],           // voci selezionate
    items: [],             // anagrafica bevande caricata da precaricaBevandeForm
    tavoliInUso: [],          // tavoli confermati per l'ordine corrente
    momentoAttivo: 1,          // 1=antipasto,2=primo,3=secondo,4=dolci,5=da evadere subito
    idOrdineInserito: null,     // valorizzato solo dopo POST riuscita su ordinecompleto
    confirmGiaChiesto: false     // evita di richiedere più volte la conferma "riprendi bozza?"
};

// reset esplicito dopo l'invio definitivo della comanda al server
export function resetState() {
    Object.assign(state, {
        comanda: [],
        piatti: [],
        bevande: [],
        tavoliInUso: [],
        momentoAttivo: 1,
        idOrdineInserito: null,
        confirmGiaChiesto: false
    });

    localStorage.removeItem(CHIAVE_ORDINE);
}