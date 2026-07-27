 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei menu
  const lavagna_menu_attivo = document.getElementById('lavagna_menu_attivo');
  const lavagna_piatti_nonattivi = document.getElementById('lavagna_piatti_nonattivi');
  const lavagna_bevande_nonattive = document.getElementById('lavagna_bevande_nonattive');
  const form_inserisci= document.getElementById('form_inserisci');
  const form_inserisci_bevanda= document.getElementById('form_inserisci_bevanda');
  const form_modifica= document.getElementById('form_modifica');
  const da_inserire = document.getElementById("nome_piatto");
  const form_modifica_bevanda= document.getElementById('form_modifica_bevanda');
  let initialized = false; 

  function initBevande() {
    if (initialized) return;
    initialized = true;
    precaricaFormModifica();
   }
  //controllo che siamo nella pagina elenco Menu prima di avviare il riempimento
  if (lavagna_menu_attivo) {
      //aggiungo il lissener al caricamento se siamo nell'ambiente giusto
      document.addEventListener('DOMContentLoaded', caricaMenuAttivo);
      //il bottone togli dal menu lo attivo solo se seno nell'elenco attivo
      document.addEventListener('click', togliPiattoClick);
      document.addEventListener('click', togliBevandaClick);
  }else if(form_inserisci){
      //attiva il bottone inserisci
      document.addEventListener('click', inserisciPiattoClick);
      document.addEventListener('input', controllaNomeDisponibile);
      /*document.addEventListener('click', inserisciAllergeneClick);*/
  }else if(form_inserisci_bevanda){
      //attiva il bottone inserisci
      
      document.addEventListener('click', inserisciBevandaClick);
      document.addEventListener('input', controllaNomeBevandaDisponibile);
      /*document.addEventListener('click', inserisciAllergeneClick);*/
  }else if(form_modifica){
      //attiva il bottone inserisci
      document.addEventListener('click', modificaPiattoClick);
      document.addEventListener('DOMContentLoaded', initBevande);
      /*document.addEventListener('click', modificaBevandaClick);*/
      document.addEventListener('input', controllaNomeDisponibile);
      
  }else if(form_modifica_bevanda){
      //attiva il bottone inserisci
      document.addEventListener('DOMContentLoaded', precaricaFormModificaBevanda);
      /*document.addEventListener('click', modificaBevandaClick);*/
      document.addEventListener('input', controllaNomeBevandaDisponibile);
      document.addEventListener('click', modificaBevandaClick);
      
  }else if(lavagna_piatti_nonattivi){
      //aggiungo il lissener al caricamento se siamo nell'ambiente giusto
      document.addEventListener('DOMContentLoaded', caricaPiattiNonAttivi);
      //il bottone elimina lo attivo solo se seno nell'elenco menu non attivo
      document.addEventListener('click', eliminaPiattoClick);
      document.addEventListener('click', aggiungiPiattoClick);
     
  }else if(lavagna_bevande_nonattive){
      document.addEventListener('DOMContentLoaded', caricaBevandeNonAttive);
      document.addEventListener('click', eliminaBevandaClick);
      document.addEventListener('click', aggiungiBevandaClick);
  }
  
 //Caricare reiderizza tutti i tavoli attivi, funzione

  async function caricaMenuAttivo(){
    //carico i piatti
    const rispostapiatti = await fetch(`${API}?type=piatti`);
    const jsonpiatti = await rispostapiatti.json();
    /*//carico gli allergeni
    const rispostaallergeni = await fetch(`${API}?type=allergeni`);
    const jsonallergeni = await risposta.jsobevande*/
    //carico le bevande per mettere &in_menu='si' va strutturato nell'api menu.php e nel service.php
    const rispostabevande = await fetch(`${API}?type=bevande`);
    const jsonbevande = await rispostabevande.json();

    const lavagnabevande = document.getElementById('lavagna_bevande_attive');
    const lavagna = document.getElementById('lavagna_menu_attivo');
    

    //da sviluppare successivamente il pulsante che collega il piatto al tavolo   
    
    lavagna.innerHTML = jsonpiatti.data.filter(piatto => piatto.in_menu === 'si').map(piatto=>`
        <!--elementi piatti-->
    <div class="piatto" id="${piatto.id_piatto}">
       
       <h3 class="comment"><b>${piatto.nome_piatto}</b></h3>

       <p class="comment">${piatto.descrizione}</p>
       <p class="comment">Prezzo: ${piatto.prezzo} € </p> 
       <!--va fatto così perché dentro un litteral il foreach non funziona per il problema dell'hosting, risulta undefine-->
       <ul id="elenco_allergeni" class="elenco_allergeni">
          ${piatto.allergeni ? piatto.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join(''):'<li>Nessun allergene</li>'}
       </ul>
       <p class="comment">${piatto.categoria.toUpperCase()}</p> 
       <!--link AJAX per inviare la modifica piatto-->
       <a class="btn" href="modificapiatto.php?id=${piatto.id_piatto}">Modifica ✏️</a>

       <!--button AJAX per richiedere la disattivazione dal menu del tavolo-->

       <button class="btn-disattiva-piatto" data-id="${piatto.id_piatto}">Disattiva 🚫</button>
    </div>`).join('');
        //elementi Bevande per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnabevande.innerHTML = jsonbevande.data.filter(bevanda => bevanda.in_menu === 'si').map(bevanda=>`
        <!--elementi bevande-->
    <div class="bevanda" id="${bevanda.id_bevanda}">
       
       <h3 class="comment"><b> ${bevanda.nome_bevanda}</b></h3>

       <p class="comment">${bevanda.descrizione}</p>
       <p class="comment">Prezzo: ${bevanda.prezzo} € </p> 
       <ul id="elenco_allergeni" class="elenco_allergeni">
         ${bevanda.allergeni ? bevanda.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join(''):'<li>Nessun allergene</li>'}
       </ul>
       <p class="comment">Contiene Alcol: ${bevanda.alcol} </p> 
       <!--link AJAX per inviare la modifica bevanda-->
       <a class="btn" href="modificabevanda.php?id=${bevanda.id_bevanda}">Modifica ✏️</a>

       <!--button AJAX per richiedere la disattivazione dal menu del tavolo-->

       <button class="btn-disattiva-bevanda" data-id="${bevanda.id_bevanda}">Disattiva 🚫</button>
    </div>`).join('');
  }

  async function togliPiattoClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn = e.target.closest('.btn-disattiva-piatto');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi nascondere ai clienti questo piatto?')){
          return;
        }
        //recupero il data set da data-id
        const id_disattiva = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_disattiva){
          throw new Error('Piatto non nascosto, manca ID!');
        }

    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const risposta = await fetch(`/ristorante_classic/api/menu.php?type=piatti&id=${id_disattiva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id_piatto: parseInt(id_disattiva), 
              in_menu : 'no' 
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i piatti
        await caricaMenuAttivo();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  //togli la bevanda dal menu dei clienti
  async function togliBevandaClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn = e.target.closest('.btn-disattiva-bevanda');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi nascondere ai clienti questa bevanda?')){
          return;
        }
        //recupero il data set da data-id
        const id_disattiva = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_disattiva){
          throw new Error('Bevanda non nascosta, manca ID!');
        }

    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const risposta = await fetch(`/ristorante_classic/api/menu.php?type=bevande&id=${id_disattiva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id_piatto: parseInt(id_disattiva), 
              in_menu : 'no' 
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico le bevande
        await caricaMenuAttivo();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  //-----------------CARICA MENU PIATTI NON ATTIVI------------------------------------

async function caricaPiattiNonAttivi(){
    //carico i piatti
    const rispostapiatti = await fetch(`${API}?type=piatti`);
    const jsonpiatti = await rispostapiatti.json();
    
    //carico le bevande per mettere &in_menu='no' va strutturato nell'api menu.php e nel service.php
    const nonAttivi = jsonpiatti.data.filter(piatto => piatto.in_menu === 'no');
    /*
    const lavagna = document.getElementById('lavagna_piatti_nonattivi');
    */
    //da sviluppare successivamente il pulsante che collega il piatto al tavolo   
    if (!nonAttivi.length) {
      lavagna_piatti_nonattivi.innerHTML = `<p>Non ci sono piatti non attivi</p>`;
      return;
    }
    lavagna_piatti_nonattivi.innerHTML = nonAttivi.map(piatto=>`
        <!--elementi piatti-->
    <div class="piatto" id="${piatto.id_piatto}">
       
       <h3 class="comment"><b>${piatto.nome_piatto}</b></h3>

       <p class="comment">${piatto.descrizione}</p>
       <p class="comment">Prezzo: ${piatto.prezzo} € </p> 
       <!--va fatto così perché dentro un litteral il foreach non funziona per il problema dell'hosting, risulta undefine-->
       <ul id="elenco_allergeni" class="elenco_allergeni">
          ${piatto.allergeni ? piatto.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join(''):'<li>Nessun allergene</li>'}
       </ul>
       <p class="comment">${piatto.categoria.toUpperCase()}</p> 

       <button class="btn-attiva-piatto" data-id="${piatto.id_piatto}">Mostra Piatto 👁️</button>

       <!--link AJAX per inviare la modifica piatto-->
       <a class="btn" href="modificapiatto.php?id=${piatto.id_piatto}">Modifica ✏️</a>
       
       <!--button AJAX per richiedere la disattivazione dal menu del tavolo-->

       <button class="btn-elimina-piatto" data-id="${piatto.id_piatto}">Elimina 🗑️</button>
    </div>`).join('');
      

  }


  async function caricaBevandeNonAttive(){
    //carico i bevande
    const rispostabevande = await fetch(`${API}?type=bevande`);
    const jsonbevande = await rispostabevande.json();
    
    //carico le bevande per mettere &in_menu='no' va strutturato nell'api menu.php e nel service.php
    const nonAttivi = jsonbevande.data.filter(bevanda => bevanda.in_menu === 'no');
    /*
    const lavagna = document.getElementById('lavagna_bevande_nonattivi');
    */
    //da sviluppare successivamente il pulsante che collega il bevanda al tavolo   
    if (!nonAttivi.length) {
      lavagna_bevande_nonattive.innerHTML = `<p>Non ci sono bevande non attive</p>`;
      return;
    }
    lavagna_bevande_nonattive.innerHTML = nonAttivi.map(bevanda=>`
        <!--elementi bevande-->
    <div class="bevanda" id="${bevanda.id_bevanda}">
       
       <h3 class="comment"><b>${bevanda.nome_bevanda}</b></h3>

       <p class="comment">${bevanda.descrizione}</p>
       <p class="comment">Prezzo: ${bevanda.prezzo} € </p> 
       <!--va fatto così perché dentro un litteral il foreach non funziona per il problema dell'hosting, risulta undefine-->
       <ul id="elenco_allergeni" class="elenco_allergeni">
          ${bevanda.allergeni ? bevanda.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join(''):'<li>Nessun allergene</li>'}
       </ul> 

       <button class="btn-attiva-bevanda" data-id="${bevanda.id_bevanda}">Mostra bevanda 👁️</button>

       <!--link AJAX per inviare la modifica bevanda-->
       <a class="btn" href="modificabevanda.php?id=${bevanda.id_bevanda}">Modifica ✏️</a>
       
       <!--button AJAX per richiedere la disattivazione dal menu del tavolo-->

       <button class="btn-elimina-bevanda" data-id="${bevanda.id_bevanda}">Elimina 🗑️</button>
    </div>`).join('');
      

  }

  
  async function aggiungiPiattoClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn = e.target.closest('.btn-attiva-piatto');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('mostrare ai clienti questo piatto?')){
          return;
        }
        //recupero il data set da data-id
        const id_attiva = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_attiva){
          throw new Error('Piatto non mostrato, manca ID!');
        }

    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const risposta = await fetch(`/ristorante_classic/api/menu.php?type=piatti&id=${id_attiva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id_piatto: parseInt(id_attiva), 
              in_menu : 'si' 
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i bevande
        await caricaPiattiNonAttivi();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  async function aggiungiBevandaClick(e){
    try{
        const btn = e.target.closest('.btn-attiva-bevanda');
        if(!btn) return;

        if(!confirm('mostrare ai clienti questa bevanda?')){
          return;
        }

        const id_attiva = btn.dataset.id;
        if(!id_attiva){
          throw new Error('Bevanda non mostrata, manca ID!');
        }

        const risposta = await fetch(`/ristorante_classic/api/menu.php?type=bevande&id=${id_attiva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              in_menu: 'si' 
            })
        });

        if (!risposta.ok) {
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        await caricaBevandeNonAttive();

    }catch (errore){
        console.error(errore);
        alert(errore.message);
    }
}
   //------------------POST INSERT-------------------------------------

async function inserisciPiattoClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-inserisci');
        
        //escludo click per errore
        if(!btn) return;

        //recupero il nome del piatto dal form INPUT
        const nome_piatto = document.getElementById('nome-piatto').value.trim();
        

        //questa funzione di js genera un alet bool
        if(!confirm(`vuoi inserire ${nome_piatto}?`)){
          return;
        }
        //recupero gli altri dati dal form INPUT
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        const allergeniSelezionati = [...document.querySelectorAll('input[name="allergeniSelezionati[]"]:checked')].map(el =>  parseInt(el.value));        
        const in_menu = document.querySelector('input[name="in_menu"]:checked').value;
        const categoria = document.querySelector('input[name="categoria"]:checked').value;


      //validazione dati
      // Nome piatto
        if (typeof nome_piatto !== "string" || nome_piatto === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }

        // Descrizione
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }

        // Prezzo
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }


        //salvo il response dentro risposta, chiamo la fetch su un id specifico 
        const risposta = await fetch(`${API}?type=piatti`, {
            method: 'POST',
            headers:{
              'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                    nome_piatto: String(nome_piatto),
                    descrizione: String(descrizione),
                    prezzo: prezzo,
                    allergeni: allergeniSelezionati,
                    in_menu: in_menu,
                    categoria: categoria
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ritorno alla pagina gestione bevande non attivi
        alert('piatto inserito con successo!');
        //reindirizzo il cliente
        window.location.href = "bevandenonattivi.php";
       
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }


  async function inserisciBevandaClick(e){
    try{
        const btn = e.target.closest('.btn-inserisci-bevanda');
        if(!btn) return;

        const nome_bevanda = document.getElementById('nome-bevanda').value.trim();

        if(!confirm(`vuoi inserire ${nome_bevanda}?`)){
          return;
        }

        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        const allergeniSelezionati = [...document.querySelectorAll('input[name="allergeniSelezionati[]"]:checked')].map(el => parseInt(el.value));        
        const in_menu = document.querySelector('input[name="in_menu"]:checked').value;
        const alcol = document.querySelector('input[name="alcol"]:checked').value;

        // validazione
        if (typeof nome_bevanda !== "string" || nome_bevanda === "") {
            throw new Error("Il nome della bevanda è obbligatorio");
        }
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 0) {
            throw new Error("Inserisci un prezzo valido");
        }

        const risposta = await fetch(`${API}?type=bevande`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_bevanda: String(nome_bevanda),
                descrizione: String(descrizione),
                prezzo: prezzo,
                allergeni: allergeniSelezionati,
                in_menu: in_menu,
                alcol: alcol
            })
        });

        if (!risposta.ok) {
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        alert('bevanda inserita con successo!');
        window.location.href = "gestionebevandenonattive.php";
       
    }catch (errore){
        console.error(errore);
        alert(errore.message);
    }
}



  //-----------------FUNZIONE DI SUPPORTO INSERISCI/MODIFICA------------------

 async function controllaNomeDisponibile(){
    const risposta = await fetch(`${API}?type=piatti`);
    const json = await risposta.json();
    const nomi_piatti = json.data.map(piatto => piatto.nome_piatto);
    const avviso = document.getElementById("avviso");
    //selettore di classe con il puinto
    const sezione = document.querySelector('#controllo');
    
    
    if(!da_inserire.value.trim()){
       sezione.classList.add('warning');
       avviso.innerHTML=`il piatto deve avere un nome!`;
       return;
    }

      
    if(!form_modifica){
      if(nomi_piatti.includes(da_inserire.value.trim())){
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML=`il piatto ${da_inserire.value.trim()} è già esistente!`;
        } 
    }else{
       sezione.classList.remove('warning');
       avviso.innerHTML="";
       sezione.classList.add('controllopositivo');
       
    }

 }

 async function controllaNomeBevandaDisponibile(){
    const risposta = await fetch(`${API}?type=bevande`);
    const json = await risposta.json();
    const da_inserire = document.getElementById('nome-bevanda');
    const nomi_bevande = json.data.map(bevanda => bevanda.nome_bevanda);
    const avviso = document.getElementById("avviso");
    //selettore di classe con il puinto
    const sezione = document.querySelector('#controllo');
    
    
    if(!da_inserire.value.trim()){
       sezione.classList.add('warning');
       avviso.innerHTML=`La bevanda deve avere un nome!`;
       return;
    }
    if(!form_modifica_bevanda){
      if(nomi_piatti.includes(da_inserire.value.trim())){
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML=`La bevanda ${da_inserire.value.trim()} è già esistente!`;
      }  
    }else{
       sezione.classList.remove('warning');
       avviso.innerHTML="";
       sezione.classList.add('controllopositivo');
       
    }

 }
 
 //s------------------------------elimina

  async function eliminaPiattoClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'elimina
        const btn = e.target.closest('.btn-elimina-piatto');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi eliminare questo piatto?')){
          return;
        }
        //recupero il data set da data-id
        const id_elimina = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_elimina){
          throw new Error('Id Mancante nel bottone!');
        }

    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta = await fetch(`/ristorante_classic/api/menu.php?type=piatti&id=${id_elimina}`, {
            method: 'DELETE'
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i piatti
        await caricaPiattiNonAttivi();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
 
async function eliminaBevandaClick(e){
    try{
        const btn = e.target.closest('.btn-elimina-bevanda');
        if(!btn) return;

        if(!confirm('vuoi eliminare questa bevanda?')){
          return;
        }

        const id_elimina = btn.dataset.id;
        if(!id_elimina){
          throw new Error('Id Mancante nel bottone!');
        }

        const risposta = await fetch(`/ristorante_classic/api/menu.php?type=bevande&id=${id_elimina}`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        await caricaBevandeNonAttive();

    }catch (errore){
        console.error(errore);
        alert(errore.message);
    }
}
 
 
 //------------------UPDATE------------------------------------------------------

async function precaricaFormModifica() {
    // legge l'id dall'URL: modificapiatto.php?id=5
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const risposta = await fetch(`${API}?type=piatti&id=${id}`);
    
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento
    console.log('JSON completo:', JSON.stringify(json));
    document.getElementById('nome-piatto').value = data.nome_piatto;
    document.getElementById('descrizione').value  = data.descrizione;
    document.getElementById('prezzo').value = parseFloat(data.prezzo);
    //da correggere
    console.log(data.id_allergeni);
    console.log('JSON completo:', JSON.stringify(json));
    const allergeniEsistenti = data.id_allergeni ? data.id_allergeni.split(',').map(a => parseInt(a.trim())) : [];
    console.log(allergeniEsistenti)
    console.log('tipo:', typeof data.id_allergeni);
    console.log('valore:', data.id_allergeni);
    document.querySelectorAll('input[name="allergeniSelezionati[]"]').forEach(checkbox => {
    checkbox.checked = allergeniEsistenti.includes(parseInt(checkbox.value));
    });

    const inMenuInput = document.querySelector(`input[name="in_menu"][value="${data.in_menu}"]`);
    if (inMenuInput) inMenuInput.checked = true;

    const categoriaInput = document.querySelector(`input[name="categoria"][value="${data.categoria}"]`);
    if (categoriaInput) categoriaInput.checked = true;
}

 async function modificaPiattoClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-modifica');
        
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi modificare questo piatto?')){
          return;
        }
      
        const id_modifica= btn.dataset.id;
        if(!id_modifica){
          throw new Error('ID tavolo mancante');
           }
        
       
        
        //recupero i dati dal form INPUT

        const nome_piatto = document.getElementById('nome-piatto').value.trim();
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        const allergeniSelezionati = [...document.querySelectorAll('input[name="allergeniSelezionati[]"]:checked')].map(el => parseInt(el.value));        
        const in_menu = document.querySelector('input[name="in_menu"]:checked').value;
        const categoria = document.querySelector('input[name="categoria"]:checked').value;

    
       
      
       // 5. validazione
        if (!nome_piatto) throw new Error('Il nome del piatto è obbligatorio');
        if (isNaN(prezzo) || prezzo <= 0) throw new Error('Inserisci un prezzo valido');
        if (!in_menu)   throw new Error('Seleziona se il piatto è in menu');
        if (!categoria) throw new Error('Seleziona una categoria');
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta =  await fetch(`${API}?type=piatti&id=${id_modifica}`, {
            method: 'PUT',
            headers:{
              'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                    
                    nome_piatto: String(nome_piatto),
                    descrizione: String(descrizione),
                    prezzo: prezzo,
                    allergeni: allergeniSelezionati,
                    in_menu: in_menu,
                    categoria: categoria
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const errJson = await risposta.json().catch(()=>null);
          throw new Error(errJson?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma torno alla gestione tavoli non attivi
        alert('tavolo modificato con successo!');
         //reindirizzo il cliente
         if(in_menu === "si"){
             window.location.href = "gestionemenuchevedonoiclienti.php";
         }else if (in_menu === "no"){
             window.location.href = "piattinonattivi.php";
         }
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  async function precaricaFormModificaBevanda() {
    // legge l'id dall'URL: modificabevanda.php?id=5
    //funzione dell'URL in js per la ricerca al suo interno
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const risposta = await fetch(`${API}?type=bevande&id=${id}`);
    
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento
    
    document.getElementById('nome-bevanda').value = data.nome_bevanda;
    document.getElementById('descrizione').value  = data.descrizione;
    document.getElementById('prezzo').value = parseFloat(data.prezzo);
    //da correggere
    
    
    const allergeniEsistenti = data.id_allergeni ? data.id_allergeni.split(',').map(a => parseInt(a.trim())) : [];
    console.log(allergeniEsistenti)
    console.log('tipo:', typeof data.id_allergeni);
    console.log('valore:', data.id_allergeni);
    document.querySelectorAll('input[name="allergeniSelezionati[]"]').forEach(checkbox => {
    checkbox.checked = allergeniEsistenti.includes(parseInt(checkbox.value));
    });

    const inMenuInput = document.querySelector(`input[name="in_menu"][value="${data.in_menu}"]`);
    if (inMenuInput) inMenuInput.checked = true;
    
    const contieneAlcolInput = document.querySelector(`input[name="alcol"][value="${data.alcol}"]`);
    if (contieneAlcolInput) contieneAlcolInput.checked = true;
    
}

async function modificaBevandaClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{
        
        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-modifica-bevanda');
        
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi modificare questa bevanda?')){
          return;
        }
      
        const id_modifica= btn.dataset.id;
        if(!id_modifica){
          throw new Error('ID tavolo mancante');
           }
        
       
        
        //recupero i dati dal form INPUT

        const nome_bevanda = document.getElementById('nome-bevanda').value.trim();
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        const allergeniSelezionati = [...document.querySelectorAll('input[name="allergeniSelezionati[]"]:checked')].map(selezionati => parseInt(selezionati.value));        
        const in_menu = document.querySelector('input[name="in_menu"]:checked').value;
        const alcol = document.querySelector('input[name="alcol"]:checked').value;

    
       
      
       // 5. validazione
        if (!nome_bevanda) throw new Error('Il nome della bevanda è obbligatoria');
        if (isNaN(prezzo) || prezzo <= 0) throw new Error('Inserisci un prezzo valido');
        if (!in_menu)   throw new Error('Seleziona se la bevanda è in menu');
        if (!alcol) throw new Error('Seleziona se la bevanda contiene alcol');
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta =  await fetch(`${API}?type=bevande&id=${id_modifica}`, {
            method: 'PUT',
            headers:{
              'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                    
                    nome_bevanda: String(nome_bevanda),
                    descrizione: String(descrizione),
                    prezzo: prezzo,
                    allergeni: allergeniSelezionati,
                    in_menu: in_menu,
                    alcol: alcol
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const errJson = await risposta.json().catch(()=>null);
          throw new Error(errJson?.data ?? `Errore HTTP ${risposta.status}`);
        }
        if (!json.success) {
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma torno alla gestione tavoli non attivi
        alert('bevanda modificata con successo!');
         //reindirizzo il cliente
         if(in_menu === "si"){
             window.location.href = "gestionemenuchevedonoiclienti.php";
         }else if (in_menu === "no"){
             window.location.href = "gestionebevandenonattive.php";
         }
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
