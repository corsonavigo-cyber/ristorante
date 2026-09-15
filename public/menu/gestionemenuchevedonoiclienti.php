<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
require_once __DIR__ . '/../bootstrap.php';

$extra_css = 'menu.css';
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';

//si occupa di mostrare al gestore quello che vedranno i clienti
$title = 'Gestione Menu Attivo';

?>


<main> 
    <div class="supporto-titolo">
        <h2  class="title"><?= $title ?></h2>
        
    </div>
    <a class="btn" href="gestionepiattinonattivi.php">Gestisci La Visualizzazione Dei Piatti </a>
    <a class="btn" href="gestionebevandenonattive.php">Gestisci La Visualizzazione Delle Bevanda </a>
    
    <div class="schermata-divisa">
    
   
    <div class="menupiatti" id="lavagna_piatti_attivo">
       
    </div>

    <div class="menubevande" id="lavagna_bevande_attive">
       
    </div>
    </div>
    </div>

<script type="module" src="/ristorante/public/assets/js/menu/menuattivo.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

