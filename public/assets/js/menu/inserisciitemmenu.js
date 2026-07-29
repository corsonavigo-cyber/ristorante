import * as  API_function from './commonMenu.js';

const form = document.getElementById('form_inserisci_pietanza');

document.addEventListener('click', inserisciPiattoClick);
document.addEventListener('input', API_function.controllaNomeDisponibile);

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

   

