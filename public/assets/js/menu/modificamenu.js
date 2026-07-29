import * as API_function from './commonMenu.js';

const form_modifica_bevanda= document.getElementById('form_modifica_bevanda');
  let initialized = false; 

  function init() {
    if (initialized) return;
    initialized = true;
    precaricaFormModifica();
   }
document.addEventListener('DOMContentLoaded', init);

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
