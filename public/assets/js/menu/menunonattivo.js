import * as API_function from './commonMenu.js';

//cerca dop il ? const din = window.location.search.includes('bevande');
//cerca nel path
const din = window.location.pathname.includes('bevande');
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
document.addEventListener('click', API_function.eliminaItem);

async function visualizzaLista(){

    try {

        const items = await API_function.apiGet(par);
        console.log(items[0].tipo);
        const scelta = items[0].tipo === 'bevanda' ? document.querySelector('#lavagna_bevande_non_attive') : document.querySelector('#lavagna_piatti_non_attivi');
        console.log(scelta);
        const h3 = document.createElement('h3');
        h3.innerHTML = `${items[0].tipo === 'bevanda' ? 'BEVANDE':'PIATTI'}`;
        scelta.appendChild(h3);
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