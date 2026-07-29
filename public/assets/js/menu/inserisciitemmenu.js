import * as  API_function from './commonMenu.js';

const form = document.getElementById('form_inserisci_pietanza');

document.addEventListener('click', inserisciPiattoClick);
document.addEventListener('input', controllaNomeDisponibile);

async function inserisciPiattoClick(e) {

    try {

        const btn = e.target.closest('.btn-inserisci-item');
        if (!btn) return;

        // Nome
        const nome = document.getElementById('nome-item').value.trim();

        if (!nome) {
            throw new Error("Inserisci il nome del prodotto");
        }

        if (!confirm(`Vuoi inserire "${nome}"?`)) {
            return;
        }

        // Altri campi
        const descrizione = document.getElementById('descrizione').value.trim();
        const prezzo = parseFloat(document.getElementById('prezzo').value);

        const allergeni = [
            ...document.querySelectorAll('input[name="allergeniSelezionati[]"]:checked')
        ].map(el => Number(el.value));

        const in_menu = document.querySelector('input[name="in_menu"]:checked')?.value;
        const categoria = document.querySelector('input[name="categoria"]:checked')?.value;
        const id_iva = Number(document.querySelector('input[name="id_iva"]:checked')?.value);
        const tipo = document.querySelector('input[name="tipo"]:checked')?.value;

        // Validazioni
        if (Number.isNaN(prezzo) || prezzo <= 0) {
            throw new Error("Inserisci un prezzo valido");
        }

        if (!tipo || !categoria || !in_menu || !id_iva) {
            throw new Error("Compila tutti i campi obbligatori");
        }

        const payload = {
            tipo,
            categoria,
            in_menu,
            nome,
            prezzo,
            descrizione,
            id_iva,
            allergeni
        };

        console.log(payload);

        const idInserito = await API_function.apiPost(payload);

        console.log(idInserito);

        alert("Prodotto inserito con successo!");

        window.location.href = "gestionemenuchevedonoiclienti.php";

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

   async function controllaNomeDisponibile(e){
    
    const avviso = document.getElementById("avviso");
    const sezione = document.querySelector('#controllo');
    if (e.target.id !== 'nome-item') {
        return;
    }

    const da_inserire = e.target;

    const disponibile = await API_function.nomeGiaEsistente(da_inserire.value.trim());

    if (!disponibile) {
       sezione.classList.add('warning');
       avviso.innerHTML=`il piatto deve avere un nome!`;
       return;
    }

      
    if(!API_function.nomeGiaEsistente(da_inserire.value.trim())){
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML=`il piatto ${da_inserire.value.trim()} è già esistente!`;
    }else{
       sezione.classList.remove('warning');
       avviso.innerHTML="";
       sezione.classList.add('controllopositivo');
       
    }

 }

