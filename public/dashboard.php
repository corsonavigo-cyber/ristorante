<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Gestione Tavoli';
?>

<?php 
require_once __DIR__ . '/head.php';
require_once __DIR__ . '/navbar.php';
require_once __DIR__ . '/bootstrap.php';
//pagina di esempio AJAX fetch API
?>
<body>
    <h1>Dashboard sei loggatto!!</h1>
    <a class="btn" href="menu/gestionemenuchevedonoiclienti.php">Gestione Menu Per I Clienti</a>
    <a class="btn" href="tavoli/gestionetavoli.php">Gestione Tavoli</a>
    <a class="btn" href="prenotazioni/inserisciprenotazioni.php">Inserisci Una Prenotazione</a>
    <a class="btn" href="ordini/inserisciordine.php">Inserisci Comanda</a>
    <a class="btn" href="tavoli/inseriscitavolo.php">Inserisci Nuovo Tavolo</a>
    <a class="btn" href="ordini/visualizzascontrini.php">Storico Scontrini</a>
    <a class="btn" href="ordini/visualizzacomandebevande.php">Elenco Comande Bar</a>
    <a class="btn" href="ordini/visualizzacomandepiatti.php">Elenco Comande Cucina</a>
    
    <div id="lista_prenotazioni_non_attive"></div>
    <div id="lista_prenotazioni_oggi"></div>
   
    <div id="lista_prenotazioni_future_attive"></div>
</body>
<script>
   var API_PRENOTAZIONI = '/ristorante/api/prenotazioni.php';
   window.API_PRENOTAZIONI = API_PRENOTAZIONI;
</script>
<script type="module" src="/ristorante/public/assets/js/prenotazioni/gestioneprenotazioni.js" defer></script>
<?php 
require_once __DIR__ . '/footer.php';
 ?>