<?php
declare(strict_types=1);

require_once __DIR__ . '/../public/bootstrap.php';

header('Content-Type: application/json');

$type = $_GET['type'] ?? null;
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$data_e_ora_pagamento = $_GET['data_e_ora_pagamento'] ?? null;

$body = json_decode(file_get_contents('php://input'), true) ?? [];

try {

    match ([$_SERVER['REQUEST_METHOD'], $type, $id !== null, $data_e_ora_pagamento !== null]) {

        ['GET', 'scontrini', false, false] => (function () use ($scontrinoService) {
            http_response_code(200);
            echo json_encode([
                'data' => $scontrinoService->visualizzaTuttiGliScontrini()
            ]);
        })(),

        ['GET', 'scontrino', true, false] => (function () use ($scontrinoService, $id) {
            http_response_code(200);
            echo json_encode([
                'data' => $scontrinoService->recuperaUnScontrino($id)
            ]);
        })(),

        ['GET', 'scontrini_oggi', false, false] => (function () use ($scontrinoService) {
            http_response_code(200);
            echo json_encode([
                'data' => $scontrinoService->visualizzaTuttiGliScontriniOggi()
            ]);
        })(),

        ['GET', 'incasso_giornata', false, false] => (function () use ($scontrinoService) {
            http_response_code(200);
            echo json_encode([
                'data' => $scontrinoService->visualizzaIlTotDegliScontriniOggi()
            ]);
        })(),

        ['GET', 'scontrini_data', false, true] => (function () use ($scontrinoService, $data_e_ora_pagamento) {
            http_response_code(200);
            echo json_encode([
                'data' => $scontrinoService->visualizzaTuttiGliScontriniData($data_e_ora_pagamento)
            ]);
        })(),

        ['POST', 'nuovo_scontrino', false, false] => (function () use ($scontrinoService, $body) {

            http_response_code(201);

            echo json_encode([
                'data' => $scontrinoService->nuovoScontrino(
                    $body['id_ordine'],
                    $body['numero_persone'],
                    $body['piatti'],
                    $body['bevande'],
                    $body['tot']
                )
            ]);

        })(),

        ['PATCH', 'storno', false, false] => (function () use ($scontrinoService, $body) {

            http_response_code(200);

            echo json_encode([
                'data' => $scontrinoService->annullaScontrino(
                    $body['id_scontrino'],
                    $body['id_ordine']
                )
            ]);

        })(),

        default => throw new InvalidArgumentException('Endpoint non valido'),
    };

} catch (ValueError $e) {
    http_response_code(422);
    echo json_encode(['data' => $e->getMessage()]);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['data' => $e->getMessage()]);
} catch (RuntimeException $e) {
    http_response_code(404);
    echo json_encode(['data' => $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['data' => $e->getMessage()]);
}