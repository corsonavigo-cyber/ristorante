import * as API_tav_function from '../apigeneric.js';
import {
  getSelectedTavoli,
  attachTavoliChange,
  attachPrenotazioneFieldListeners,
  preloadTavoliForm,
  controllaTavoloDataDisponibile,
  controllaPostiTavoloDisponibili
} from './utils.js';

const API = '/ristorante/api/prenotazioni.php';
const API_tavoli = '/ristorante/api/tavoli.php';

export async function initModificaPrenotazione() {
  if (!API || !API_tavoli) {
    throw new Error('API o API_tavoli non definite');
  }

  await preloadTavoliForm(API_tavoli);
  await precaricaFormModificaPrenotazione(API);

  const runCheck = async () => {
    const tavoliSelezionati = getSelectedTavoli();
    await controllaTavoloDataDisponibile(API, tavoliSelezionati);
    await controllaPostiTavoloDisponibili(tavoliSelezionati);
  };

  attachTavoliChange(runCheck);
  attachPrenotazioneFieldListeners(runCheck);
  document.addEventListener('click', modificaPrenotazioneClick);
}

async function precaricaFormModificaPrenotazione(API) {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;

  const prenotazione = await API_tav_function.apiGet(API, { type: 'prenotazioni', id });
  if (!prenotazione) return;

  const data = Array.isArray(prenotazione) ? prenotazione[0] : prenotazione;
  if (!data) return;

  document.getElementById('nome-prenotazione').value = data.nome_prenotazione || '';
  document.getElementById('ora-prenotazione').value = data.ora_prenotazione || '';
  document.getElementById('data-in-prenotazione').value = data.data_in_prenotazione || '';
  document.getElementById('numero-persone').value = parseInt(data.numero_persone, 10) || '';

  const attivaInput = document.querySelector(`input[name="attiva"][value="${data.attiva}"]`);
  if (attivaInput) {
    attivaInput.checked = true;
  }

  const tavoliEsistenti = data.id_tavoli
    ? String(data.id_tavoli).split(',').map(a => parseInt(a.trim(), 10))
    : [];

  document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
    checkbox.checked = tavoliEsistenti.includes(parseInt(checkbox.value, 10));
  });
}

async function modificaPrenotazioneClick(e) {
  try {
    const btn = e.target.closest('.btn-modifica-prenotazione');
    if (!btn) return;

    if (!confirm('Vuoi modificare questa prenotazione?')) return;

    const idModifica = btn.dataset.id;
    if (!idModifica) throw new Error('ID prenotazione mancante');

    const nomePrenotazione = document.getElementById('nome-prenotazione').value.trim();
    const oraPrenotazione = document.getElementById('ora-prenotazione').value;
    const dataInPrenotazione = document.getElementById('data-in-prenotazione').value;
    const tavoliSelezionati = getSelectedTavoli();
    const attivoElemento = document.querySelector('input[name="attiva"]:checked');
    const attivo = attivoElemento ? parseInt(attivoElemento.value, 10) : 0;
    const numeroPersone = parseInt(document.getElementById('numero-persone').value, 10);

    if (!nomePrenotazione) throw new Error('Il nome della prenotazione è obbligatorio');
    if (!oraPrenotazione) throw new Error('L\'ora della prenotazione è obbligatoria');
    if (Number.isNaN(numeroPersone) || numeroPersone <= 0) throw new Error('Inserisci un numero di persone valido');

    const body = {
      nome_prenotazione: String(nomePrenotazione),
      ora_prenotazione: String(oraPrenotazione),
      data_in_prenotazione: String(dataInPrenotazione),
      attiva: attivo,
      numero_persone: numeroPersone,
      tavoli: tavoliSelezionati
    };

    const type = 'prenotazioni_tavolo';
    await API_tav_function.apiPut(`${API}?type=${type}`, btn, body);

    alert('Prenotazione modificata con successo!');
    window.location.href = 'gestioneprenotazioni.php';
  } catch (errore) {
    console.error(errore);
    alert(errore.message);
  }
}
