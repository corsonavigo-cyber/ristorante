<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$id=$_GET['id'];
$title = 'Modifica Tavolo '.$id;
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
     <p>compila i campi richiesti per modificare il tavolo</p>
   </div>
   <div class="tavolo">
      <form action="" id="form_modifica" method="POST">
        <label for="numero-tavolo" >Numero del Tavolo : </label>
        <input type="number" step="1" id="numero-tavolo" name="numero-tavolo">
        <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
        <label for="posti-max-tavolo">Posti Massimi del Tavolo : </label>
        <input type="number" step="1" id="posti-max-tavolo" name="posti-max-tavolo">

        <label for="posti-min-tavolo">Posti Minimi del Tavolo : </label>
        <input type="number" step="1" id="posti-min-tavolo" name="posti-min-tavolo">

        <button type="button" class="btn-modifica" data-id="<?= $id ?>">Modifica</button>
     </form>
   </div>
  </div>
</main>
<script>
    const API = '/ristorante/api/tavoli.php';
</script>
<script type="module" src="/ristorante/public/assets/js/tavoli/modificatavolo.js" defer></script><script>

</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>