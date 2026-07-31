<?php
declare(strict_types=1);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__.'/../public/bootstrap.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: '. $_ENV['APP_CORS_ORIGIN']);
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : '';
$dataFiltro = $_GET['data'] ?? null; // ← serviva per il case 'data'

function risposta(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode(['success' => $status < 400, 'data' => $data]);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            if (!$type) {
                throw new \InvalidArgumentException('Parametro type mancante');
            }
            match ($type) {
                'prenotazioni' => $id
                    ? risposta($prenotazioniService->visualizzaPrenotazione($id))
                    : risposta($prenotazioniService->visualizzaPrenotazioni()),

                'tavolo' => $id
                    ? risposta($prenotazioniService->visualizzaPrenotazioniTavolo($id))
                    : risposta('id non valido', 400),

                'data' => $dataFiltro
                    ? risposta($prenotazioniService->visualizzaPrenotazioniData($dataFiltro))
                    : risposta('data non valida', 400),

                'disponibile' => ($id && $dataFiltro)
                    ? risposta($prenotazioniService->isTavoloDisponibile($id, $dataFiltro))
                    : risposta('parametri mancanti', 400),

                default => throw new \InvalidArgumentException('Tipo non valido')
            };
            break;

        case 'POST':
            $body = json_decode(file_get_contents('php://input'), true);

            if (!$type) {
                throw new \InvalidArgumentException('Parametro type mancante');
            }
            if (!$body) {
                risposta('JSON non valido', 400);
            }

            match ($type) {
                'prenotazione' => risposta($prenotazioniService->inserisciPrenotazione(
                    $body['nome_prenotazione'], $body['ora_prenotazione'],
                    $body['data_in_prenotazione'], $body['attiva'], $body['numero_persone']
                ) ?? []),

                'prenotazione_tavolo' => risposta($prenotazioniService->inserisciPrenotazioneDirettamenteNelTavolo(
                    $body['nome_prenotazione'], $body['ora_prenotazione'], $body['data_in_prenotazione'],
                    $body['attiva'], $body['numero_persone'], $body['tavoli'] ?? []
                )),

                'tavolo' => risposta($prenotazioniService->inserisciPrenotazioneTavolo(
                    $body['id_prenotazione'], $body['tavoli']
                )),

                default => throw new \InvalidArgumentException('Tipo non valido')
            };
            break;

        case 'PUT':
            $body = json_decode(file_get_contents('php://input'), true);

            if (!$type) {
                throw new \InvalidArgumentException('Parametro type mancante');
            }
            if (!$body) {
                risposta('JSON non valido', 400);
            }

            match ($type) {
                'prenotazioni' => risposta($prenotazioniService->modificaPrenotazione($id, $body['nome_prenotazione'], $body['ora_prenotazione'], $body['data_in_prenotazione'], $body['attiva'], $body['numero_persone'])),

                'tavolo' => risposta($prenotazioniService->aggiornaTavoloPrenotazione(
                    $id, $body['id_prenotazione'], $body['tavoli'] ?? []
                )),

                'prenotazioni_tavolo' => risposta($prenotazioniService->modificaPrenotazioneETavolo(
                    $id, $body['nome_prenotazione'], $body['ora_prenotazione'],
                    $body['data_in_prenotazione'], $body['attiva'], $body['numero_persone'], $body['tavoli'] ?? []
                )),

                default => throw new \InvalidArgumentException('Tipo non valido')
            };
            break;

        case 'PATCH':
            $body = json_decode(file_get_contents('php://input'), true);

            if (!$type) {
                throw new \InvalidArgumentException('Parametro type mancante');
            }
            if (!$body) {
                risposta('JSON non valido', 400);
            }

            match ($type) {
                'prenotazioni' => risposta($prenotazioniService->aggiornaStatoPrenotazione($id, $body['attiva'])),
                default => throw new \InvalidArgumentException('Tipo non valido')
            };
            break;

        case 'DELETE':
            
        
            
            if (!$type) {
                throw new \InvalidArgumentException('Parametro type mancante');
            }
            if ($type !== 'pulisci' && !$id) {
                risposta('ID mancante', 400);
            }

            $body = json_decode(file_get_contents('php://input'), true) ?? [];

            match ($type) {
                'prenotazioni' => risposta($prenotazioniService->eliminaPrenotazione($id)),

                'tavolo' => risposta($prenotazioniService->eliminaRelazionePrenotazioneTavolo($id)),
                
                'tavolo_prenotazioni' => risposta($prenotazioniService->eliminaPrenotazioniERelazioneTavolo($id)),
                
                'pulisci' => risposta($prenotazioniService->eliminaPrenotazioniIeri()),

                default => throw new \InvalidArgumentException('Tipo non valido')
            };
            break;

        default:
            risposta('Metodo non supportato', 405);
    }
} catch (\ValueError $e) {
    risposta('Valore enum non valido: ' . $e->getMessage(), 422);
} catch (\InvalidArgumentException $e ) {
    risposta($e->getMessage(), 400);
} catch (\TypeError $e) {
    risposta($e->getMessage(), 400);
} catch (\RuntimeException $e) {
    risposta($e->getMessage(), 404);
} catch (\Exception $e) {
    risposta($e->getMessage(), 500);
}