<?php
$title = 'Gestione Bevande Che Non Sono Visibili ai Clienti';
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
    
    <a class="btn" href="gestionemenuchevedonoiclienti.php">Torna Alle Bevande Visualizzabili Dai Clienti</a>
    <a class="btn" href="inseriscibevanda.php">+ Inserisci Una Nuova Bevanda</a>
   
    <div class="menu" id="lavagna_bevande_nonattive">
       
    </div>
    

<script src="/ristorante_classic/public/assets/js/menu.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
?>