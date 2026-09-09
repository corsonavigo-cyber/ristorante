<?php
$title = 'Gestione Bevande Che Non Sono Visibili ai Clienti';
$extra_css='menu.css';

?>

<?php 
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';

?>

<main>
    <div class="supporto-titolo">
        <h2><?= $title ?></h2>
    </div>
    
    <div class="menu-actions">
        <a class="btn" href="gestionemenuchevedonoiclienti.php">Torna Alle Bevande Visualizzabili Dai Clienti</a>
        <a class="btn" href="inserisciitem.php">+ Inserisci Una Nuovo Prodotto</a>
    </div>
   
    <div class="menu" id="lavagna_bevande_non_attive">
       
    </div>
    

<script  type="module" src="/ristorante/public/assets/js/menu/menunonattivo.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
?>