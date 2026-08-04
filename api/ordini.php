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
use App\Enums\Tipo;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if ($id === false) {
    throw new InvalidArgumentException('ID non valido');
}
$type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : '';
$id_stato = filter_input(INPUT_GET, 'id_stato', FILTER_VALIDATE_INT);
if ($id_stato === false) {
    throw new InvalidArgumentException('ID stato non valido');
}
$momento = isset($_GET['momento']) ? strtolower(trim($_GET['momento'])) : null ;
$id_momento = filter_input(INPUT_GET, 'id_momento', FILTER_VALIDATE_INT);
if ($id_momento === false) {
    throw new InvalidArgumentException('ID momento non valido');
}
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
            match (true) {
                $type === 'ordine' && $id !== null => risposta($ordiniService->visualizzaUnOrdine($id)),


                $type === 'ordini' => risposta($ordiniService->visualizzaTuttiGliOrdini()),

                $type === 'stato' && $id !== null && $id_stato!== null => risposta($ordiniService->visualizzaOrdiniTavoloStato($id , $id_stato)),

                $type === 'stato' && $id!== null =>risposta($ordiniService->visualizzaTuttiGliOrdiniStato($id)),

                $type === 'momento' && $id !== null && $id_momento!== null =>risposta($ordiniService->visualizzaIlMomentoDiUnOrdine($id, $id_momento)),

                $type === 'momento' && $id_momento!== null =>risposta($ordiniService->visualizzaTuttiGliOrdiniMomento($id_momento)),
  
                $type === 'momenti' =>risposta($ordiniService->visualizzaTuttiIMomenti()),

                $type === 'piatti' && $id !== null => risposta($ordiniService->visualizzaTipoItemDiUnOrdine($id, Tipo::from('piatto'))),

                $type === 'bevande' && $id !== null=>risposta($ordiniService->visualizzaTipoItemDiUnOrdine($id, Tipo::from('bevanda'))),

                $type === 'ieri' =>risposta($ordiniService->visualizzaTuttiGliOrdiniDiIeri()),

                $type === 'oggi' =>risposta($ordiniService->visualizzaTuttiGliOrdiniOggi()),
                
                $type === 'modifica' && $id !== null =>risposta($ordiniService->visualizzaOrdiniTavoloPerModifica($id)),
                

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
                'stato' => risposta($ordiniService->relazioneOrdineStato(
                    $body['id_ordine'], $body['id_stato']
                ) ?? []),
                
                'ordine' => risposta($ordiniService->inserisciOrdine(
                    $body['numero_persone']
                ) ?? []),

                'item' => risposta($ordiniService->inserisciRelazioneOrdineItem(
                    $body['id_ordine'], $body['id_item'], $body['id_momento'],
                    $body['quantita'], $body['note'] ?? null
                ) ?? []),
                
               'ordinecompleto' => risposta([
                    'id_ordine' => $body['id_ordine'] ?? throw new \InvalidArgumentException('ID ordine mancante'),
                    'righe' => $ordiniService->inserisciOrdineDirettamenteNelTavoloStatoEPietanze(
                        (int) $body['id_stato'],
                        (int) $body['id_ordine'],
                        $body['items'] ?? [],
                        $body['tavoli'] ?? []
                    )
                ], 201),

                'tavolo' => risposta($ordiniService->relazioneOrdineTavolo(
                    $body['id_ordine'], $body['tavoli']) ?? []
                ),

                default => throw new \InvalidArgumentException('Tipo non valido')
            };
            break;

        case 'PUT':
            $body = json_decode(file_get_contents('php://input'), true);

            if (!$type) {
                throw new \InvalidArgumentException('Parametro type mancante');
            }
            if (!is_array($body)) {
                risposta('JSON non valido', 400);
            }

            match ($type) {
                

                'momento' => risposta($ordiniService->aggiornaMomentoRelazioneOrdineMomento(
                    $body['id_ordine'], $body['id_momento_vecchio'], $body['id_momento_nuovo']
                ) ?? []),
                'item_momento' => risposta($ordiniService->aggiornaMomentoRelazioneOrdineItem(
                    $body['id_ordine'], $body['id_item'], $body['id_momento']
                ) ?? []),
                'item_quantita_momento' => risposta($ordiniService->aggiornaQuantitaRelazioneOrdineItem(
                    $body['id_ordine'], $body['id_item'], $body['id_momento'], $body['quantita'],
                ) ?? []),


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
                'ordini_stato' => risposta($ordiniService->aggiornaRelazioneOrdineStato($id, $body['id_stato'])),
                
                'ordine' => risposta($ordiniService->aggiornaOrdine($id, $body['numero_persone'])),
                
                'tavolo' => risposta($ordiniService->aggiornaTavoloOrdine($id, $body['tavoli'])),

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

                'ordine_item' => risposta($ordiniService->eliminaRelazioneOrdineItemPerOrdine($id)),

                'ordine_tavolo' => risposta($ordiniService->eliminaRelazioneOrdineTavolo($id)),

                'ordine_stato' => risposta($ordiniService->eliminaRelazioneOrdineStato($id)),

                'item_momento' => risposta($ordiniService->eliminaRelazioneOrdineDiUnoSpecificoItem(
                    $id,
                    $body['id_momento'] ?? throw new \InvalidArgumentException('ID momento mancante'),
                    $body['id_item'] ?? throw new \InvalidArgumentException('ID item mancante')
                )),
                'ordine_momento' => risposta($ordiniService->eliminaRelazioneOrdinePerMomento(
                    $id,
                    $body['id_momento'] ?? throw new \InvalidArgumentException('ID momento mancante')
                )),

                'ordine' => risposta($ordiniService->eliminaOrdine($id)),

                'composto' => risposta($ordiniService->eliminaOrdineComposto($id)),

                'ieri' => risposta($ordiniService->eliminaOrdiniIeri()),

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