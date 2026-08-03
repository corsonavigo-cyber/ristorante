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


document.addEventListener('DOMContentLoaded', preloadTavoliForm(API_tavoli));
document.addEventListener('click', inserisciPrenotazioneClick);
document.addEventListener('input', initInserisciPrenotazione);

export async function initInserisciPrenotazione() {
  const runCheck = async () => {
    const tavoliSelezionati = getSelectedTavoli();
    await controllaTavoloDataDisponibile(API, tavoliSelezionati);
    await controllaPostiTavoloDisponibili(tavoliSelezionati);
  };

  attachTavoliChange(runCheck);
  attachPrenotazioneFieldListeners(runCheck);
}

async function inserisciPrenotazioneClick(e) {
  try {
    const btn = e.target.closest('.btn-inserisci-prenotazione');
    if (!btn) return;

    const nomePrenotazione = document.getElementById('nome-prenotazione').value.trim();
    if (!confirm(`Vuoi inserire ${nomePrenotazione}?`)) {
      return;
    }

    const oraPrenotazione = document.getElementById('ora-prenotazione').value;
    const dataInPrenotazione = document.getElementById('data-in-prenotazione').value;
    const tavoli = getSelectedTavoli();
    const attivaElemento = document.querySelector('input[name="attiva"]:checked');
    const attiva = attivaElemento ? parseInt(attivaElemento.value, 10) : 0;
    const numeroPersone = parseInt(document.getElementById('numero-persone').value, 10);

    if (!nomePrenotazione) {
      throw new Error('Il nome della prenotazione è obbligatorio');
    }

    if (!dataInPrenotazione || dataInPrenotazione < new Date().toISOString().split('T')[0]) {
      throw new Error('La data non è valida');
    }

    if (!oraPrenotazione) {
      throw new Error('L\'ora della prenotazione è obbligatoria');
    }

    if (Number.isNaN(numeroPersone) || numeroPersone <= 0) {
      throw new Error('Inserisci un numero persone valido');
    }

    const bodyBase = {
      nome_prenotazione: String(nomePrenotazione),
      ora_prenotazione: String(oraPrenotazione),
      data_in_prenotazione: String(dataInPrenotazione),
      attiva,
      numero_persone: numeroPersone
    };

    const conTavolo = tavoli.length >= 1;
    const type = conTavolo ? 'prenotazione_tavolo' : 'prenotazione';
    const body = conTavolo ? { ...bodyBase, tavoli } : bodyBase;

    const url = `${API}?type=${type}`;
    await API_tav_function.apiPost(url, body);

    alert(conTavolo
      ? 'Prenotazione inserita con successo nel tavolo!'
      : 'Prenotazione inserita con successo, ancora non è stato assegnato nessun tavolo!');

    window.location.href = '../tavoli/gestionetavoli.php';
  } catch (errore) {
    console.error(errore);
    alert(errore.message);
  }
}
