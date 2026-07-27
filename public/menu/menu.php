<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
require_once __DIR__ . '/../bootstrap.php';

require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';

//si occupa di mostrare al gestore quello che vedranno i clienti
$title = 'Menu del Giorno';
?>


<main> 
    <div class="supporto-titolo">
        <h2  class="title"><?= $title ?></h2>
    
    <div class="schermata-divisa">
    
    <div>
   
    <div class="menu" id="lavagna_menu_attivo">
       
    </div>

    <div class="menubevande" id="lavagna_bevande_attive">
       
    </div>
    </div>
    </div>
<script>
    const API = '/ristorante_classic/api/menu.php';
</script>
<script src="/ristorante_classic/public/assets/js/menu.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

