<?php
declare(strict_types=1);

require_once __DIR__ . '/../public/bootstrap.php';

header('Content-Type: application/json');


function scontrinoValidaCampi(array $body, array $campiRichiesti): void
{
    $mancanti = array_diff($campiRichiesti, array_keys($body));
    if (!empty($mancanti)) {
        throw new InvalidArgumentException('Campi mancanti nel body: ' . implode(', ', $mancanti));
    }
}
function risposta(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode(['success' => $status < 400, 'data' => $data]);
    exit;
}

try {
    $type = $_GET['type'] ?? null;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $data_e_ora_pagamento = $_GET['data_e_ora_pagamento'] ?? null;
    // 2. Decodifica JSON una volta sola
    $body = [];
    if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PATCH'])) {
        $input = file_get_contents('php://input');
        if (!empty($input)) {
            $body = json_decode($input, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new InvalidArgumentException('JSON malformato');
            }
        }
    }
    //Routing

    match ([$_SERVER['REQUEST_METHOD'], $type, $id !== null, $data_e_ora_pagamento !== null]) {

        ['GET', 'scontrini', false, false] =>  risposta($scontrinoService->visualizzaTuttiGliScontrini()),

        ['GET', 'scontrino', true, false] => risposta($scontrinoService->recuperaUnScontrino($id)),

        ['GET', 'scontrino_dettaglio', true, false] => risposta($scontrinoService->recuperaUnScontrinoConDettaglio($id)),


        ['GET', 'scontrini_oggi', false, false] => risposta($scontrinoService->visualizzaTuttiGliScontriniOggi()),

        ['GET', 'incasso_giornata', false, false] =>  risposta($scontrinoService->visualizzaIlTotDegliScontriniOggi()),

        ['GET', 'scontrini_data', false, true] =>  risposta($scontrinoService->visualizzaTuttiGliScontriniData($data_e_ora_pagamento)),

        ['POST', 'nuovo_scontrino', false, false] => (function () use ($scontrinoService, $body) {
 
            scontrinoValidaCampi($body, ['id_ordine', 'totale', 'dettagli']);
 
            $id_scontrino = $scontrinoService->nuovoScontrino(
                (int) $body['id_ordine'],
                (float) $body['totale'],
                $body['dettagli']
            );
 
            if ($id_scontrino === null) {
                risposta('Nessun dettaglio fornito, scontrino non generato', 400);
            }
 
            risposta($id_scontrino, 201);
        })(),

        ['POST', 'stampa', false, false] => (function () use ($stampaService, $body) {
        // Validazione dei campi necessari
            if (!isset($body['id_ordine'])) {
                throw new InvalidArgumentException('id_ordine mancante nel body');
            }
            
            $isModifica = filter_var($body['modifica'] ?? false, FILTER_VALIDATE_BOOLEAN);
            
            // Chiamata al servizio
            $percorsi = $stampaService->generaComandaTxt((int)$body['id_ordine'], $isModifica);
            
            risposta(['id_ordine' => $body['id_ordine'], 'files' => $percorsi], 201);
        })(),

        ['PATCH', 'storno', false, false] => (function () use ($scontrinoService, $body) {
            scontrinoValidaCampi($body, ['id_scontrino', 'id_ordine']);
 
            $esito = $scontrinoService->annullaScontrino(
                (int) $body['id_scontrino'],
                (int) $body['id_ordine']
            );
 
            risposta($esito, $esito ? 200 : 404);
        })(),

        default => throw new InvalidArgumentException('Endpoint non valido'),
    };

} catch (\ValueError $e) {
    risposta('Valore enum non valido: ' . $e->getMessage(), 422);
} catch (\InvalidArgumentException $e ) {
    risposta($e->getMessage(), 400);
} catch (\TypeError $e) {
    risposta($e->getMessage(), 400);
} catch (\RuntimeException $e) {
    risposta($e->getMessage(), 404);
} catch (\Throwable $e) {  
    risposta($e->getMessage(), 500);
}