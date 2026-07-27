export const API_MENU = '/ristorante/api/menu.php';

//funzione riutilizzabile gestisci errore

async function erroreInFetch(risposta) {
  const json = await risposta.json().catch(() => null);
  return new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
}

//funzione validazione id
function validaId(id) {
  if (!id) {
    throw new Error('ID mancante o non valido');
  }

  const idNumerico = Number(id);

  // Number.isInteger scarta anche i decimali (es. "5.5"), Number("") darebbe NaN comunque
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    throw new Error(`ID non valido: ${id}`);
  }

  return idNumerico; // ritorni già il numero convertito, pronto all'uso
}
// READ funzione generalizzata ottiene il type e l'id dall'url

export async function caricaItems(id = null,filtro = {}){
    if(id !== null){
        validaId(id);
    }
    const params = id ? new URLSearchParams({id}):new URLSearchParams(filtro);
    const risposta =await fetch(`${API_MENU}?${params}`);
    if(!risposta.ok) throw await new erroreInFetch(risposta);
    const json = await risposta.json();
    return json.data;
}

//WRITE generalizzata di supporto per il POST

export async function bodyInserisci(payload){
    const risposta = await fetch(API_MENU, {
        method: 'POST',
        headers : {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });
    if(!risposta.ok) throw await new erroreInFetch(risposta);
  
    const json = await risposta.json();
    return json.data;
}

//Put generalizzato payload
export async function modificaItem(id,payload){
    validaId(id);
    const risposta = await fetch(`${API_MENU}?=id=${id}`,{
        method: 'PUT',
        headers: { 'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });
    if(!risposta.ok) throw await erroreInFetch(risposta);
    const json = await risposta.json();
    return json.data;
}

//modifica attivo non attivo

export async function cambiaStato(id, in_menu){
    validaId(id);
    const risposta = await fetch(`${API_MENU}?id=${id}`,{
        method : 'PATCH',
        headers : {'Content-Type': 'application/json'},
        body : JSON.stringify({ id_item: parseInt(id), in_menu})
    });
    if(!risposta.ok) throw await erroreInFetch(risposta);
    const json = await risposta.json();
    return json.data;
}

//elimina
export async  function eliminaItem(id){
    validaId(id);
    const risposta = await fetch(`${API_MENU}?id=${id}`,{method : 'DELETE'});
    if(!risposta.ok) throw await erroreInFetch(risposta);
    const json = await risposta.json();
    return json.data;
}

//utilità
export async function nomeGiaEsistente(nome) {
  const items = await caricaItems(null, {item}); 
  return items.some(i => i.nome != nome);
  if(!risposta.ok) throw await erroreInFetch(risposta);
  const json = await risposta.json();
  return json.data;  

}

//render
// rendering condiviso: adatta il contenuto in base a tipo/categoria
export function renderCardItem(item, { conAzioni = 'menu' } = {}) {

  const alcolLabel = item.tipo === 'bevanda' && item.categoria === 'bevanda_alcolica'
    ? '<p class="comment">Contiene alcol</p>'
    : '';

  const allergeniHtml = ['piatto', 'bevanda'].includes(item.tipo)
    ? `<ul class="elenco_allergeni">
        ${item.allergeni ? item.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join('') : '<li>Nessun allergene</li>'}
       </ul>`
    : ''; // servizio/altro non hanno allergeni, non ha senso mostrare la lista vuota

  const azioni = conAzioni === 'menu'
    ? `<a class="btn" href="modificaitem.php?id=${item.id_item}">Modifica ✏️</a>
       <button class="btn-disattiva-item" data-id="${item.id_item}">Disattiva 🚫</button>`
    : `<button class="btn-attiva-item" data-id="${item.id_item}">Mostra 👁️</button>
       <a class="btn" href="modificaitem.php?id=${item.id_item}">Modifica ✏️</a>
       <button class="btn-elimina-item" data-id="${item.id_item}">Elimina 🗑️</button>`;

  return `<div class="item item-${item.tipo}" id="${item.id_item}">
    <h3 class="comment"><b>${item.nome}</b></h3>
    <p class="comment">${item.descrizione ?? ''}</p>
    <p class="comment">Prezzo: ${item.prezzo} €</p>
    ${allergeniHtml}
    <p class="comment">${item.categoria.toUpperCase()}</p>
    ${alcolLabel}
    ${azioni}
  </div>`;
}