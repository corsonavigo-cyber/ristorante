import * as API_function from './commonMenu.js';

const form_modifica_bevanda= document.getElementById('form_modifica_bevanda');
let initialized = false; 

function init() {
    if (initialized) return;
    initialized = true;
    precaricaFormModifica();
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('click', modificaItemClick)

async function precaricaFormModifica() {
    // legge l'id dall'URL: modificapiatto.php?id=5
    const id_item = new URLSearchParams(window.location.search).get('id');
    if (!id_item) return;

    const param={
        type: 'item',
        id : id_item
    } 
    try{
        const item_recuperato = await API_function.apiGet(param);
        console.log(item_recuperato);
        document.getElementById('nome-item').value = item_recuperato.nome;
        document.getElementById('descrizione').value  = item_recuperato.descrizione;
        document.getElementById('prezzo').value = parseFloat(item_recuperato.prezzo);
        const allergeniEsistenti = item_recuperato.id_allergeni ? item_recuperato.id_allergeni.split(',').map(a => parseInt(a.trim())) : [];
        document.querySelectorAll('input[name="allergeniSelezionati[]"]').forEach(checkbox => {
        checkbox.checked = allergeniEsistenti.includes(parseInt(checkbox.value));
        });
        const inMenuInput = document.querySelector(`input[name="in_menu"][value="${item_recuperato.in_menu}"]`);
        if (inMenuInput) inMenuInput.checked = true;
        const ivaInput = document.querySelector(`input[name="id_iva"][value="${item_recuperato.id_iva}"]`);
        if (ivaInput) ivaInput.checked = true;
        const tipoInput = document.querySelector(`input[name="tipo"][value="${item_recuperato.tipo}"]`);
        if (tipoInput) tipoInput.checked = true;
        const categoriaInput = document.querySelector(`input[name="categoria"][value="${item_recuperato.categoria}"]`);
        if (categoriaInput) categoriaInput.checked = true;
    }catch (errore) {
        console.error(errore);
    }    
}


async function modificaItemClick(e) {

    try {
        const btn = e.target.closest('.btn-modifica-item');

        if (!btn) return;

        if (!confirm('Vuoi modificare questo item?')) {
            return;
        }

        const id_item = new URLSearchParams(window.location.search).get('id');

        if (!id_item) {
            throw new Error('ID item mancante');
        }

        // recupero dati form
        const nome = document.getElementById('nome-item').value.trim();
        const descrizione = document.getElementById('descrizione').value.trim();
        const prezzo = parseFloat(document.getElementById('prezzo').value);

        const allergeni = [
            ...document.querySelectorAll('input[name="allergeniSelezionati[]"]:checked')
        ].map(el => parseInt(el.value));

        const id_iva = document.querySelector('input[name="id_iva"]:checked')?.value;
        const in_menu = document.querySelector('input[name="in_menu"]:checked')?.value;
        const categoria = document.querySelector('input[name="categoria"]:checked')?.value;
        const tipo = document.querySelector('input[name="tipo"]:checked')?.value;

        console.log('rhglariuegòe')
        // validazione
        if (!nome) {
            throw new Error('Il nome dell\'item è obbligatorio');
        }

        if (isNaN(prezzo) || prezzo <= 0) {
            throw new Error('Inserisci un prezzo valido');
        }

        if (!tipo) {
            throw new Error('Seleziona il tipo di item');
        }
        if (!id_iva) {
            throw new Error('Seleziona il tipo di iva');
        }

        if (!categoria) {
            throw new Error('Seleziona una categoria');
        }

        if (!in_menu) {
            throw new Error('Seleziona se l\'item è nel menu');
        }


        const payload = {

                id_item: Number(id_item),
                tipo: tipo,
                categoria: categoria,
                in_menu: in_menu,
                nome: nome,
                prezzo: prezzo,
                descrizione: descrizione,
                id_iva : id_iva,
                allergeni_selezionati: allergeni

            }
    
        await API_function.apiPut(id_item, payload);

        alert('Item modificato con successo!');


        if (in_menu === "si") {
            window.location.href = "gestionemenuchevedonoiclienti.php";
        } else {
            if(tipo === "piatto"){
                window.location.href = "gestionepiattinonattivi.php";
            }else{
                window.location.href = "gestionebevandenonattive.php";
            }
            
        }


    } catch (errore) {

        console.error(errore);
        alert(errore.message);

    }
}