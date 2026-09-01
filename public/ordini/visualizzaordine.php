<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Stampa Scontrino';
$id = $_GET['id'] ?? null; 
?>

<?php 
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';
require_once __DIR__ . '/../bootstrap.php';
//pagina di esempio AJAX fetch API
?>


<main>
    <div class="supporto-titolo">
        <h2><?= $title ?></h2>
    </div>

    <div id="order-header"></div>
    
    <div id="order-error" class="error-message"></div>
    <div id="order-board" class="order-board-container"></div>

    <div id="order-total" class="order-board-container"></div>

     <button
        type="button"
        id="btn-emetti-scontrino"
    >
        💶 Emetti scontrino
    </button>

    <a
        class="btn"
        href="../tavoli/gestionetavoli.php"
    >
        ← Torna agli ordini
    </a>

    <a 
    class="btn"
    href="./modificaordine.php?id=<?=$id?>"
    > Modifica
    </a>

</div>

<script>
    const API_SCONTRINO = '/ristorante/api/scontrino.php';
    const API_ORDINI = '/ristorante/api/ordini.php';

</script>
    <script type="module" src="/ristorante/public/assets/js/ordini/visualizzaordine.js" defer></script>
</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

