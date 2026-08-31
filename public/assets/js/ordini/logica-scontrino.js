async function emettiScontrino(e) {

    e.preventDefault();

    if(!(confirm('Emettere lo scontrino fiscale per questo ordine?'))) return;

    try {

        const totale =
            state.comanda.reduce(
                (sum, item) =>
                    sum +
                    Number(item.quantita) *
                    Number(item.prezzo),
                0
            );


        const dettagli =
            state.comanda.map(item => ({

                id_item:
                    Number(item.id_item),

                quantita:
                    Number(item.quantita),

                prezzo_unitario_storico:
                    Number(item.prezzo),

                aliquota_iva_storica:
                    Number(item.aliquota_iva)

            }));


        const idScontrino =
            await API_scontrino.generaScontrino(
                state.idOrdineInserito,
                totale,
                dettagli
            );


        await API_scontrino.stampaScontrino(
            idScontrino
        );


        alert(
            'Scontrino emesso e stampato con successo!'
        );


        window.location.href =
            '../tavoli/gestionetavoli.php';


    } catch (error) {

        console.error(
            'Errore emissione scontrino:',
            error
        );

        alert(
            'Errore scontrino: ' +
            error.message
        );
    }
}