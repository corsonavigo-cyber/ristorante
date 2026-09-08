<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
require_once __DIR__ . '/../bootstrap.php';

require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';

//si occupa di mostrare al gestore quello che vedranno i clienti
$title = 'Visualizza uno scontrino';
$extra_css='scontrini.css';
?>


<main> 
    <div class="supporto-titolo">
        <h2  class="title"><?= $title ?></h2>
    
    </div>

    <button class="btn" id="btn-aggiorna">Aggiorna</button>
    <a class="btn" href="../ordini/visualizzascontrini.php">Indietro</a>
    
    
    <div>
      <div id="scontrino-dettaglio">  </div>
     </div>
  
<script>
      const API_SCONTRINO = '/ristorante/api/scontrino.php';
</script>
<script type="module" src="/ristorante/public/assets/js/ordini/int-visualizzastoricoscontrini.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

