import * as API_function from './commonMenu.js';
const cont_bev = document.querySelector('#lavagna_bevande_attive');
const cont_piat = document.querySelector('#lavagna_piatti_attivo');

document.addEventListener('DOMContentLoaded', ()=> {


    visualizzaLista(cont_bev);
    visualizzaLista(cont_piat);

    
});
document.addEventListener('click', API_function.cambiaStato);
document.addEventListener('click', API_function.eliminaItem);



async function visualizzaLista(contenitore){

    if (!contenitore) {
        console.error("Contenitore mancante");
        return;
    }

    const tipo = contenitore.id.includes('bevande')
        ? 'bevanda'
        : 'piatto';

    const par = {
        type: 'dettaglio',
        in_menu: 'si',
        tipo: tipo
    };

    console.log(par);

    try {
        const items = await API_function.apiGet(par);

        const h3 = document.createElement('h3');
        h3.textContent = tipo === 'bevanda' ? 'BEVANDE' : 'PIATTI';

        contenitore.appendChild(h3);

        items.forEach(item => {
            API_function.renderCardItem(item, {
                target: contenitore
            });
        });

    } catch (errore) {
        console.error(errore);
    }
}