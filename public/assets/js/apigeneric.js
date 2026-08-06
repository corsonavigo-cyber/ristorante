import { erroreRisposta,leggiId } from './tavoli/utils.js';

async function richiesta(url, options = {}) {
    const risposta = await fetch(url, options);

    if (!risposta.ok) {
        throw await erroreRisposta(risposta);
    }
    //fixato da json a text
    const testo = await risposta.text();
    return testo ? JSON.parse(testo).data : null;
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

export function apiPut(urlApi, elementoOParametri, payload, type = "") {
    const isElementoDom = elementoOParametri instanceof Element;

    const params = isElementoDom
        ? new URLSearchParams({ id: leggiId(elementoOParametri, payload) })
        : new URLSearchParams(elementoOParametri);

    if (type) params.set('type', type);

    return richiesta(`${urlApi}?${params}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

export function apiPatch(urlApi, elementoOParametri, payload) {
    const params = elementoOParametri instanceof Element
        ? new URLSearchParams({
            id: leggiId(elementoOParametri, payload)
        })
        : new URLSearchParams(elementoOParametri);

    const separatore = urlApi.includes('?') ? '&' : '?';

    return richiesta(`${urlApi}${separatore}${params}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

export function apiDelete(urlApi, params = {}, payload = null) {
    const options = { method: 'DELETE' };

    if (payload !== null) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(payload);
    }

    return richiesta(`${urlApi}?${new URLSearchParams(params)}`, options);
}
