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
    <div class="supporto-titolo">
        <h2><?= $title ?></h2>
    </div>

    <div id="order-header"></div>
    <div id="order-error" class="error-message"></div>
    <div id="order-board" class="order-board-container"></div>

    <script type="module" src="/ristorante/public/assets/js/ordini/visualizzaordine.js" defer></script>
</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

