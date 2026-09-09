<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Gestione Tavoli';

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
   
    <a class="btn" href="../prenotazioni/inserisciprenotazioni.php">+ Prenotazione</a>
    <a class="btn" href="../ordini/inserisciordine.php">+ Comanda</a>
    <a class="btn" href="inseriscitavolo.php">+ Nuovo Tavolo</a>
    <a class="btn" href="../ordini/visualizzascontrini.php">Storico Scontrini</a>
    <a class="btn" href="../ordini/visualizzacomandebevande.php">Elenco Comande Bar</a>
    <a class="btn" href="../ordini/visualizzacomandepiatti.php">Elenco Comande Cucina</a>
     </div>


    <div class="tavoli" id="lavagna_tavoli">
       
    </div>
    
<script>
    const API = '/ristorante/api/tavoli.php';
    const API_PRENOTAZIONI = '/ristorante/api/prenotazioni.php';
    const API_ORDINI = '/ristorante/api/ordini.php';
</script>
<script type="module" src="/ristorante/public/assets/js/tavoli/gestiotavoli.js" defer></script>

</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

