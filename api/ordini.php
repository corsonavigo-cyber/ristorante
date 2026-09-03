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


function risposta(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode(['success' => $status < 400, 'data' => $data]);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    $type = strtolower(trim($_GET['type'] ?? ''));
    //funzione per estrazione sicura id
    $getId = fn($key) => filter_input(INPUT_GET, $key, FILTER_VALIDATE_INT) ;
    // Estrazione parametri sicura
    $id = $getId('id');
    if (isset($_GET['id']) && $id === false) {
        throw new InvalidArgumentException('ID non valido');
    }
    $id_stato = $getId('id_stato');
    if (isset($_GET['id_stato']) && $id_stato === false) {
        throw new InvalidArgumentException('ID stato non valido');
    }
    $id_momento = $getId('id_momento');
    if (isset($_GET['id_momento']) && $id_momento === false) {
        throw new InvalidArgumentException('ID momento non valido');
    }
    $momento = isset($_GET['momento']) ? strtolower(trim($_GET['momento'])) : null ;


    // Decodifica JSON una volta sola
    $body = [];
    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        $input = file_get_contents('php://input');
        if (!empty($input)) {
            $body = json_decode($input, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new InvalidArgumentException('JSON malformato');
            }
        }
    }

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
                    $body['id_ordine'] ?? throw new \InvalidArgumentException('id_ordine mancante.'),
                    $body['voci'] ?? []
                ), 201),

             'stampa' => (function () use ($body, $stampaService) {
                    $idOrdine = (int) ($body['id_ordine'] ?? throw new \InvalidArgumentException('id_ordine mancante.'));
                    $isModifica = filter_var($body['modifica'] ?? false, FILTER_VALIDATE_BOOLEAN);
                    $tipo = $body['tipo'] ?? null;
                    if ($tipo !== null && !is_string($tipo)) {
                        throw new \InvalidArgumentException('tipo non valido.');
                    }
                    $percorsi = $stampaService->generaComandaTxt($idOrdine, $isModifica, $tipo);
                    return risposta([
                        'id_ordine' => $idOrdine,
                        'stampa' => 'accodata',
                        'percorsi' => $percorsi
                    ], 201);
                })(),
                
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
                    $body['id_ordine'], $body['id_comanda_dettaglio'], $body['id_momento']
                ) ?? []),
                'item_quantita_momento' => risposta($ordiniService->aggiornaQuantitaRelazioneOrdineItem(
                    $body['id_ordine'], $body['id_comanda_dettaglio'], $body['id_momento'], $body['quantita'], $body['note']
                ) ?? []),
                'comanda' => (function () use ($body, $ordiniService) {

                    $idOrdine = (int) (
                        $body['id_ordine']
                        ?? throw new \InvalidArgumentException('id_ordine mancante.')
                    );

                    $ordiniService->sostituisciComanda(
                        $idOrdine,
                        (int) (
                            $body['numero_persone']
                            ?? throw new \InvalidArgumentException('numero_persone mancante.')
                        ),
                        $body['tavoli']
                            ?? throw new \InvalidArgumentException('tavoli mancanti.'),
                        $body['comanda']
                            ?? throw new \InvalidArgumentException('comanda mancante.')
                    );

                    return risposta([
                        'id_ordine' => $idOrdine
                    ], 200);
                })(),

            
            default => throw new \InvalidArgumentException('Tipo  non valido')
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
                    $id
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
} catch (\Throwable $e) {  
    risposta($e->getMessage(), 500);
}