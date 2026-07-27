<?php
declare(strict_types=1);

//per il debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__.'/../public/bootstrap.php';
use App\Enums\Categoria;
use App\Enums\InMenu;
use App\Enums\Tipo;

//devo sempre esserci per far funzionare la rest api.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: '. $_ENV['APP_CORS_ORIGIN']); // in produzione sarà concesso solo altuo dominio
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


// Preflight CORS deve essere sempre presente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

//Configurazione connessioni tramite Bootstrap,
//per le REST API, ma alcune sono già nel file bootstrap

$method= $_SERVER['REQUEST_METHOD'];

//se possibile recupera l'id
$id = isset($_GET['id']) ? (int)$_GET['id'] :null;
$type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : '';
//fuction di supporto per la risposta  rispondi se la richiesta genera una risposta del server <400
function risposta(mixed $data,int $status=200):void {
    http_response_code($status);
    echo json_encode(['success'=>$status<400, 'data'=>$data]);
    exit;
}

//utilizza un try catch per le operazioni CORS
try{
   switch($method){
case 'GET':

    if (!$type) {
        throw new InvalidArgumentException('Parametro type mancante');
    }

    match ($type) {

            'item' =>
                $id
                    ? risposta($menuService->visualizzaItemConRelazioni($id))
                    : risposta($menuService->visualizzaItem()),

            'categoria' =>
                risposta(
                    $menuService->selezionaItemPerCategoria(
                        Categoria::from($_GET['categoria'])
                    )
                ),

            'tipo' =>
                risposta(
                    $menuService->selezionaItemPerTipo(
                        Tipo::from($_GET['tipo'])
                    )
                ),

            'menu' =>
                risposta(
                    $menuService->selezionaItemInMenu(
                        InMenu::from($_GET['in_menu'])
                    )
                ),

            'iva' =>
                risposta(
                    $menuService->selezionaItemIdIva(
                        (int)$_GET['id_iva']
                    )
                ),

            'allergeni' =>
                $id
                    ? risposta($menuService->selezionaAllergene($id))
                    : risposta($menuService->visualizzaListaAllergeni()),

            default =>
                throw new InvalidArgumentException('Tipo non valido')
        };

        break;
        
      case 'POST':

            $body = json_decode(file_get_contents('php://input'), true);

            if (!$type) {
                throw new InvalidArgumentException('Parametro type mancante');
            }

            if (!$body) {
                risposta('JSON non valido', 400);
            }

            match ($type) {

                'item' =>
                    risposta(
                        $menuService->inserisciItem(
                            Tipo::from($body['tipo']),
                            Categoria::from($body['categoria']),
                            InMenu::from($body['in_menu']),
                            $body['nome'],
                            (float)$body['prezzo'],
                            $body['descrizione'],
                            (int)$body['id_iva'],
                            $body['allergeni'] ?? []
                        ),
                        201
                    ),

                'allergeni' =>
                    risposta(
                        $menuService->nuovoAllergene(
                            $body['nome_allergene']
                        ),
                        201
                    ),

                default =>
                    throw new InvalidArgumentException('Tipo non valido')
            };

            break;
    case 'PUT':

            $body = json_decode(file_get_contents('php://input'), true);

            if (!$type) {
                throw new InvalidArgumentException('Parametro type mancante');
            }

            if (!$body) {
                risposta('JSON non valido', 400);
            }
            if (!$id) {
                    risposta('ID mancante', 400);
                }

            match ($type) {

                'item' =>
                    risposta(
                        $menuService->aggiornaItem(
                            $id,
                            Tipo::from($body['tipo']),
                            InMenu::from($body['in_menu']),
                            Categoria::from($body['categoria']),
                            $body['nome'],
                            (float)$body['prezzo'],
                            $body['descrizione'],
                            (int)$body['id_iva'],
                            $body['allergeni_selezionati']
                        )
                    ),

                default =>
                    throw new InvalidArgumentException('Tipo non valido')
            };

            break;
   case 'PATCH':

            $body = json_decode(file_get_contents('php://input'), true);

            if (!$type) {
                throw new InvalidArgumentException('Parametro type mancante');
            }

            if (!$body) {
                risposta('JSON non valido', 400);
            }
            if (!$id) {
                    risposta('ID mancante', 400);
                }
            
            

            match ($type) {

                'item' =>
                    risposta(
                        $menuService->aggiornaStatoItem(
                            $id,
                            InMenu::from($body['in_menu'])
                        )
                    ),

                default =>
                    throw new InvalidArgumentException('Tipo non valido')
            };

            break;

      case 'DELETE':

                if (!$id) {
                    risposta('ID mancante', 400);
                }

                if (!$type) {
                    throw new InvalidArgumentException('Parametro type mancante');
                }

                match ($type) {

                    'item' =>
                        risposta(
                            $menuService->cancellaItem($id)
                        ),

                    'allergeni' =>
                        risposta(
                            $menuService->cancellaAllergene($id)
                        ),

                    default =>
                        throw new InvalidArgumentException('Tipo non valido')
                };

                break;

      default:
        risposta('Metodo non supportato', 405);
}


} catch (\ValueError $e) {
    risposta('Valore enum non valido: ' . $e->getMessage(), 422);
} catch (\InvalidArgumentException $e) {
    risposta($e->getMessage(), 400);
} catch (\RuntimeException $e) {
    risposta($e->getMessage(), 404);
} catch (\Exception $e) {
    risposta($e->getMessage(), 500);
}
