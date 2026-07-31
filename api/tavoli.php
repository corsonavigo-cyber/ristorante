<?php
declare(strict_types=1);
//per il debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__.'/../public/bootstrap.php';

//devo sempre esserci per far funzionare la rest api.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: '. $_ENV['APP_CORS_ORIGIN']); // in produzione sarà concesso solo altuo dominio
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
        if($id){
            $tavolo = $tavoloService->getById($id);
            $tavolo ? risposta($tavolo) : risposta('Tavolo non trovato', 404);
        }else{
            risposta($tavoloService->visualizzaTavoli());
        }
        break;
        
      case 'POST':
        $body= json_decode(file_get_contents('php://input'),true);
        if (!$body) {
        risposta('JSON non valido', 400);
        }
        //validazione 
        if (empty($body['numero_tavolo']) || empty($body['posti_max']) || empty($body['posti_min'])) {
            risposta('Tutti i campi sono obbligatori', 422);
        }

        //creazione  DA VERIFICARE CREA PROBABIOLMENTE QUA IL PR0BLEMA
        $newId= $tavoloService->inserisciTavolo($body['numero_tavolo'], $body['posti_max'], $body['posti_min']);
        risposta(['id_tavolo'=>$newId],201);
        break;

      case 'PUT':
        if (!$id) {
           risposta('id obbligatorio', 400);
        }
        $body= json_decode(file_get_contents('php://input'),true);
        if (!$body) {
          risposta('JSON non valido', 400);
        }
        $ok= $tavoloService->modificaTavolo($id,$body['numero_tavolo'],$body['posti_max'],$body['posti_min']);
        risposta($ok ? 'Aggiornato' : 'Nessuna Modifica');
        break;
      case 'DELETE':
        if (!$id) {
           risposta('id obbligatorio', 400);
        }
        
        $ok= $tavoloService->eliminaTavolo($id);
        risposta($ok ? 'Eliminato' : 'Non eliminato');
        break;
      default:
            risposta('Metodo non supportato', 405);
   }
}catch (\InvalidArgumentException $e){
      risposta($e->getMessage(),400);
}catch(\RunTimeException $e){
      risposta($e->getMessage(),404);
}catch(\Exception $e){
      risposta($e->getMessage(),500);
}