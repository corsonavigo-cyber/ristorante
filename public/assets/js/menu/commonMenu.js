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

export async function apiGet(params = { type: 'item' }) {

    const query = new URLSearchParams(params);

    console.log(query);

    const risposta = await fetch(`${API_MENU}?${query}`);

    if (!risposta.ok) {
        throw await ErroreInFetch(risposta);
    }

    const json = await risposta.json();

    return json.data;
}

//WRITE generalizzata di supporto per il POST

export async function apiPost(payload){
    const risposta = await fetch(`${API_MENU}?type=item`, {
        method: 'POST',
        headers : {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });
    if(!risposta.ok) throw await erroreInFetch(risposta);
  
    const json = await risposta.json();
    return json.data;
}

//Put generalizzato payload
export async function apiPut(id,payload){
    validaId(id);
    const risposta = await fetch(`${API_MENU}?type=item&id=${id}`,{
        method: 'PUT',
        headers: { 'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });
    if(!risposta.ok) throw await erroreInFetch(risposta);
    const json = await risposta.json();
    return json.data;
}

//modifica attivo non attivo

export async function apiPatch(id, in_menu){
    validaId(id);
    const risposta = await fetch(`${API_MENU}?type=item&id=${id}`,{
        method : 'PATCH',
        headers : {'Content-Type': 'application/json'},
        body : JSON.stringify({ id_item: parseInt(id), in_menu})
    });
    if(!risposta.ok) throw await erroreInFetch(risposta);
    const json = await risposta.json();
    return json.data;
}

//elimina
export async function apiDelete(id) {
    validaId(id);

    const risposta = await fetch(`${API_MENU}?type=item&id=${id}`, {
        method: 'DELETE'
    });

    if (!risposta.ok) {
        throw await erroreInFetch(risposta);
    }

    const json = await risposta.json();

    return json.data;
}

//utilità
export async function nomeGiaEsistente(nome) {
  const items = await apiGet(); 
  console.log('items' , items);

  const prova = items.some( i => i.nome.trim() === nome.trim());
  console.table(prova);
  return prova;
  
}

export async function cambiaStato(e) {
    const btn_stato = e.target.closest('.btn-stato-item');

    if (!btn_stato) return;

    e.preventDefault();

    const id = btn_stato.dataset.id;
    const statoOra = btn_stato.dataset.stato;
    const in_menu = statoOra === 'si' ? 'no' : 'si';

    console.log(in_menu);

    if (!id) {
        console.log('id non trovato');
        return;
    }

    await apiPatch(id, in_menu);
    
    window.location.reload();

}
//funzione click per cancellare
export async function eliminaItem(e) {
    try {
        const btnElimina = e.target.closest('.btn-elimina-item');
        if (!btnElimina) return;

        e.preventDefault();

        const id = Number(btnElimina.dataset.id);

        if (Number.isNaN(id) || id <= 0) {
            throw new Error("ID non valido");
        }

        if (!confirm("Vuoi eliminare questo item?")) {
            return;
        }

        await apiDelete(id);

        alert("Item eliminato con successo.");

        window.location.reload();

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}


// rendering condiviso: adatta il contenuto in base a tipo/categoria
export function renderCardItem(item, { conAzioni = 'menu_si', target = null } = {}) {

  const alcolLabel = item.tipo === 'bevanda' && item.categoria === 'bevanda_alcolica'
    ? '<p class="comment">Contiene alcol</p>'
    : '';

  const allergeniHtml = ['piatto', 'bevanda'].includes(item.tipo)
    ? `<ul class="elenco_allergeni">
        ${item.id_allergeni
          ? item.nomi_allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join('')
          : '<li>Nessun allergene</li>'}
       </ul>`
    : '';

  const azioni = conAzioni === 'menu_si'
    ? `<a class="btn" href="modificaitem.php?id=${item.id_item}">Modifica ✏️</a>
       <button class="btn-stato-item" data-stato="${item.in_menu}" data-id="${item.id_item}">Disattiva 🚫</button>
       <button class="btn-elimina-item" data-id="${item.id_item}">Elimina 🗑️</button>`
    : `<a class="btn" href="modificaitem.php?id=${item.id_item}">Modifica ✏️</a> 
       <button type="button" class="btn-stato-item"  data-stato="${item.in_menu}" data-id="${item.id_item}">Mostra 👁️</button>
       <button type="button" class="btn-elimina-item" data-id="${item.id_item}">Elimina 🗑️</button>` ;

 

  const html = `
    <div class="item item-${item.tipo}" id="${item.id_item}">
      <h3 class="comment"><b>${item.nome.toUpperCase()}</b></h3>
      <p class="comment">${item.descrizione ?? ''}</p>
      <p class="comment">Prezzo: ${item.prezzo} €</p>
      ${allergeniHtml}
      <p class="comment">${item.categoria.toUpperCase()}</p>
      ${alcolLabel}
      ${azioni}
    </div>
  `;

  if (target) {
    target.insertAdjacentHTML('beforeend', html);
  }

  return html;
}

export async function controllaNomeDisponibile(){
    
    const avviso = document.getElementById("avviso");
    const sezione = document.querySelector('#controllo');
    const da_inserire = document.getElementById('nome-item').value.trim();
   
    console.log(da_inserire);

    const disponibile = await nomeGiaEsistente(da_inserire);
    console.log(`disponibile? ${disponibile}`);
    if (!da_inserire) {
       sezione.classList.add('warning');
       avviso.innerHTML=`il piatto deve avere un nome!`;
       return;
    }

      
    if(disponibile){
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML=`il piatto ${da_inserire} è già esistente!`;
    }else{
       sezione.classList.remove('warning');
       avviso.innerHTML="";
       console.log('positivo')
       sezione.classList.add('controllopositivo');
       
    }

 }