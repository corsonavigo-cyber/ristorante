import * as API_tav_function from '../apigeneric.js';
import { today } from '../tavoli/utils.js';

export function oggi() {
  return new Date().toLocaleString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTurno(orario) {
  const [h] = orario.slice(0, 5).split(':').map(Number);
  return h < 15 ? 'pranzo' : 'cena';
}

export function getSelectedTavoli() {
  return [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
    .map(el => parseInt(el.value, 10));
}

export function attachTavoliChange(runCheck) {
  const tavoliCheckbox = document.getElementById('tavoli_checkbox');
  if (!tavoliCheckbox) return;

  tavoliCheckbox.addEventListener('change', (e) => {
    if (e.target.name === 'tavoliSelezionati[]') {
      runCheck();
    }
  });
}

export function attachPrenotazioneFieldListeners(runCheck) {
  const numeroPersone = document.getElementById('numero-persone');
  if (numeroPersone) {
    numeroPersone.addEventListener('input', runCheck);
  }

  document.querySelectorAll('#data-in-prenotazione, #ora-prenotazione')
    .forEach(campo => campo.addEventListener('change', runCheck));
}

export async function preloadTavoliForm(apiTavoli) {
  if (!apiTavoli) {
    throw new Error('API_tavoli non definita');
  }

  const data = await API_tav_function.apiGet(apiTavoli);
  const lavagna = document.getElementById('tavoli_checkbox');
  if (!lavagna) return data;

  lavagna.innerHTML = data.map(tavolo => `
    <li>
      <label>
        <input type="checkbox" name="tavoliSelezionati[]" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">
        Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}
      </label>
    </li>
  `).join('');

  const attivaInput = document.querySelector('input[name="attiva"][value="1"]');
  if (attivaInput) {
    attivaInput.checked = true;
  }

  return data;
}

export async function controllaTavoloDataDisponibile(apiPrenotazioni, tavoliSelezionati) {
  const avviso = document.getElementById('avviso');
  const sezione = document.querySelector('#controllo');
  const da_inserire_data = document.getElementById('data-in-prenotazione');
  const ora_prenotazione = document.getElementById('ora-prenotazione');

  if (!avviso || !sezione || !da_inserire_data || !ora_prenotazione) {
    return true;
  }

  if (!da_inserire_data.value.trim()) {
    sezione.classList.remove('controllopositivo');
    sezione.classList.add('warning');
    avviso.innerHTML = 'La prenotazione deve avere una data!';
    return false;
  }

  if (tavoliSelezionati.length === 0) {
    sezione.classList.remove('warning');
    sezione.classList.add('controllopositivo');
    avviso.innerHTML = '';
    return true;
  }

  const prenotazioni = await API_tav_function.apiGet(apiPrenotazioni, { type: 'prenotazioni' });
  const ora_p = ora_prenotazione.value;

  const conflitto = prenotazioni.some(p => {
    if (!p.id_tavoli) return false;

    const tavoliPrenotati = String(p.id_tavoli)
      .split(',')
      .map(value => parseInt(value.trim(), 10));

    const condivisi = tavoliSelezionati.some(id => tavoliPrenotati.includes(id));
    return condivisi && p.data_in_prenotazione === da_inserire_data.value && getTurno(p.ora_prenotazione) === getTurno(ora_p);
  });

  if (conflitto) {
    sezione.classList.remove('controllopositivo');
    sezione.classList.add('warning');
    avviso.innerHTML = 'Questo tavolo è già prenotato per data e ora selezionate!';
    return false;
  }

  sezione.classList.remove('warning');
  sezione.classList.add('controllopositivo');
  avviso.innerHTML = '';
  return true;
}

export async function controllaPostiTavoloDisponibili(tavoliSelezionati) {
  const avviso = document.getElementById('avviso1');
  const sezione = document.querySelector('#controllo1');
  const numeroPersoneInput = document.getElementById('numero-persone');

  if (!avviso || !sezione || !numeroPersoneInput) {
    return true;
  }

  if (tavoliSelezionati.length === 0) {
    sezione.classList.remove('warning', 'controllopositivo');
    avviso.innerHTML = '';
    return true;
  }

  const numeroPersone = parseInt(numeroPersoneInput.value, 10);
  if (Number.isNaN(numeroPersone) || numeroPersone <= 0) {
    sezione.classList.remove('controllopositivo');
    sezione.classList.add('warning');
    avviso.innerHTML = 'Inserisci un numero di persone valido';
    return false;
  }

  const postiTotali = tavoliSelezionati.reduce((acc, id) => {
    const checkbox = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id}"]`);
    return acc + (parseInt(checkbox?.dataset.posti, 10) || 0);
  }, 0);

  if (numeroPersone > postiTotali) {
    sezione.classList.remove('controllopositivo');
    sezione.classList.add('warning');
    avviso.innerHTML = `Hai bisogno di più tavoli per ${numeroPersone} persone, ti mancano ${numeroPersone - postiTotali}. Se vuoi procedere comunque, premi inserisci.`;
    return false;
  }

  sezione.classList.remove('warning');
  sezione.classList.add('controllopositivo');
  avviso.innerHTML = '';
  return true;
}
