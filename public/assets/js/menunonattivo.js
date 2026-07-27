import * as API_INTERAZIONE_MENU from './commonMenu.js';
 
async function visualizzaLista(){
    try{
        const non_attivo = await API_INTERAZIONE_MENU.caricaItems(null, {'menu':'no'});
        
        await API_INTERAZIONE_MENU.renderCardItem(non_attivo) 

    } catch (errore) {
    console.error(errore);
  }
}

