<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Gestione Comande';
?>

<?php 
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';
require_once __DIR__ . '/../bootstrap.php';
//pagina di esempio AJAX fetch API
?>


<main>
    <!--il bottone elimina viene gestito direttamente nel js per le prossime tabelle lo predisporro per sottrazione come avviene realente nei magazzini-->
    <div class="supporto-titolo">
        <h2><?= $title ?></h2>
    </div>
    
    <a class="btn" href="inserisciordine.php">+ Nuova Comanda</a>
   
    <div class="tavoli" id="lavagna_tavoli_ordini">
       
    </div>
    
<script>
    const API = '/ristorante/api/tavoli.php';
    const API_ORDINI = '/ristorante/api/ordini.php';
    
</script>
<script src="/ristorante/public/assets/js/tavoli.js" defer></script>    
<script src="/ristorante/public/assets/js/ordiniprima.js" defer></script> 
</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

