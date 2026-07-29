 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei menu
 
  //controllo che siamo nella pagina elenco Menu prima di avviare il riempimento
  
 
  
  }else if(form_modifica){
      //attiva il bottone inserisci
      document.addEventListener('click', modificaPiattoClick);
      document.addEventListener('DOMContentLoaded', initBevande);
      /*document.addEventListener('click', modificaBevandaClick);*/
      document.addEventListener('input', controllaNomeDisponibile);
      
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

