import { apiGet } from '../apigeneric.js';

let storicoCache = [];

export function initStoricoPrenotazioni() {
  const ricerca = document.getElementById('ricerca-storico');
  if (!ricerca) return;

  caricaStorico();
  ricerca.addEventListener('input', (event) => {
    caricaStorico(event.target.value.trim());
  });
}

const API = '/ristorante/api/storicoprenotazioni.php';

export async function caricaStorico(filtro = '') {
  try {
    const storicoElemento = document.getElementById('storico');
    if (!storicoElemento) return;

    if (storicoCache.length === 0) {
      storicoCache = await apiGet(API, { type: 'storico' });
    }

    const righe = filtro
      ? storicoCache.filter(r => r.toLowerCase().includes(filtro.toLowerCase()))
      : storicoCache;

    storicoElemento.innerHTML = [...righe].reverse().map(riga => {
      const match = riga.match(/^\[(.+?)\]\s+\[(.+?)\]\s+(.+)$/);
      if (!match) {
        return `<div class="storico-item"><p class="comment">${riga}</p></div>`;
      }

      const [, dataOra, tipo, messaggio] = match;
      const classeTipo = tipo.toLowerCase().replace(/\s+/g, '-');
      return `
        <div class="storico-item storico-${classeTipo}">
          <span class="storico-data">${dataOra}</span>
          <span class="storico-tipo">${tipo}</span>
          <p class="comment">${messaggio.trim()}</p>
        </div>
      `;
    }).join('');
  } catch (errore) {
    console.error(errore);
    alert(errore.message);
  }
}
