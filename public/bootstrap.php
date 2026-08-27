
<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
date_default_timezone_set('Europe/Rome');
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Config\Database;


use App\Repositories\MenuRepositories;
use App\Repositories\TavoloRepositories;
use App\Repositories\UserRepositories;
use App\Repositories\PrenotazioniRepositories;
use App\Repositories\LeggiStoricoRepositories;
use App\Repositories\ScontrinoRepositories;
use App\Repositories\OrdiniRepositories;


use App\Services\OrdiniService;
use App\Services\ScontrinoService;
use App\Services\StoricoOrdiniService;


use App\Services\AuthService;
  
use App\Services\TavoloService;
use App\Services\PrenotazioniService;
use App\Services\StoricoPrenotazioniService;
use App\Services\LeggiStoricoService;
use App\Services\MenuService;
use App\Services\StampaService;

use App\Services\LoggerService;
$dotenv =Dotenv::createImmutable(__DIR__.'/../');
$dotenv->load();

if(session_status() === PHP_SESSION_NONE){
    session_start();
}
//chiamo in modo centralizzato la connessione
$logger = new LoggerService();

$pdo = Database::getInstance();
$menuRepository= new MenuRepositories($pdo);
$menuService= new MenuService($menuRepository, $logger);


$userRepository = new UserRepositories($pdo);
$tavoloRepository= new TavoloRepositories($pdo);
$prenotazioniRepository= new PrenotazioniRepositories($pdo);
$leggistoricoRepository = new LeggiStoricoRepositories(
    dirname(__DIR__) . '/storage/logs/storicoprenotazioni.txt'
);
$leggistoricoordiniRepository = new LeggiStoricoRepositories(
    dirname(__DIR__) . '/storage/logs/storicoordini.txt'
);


$ordiniRepository= new OrdiniRepositories($pdo);
$scontrinoRepository= new ScontrinoRepositories($pdo);
$storicoOrdini = new StoricoOrdiniService();

$stampaService = new StampaService(
    $ordiniRepository,
    $logger,
    dirname(__DIR__) . '/storage/logs/stampe'   // stesso pattern di storicoprenotazioni.txt/storicoordini.txt
);


//chiamo i service
//scrittura
$storicoPrenotazioni = new StoricoPrenotazioniService(); 

//estrapolazione dati
$authService = new AuthService($userRepository, $logger);
$tavoloService= new TavoloService($tavoloRepository, $logger);
$prenotazioniService= new PrenotazioniService($prenotazioniRepository, $logger,$storicoPrenotazioni,$pdo);
$leggiStoricoService = new LeggiStoricoService($leggistoricoRepository); 
$leggiStoricoOrdiniService = new LeggiStoricoService($leggistoricoordiniRepository);
$ordiniService = new OrdiniService($ordiniRepository,$logger,$storicoOrdini);
$scontrinoService = new ScontrinoService($scontrinoRepository,$logger,$storicoOrdini);
/*
$paginePubbliche = ['/login.php'];
//serve a non includere login.php nelle pagine da autorizzare ed ad evitare il loop
if (!in_array(basename($_SERVER['PHP_SELF']), array_map('basename', $paginePubbliche))) {
    if (!$authService->requireAuth()) {
        header("Location: /login.php");
        exit;
    }
}
    */