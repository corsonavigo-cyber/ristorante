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
    <a href="menu/gestionemenuchevedonoiclienti.php">Gestione Menu Per I Clienti</a>
    <h3>Lista Prenotazioni non Attive</h3>
    <div id="lista_prenotazioni_non_attive"></div>
</body>
<script>
   var API_PRENOTAZIONI = '/ristorante/api/prenotazioni.php';
   window.API_PRENOTAZIONI = API_PRENOTAZIONI;
</script>
<script type="module" src="/ristorante/public/assets/js/prenotazioni/gestioneprenotazioni.js" defer></script>
<?php 
require_once __DIR__ . '/footer.php';
 ?>