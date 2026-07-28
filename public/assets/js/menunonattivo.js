import * as API_function from './commonMenu.js';

const din = window.location.search.includes('bevande');

const par = din ? {
    type: 'dettaglio',
    in_menu: 'no',
    tipo: 'bevanda'
}
:
{
    type: 'dettaglio',
    in_menu: 'no',
    tipo: 'piatto'
}
;
console.log(par);

document.addEventListener('DOMContentLoaded', visualizzaLista);
document.addEventListener('click', API_function.cambiaStato);
async function visualizzaLista(){

    try {

        const items = await API_function.apiGet(par);
        
        const scelta = items[0].tipo === 'bevanda' ? document.querySelector('#lavagna_bevande_non_attive') : document.querySelector('#lavagna_piatti_non_attivi');
        
        const h1 = document.createElement('h1');
        h1.innerHTML = `${items[0].tipo === 'bevanda' ? 'BEVANDE':'PIATTI'}`;
        scelta.appendChild(h1);
        items.forEach(item => {
            API_function.renderCardItem(item, {
                conAzioni : 'menu_no',
                target: scelta
            });
        });

    } catch (errore) {
        console.error(errore);
    }
}