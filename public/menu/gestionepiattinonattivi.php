<?php
$title = 'Gestione Piatti Che Non Sono Visibili ai Clienti';
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
    
    <a class="btn" href="gestionemenuchevedonoiclienti.php">Torna Ai Piatti Visualizzabili Dai Clienti</a>
    <a class="btn" href="inseriscibevanda.php">+ Inserisci Una Nuovo Piatto</a>
   
    <div class="menu" id="lavagna_piatti_non_attivi">
       
    </div>
    

<script  type="module" src="/ristorante/public/assets/js/menunonattivo.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
?>