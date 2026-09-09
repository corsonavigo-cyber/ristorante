<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Gestione Prenotazioni';
?>

<?php 
require_once __DIR__ . '/head.php';
require_once __DIR__ . '/navbar.php';
require_once __DIR__ . '/bootstrap.php';
//pagina di esempio AJAX fetch API
?>
<body>
    <h1 class="supporto-titolo"><?=$title?></h1>
   
    <div id="riassunto-dashboard" class="schermata-tre">   
        <div id="lista_prenotazioni_non_attive"></div>
        <div id="lista_prenotazioni_oggi"></div>
    
        <div id="lista_prenotazioni_future_attive">
        </div>
    </div>
</body>
<script>
   var API_PRENOTAZIONI = '/ristorante/api/prenotazioni.php';
   window.API_PRENOTAZIONI = API_PRENOTAZIONI;
</script>
<script type="module" src="/ristorante/public/assets/js/prenotazioni/gestioneprenotazioni.js" defer></script>
<?php 
require_once __DIR__ . '/footer.php';
 ?>