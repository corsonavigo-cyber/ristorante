import { today, erroreRisposta, leggiId } from './tavoli/utils.js';

async function richiesta(url, options = {}) {
    const risposta = await fetch(url, options);

    if (!risposta.ok) {
        throw await gestisciErroreRisposta(risposta);
    }

    const json = await risposta.json();
    return json.data;
}

export function apiGet(urlApi, params = {}) {
    const query = new URLSearchParams(params);
    return richiesta(`${urlApi}?${query}`);
}

export function apiPost(urlApi, payload) {
    return richiesta(urlApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

export function apiPut(urlApi, id, payload) {
    validaId(id);

    return richiesta(`${urlApi}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

export function apiPatch(urlApi, id, payload) {
    validaId(id);

    return richiesta(`${urlApi}?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

export function apiDelete(urlApi, params = {}) {
    const query = new URLSearchParams(params);
    console.log(query);
    return richiesta(`${urlApi}?${query}`, {
        method: 'DELETE'
    });
}