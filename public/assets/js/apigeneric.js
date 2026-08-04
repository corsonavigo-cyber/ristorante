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

export function apiPut(urlApi,elemento, payload, type = "") {
    const id = leggiId(elemento, payload);
    const params = new URLSearchParams({ id });

    if (type) params.set("type", type);

    return richiesta(`${urlApi}?${params}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
}

export function apiPatch(urlApi, elemento, payload) {
    const id = leggiId(elemento,payload);
    const separatore = urlApi.includes('?') ? '&' : '?';

    return richiesta(`${urlApi}${separatore}id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

export function apiDelete(urlApi, params = {}) {
    const query = new URLSearchParams(params);
    return richiesta(`${urlApi}?${query}`, {
        method: 'DELETE'
    });
}
