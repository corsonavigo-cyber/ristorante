<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Inserisci Tavolo';
$extra_css='tavoli.css';

?>
<?php 
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';
require_once __DIR__ . '/../bootstrap.php';
//pagina di esempio AJAX fetch API
?>
<main>
  <div class="tavoli">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per inserire il tavolo</p>
   </div>
   <div class="tavolo">
     <form action="" id="form_inserisci" method="POST">
        <label for="numero-tavolo" >Numero del Tavolo : </label>
        <input type="number" step="1" id="numero-tavolo" name="numero-tavolo">
        <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
        <label for="posti-max-tavolo">Posti Massimi del Tavolo : </label>
        <input type="number" step="1" id="posti-max-tavolo" name="posti-max-tavolo">

        <label for="posti-min-tavolo">Posti Minimi del Tavolo : </label>
        <input type="number" step="1" id="posti-min-tavolo" name="posti-min-tavolo">

        <button type="button" class="btn-inserisci" >Inserisci</button>
     </form>
   </div>
  </div>
<script>
    const API = '/ristorante/api/tavoli.php';
</script>
<script type="module" src="/ristorante/public/assets/js/tavoli/inseriscitavolo.js" defer></script>

</script>
</main>

</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>