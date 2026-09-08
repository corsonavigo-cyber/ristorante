<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Modifica Prenotazione';
$id = $_GET['id'] ?? null;
?>
<?php 
require_once __DIR__ . '/../bootstrap.php'; // prima le dipendenze
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';    // ora $authService è disponibile
//pagina css da aggiungere
$extra_css='prenotazioni.css';

?>
<main>
  <div class="piatti">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per inserire modificare la Prenotazione</p>
   </div>
   <div class="piatto">
     <form action="" id="form_modifica_prenotazione" method="POST">
        <label for="nome-prenotazione" >Nome della prenotazione : </label>
        <input type="text"  id="nome-prenotazione" name="nome-prenotazione" required>

        <label for="ora-prenotazione">Ora Prenotazione : </label>
        <input type="time" name="ora-prenotazione" id="ora-prenotazione" min="12:00"  max="21:30"  step="900">
  
        <label for="data-in-prenotazione">Data Prenotazione : </label>
        <input type="date" name="data-in-prenotazione" id="data-in-prenotazione" min="<?= date('Y-m-d') ?>" max="2026-12-31" required>
    
        
        
        <label for="numero-persone">Numero Persone : </label>
        <input type="number"  id="numero-persone" name="numero-persone" required> 


        <fieldset>
            <legend>Attivare la Prenotazione? </legend>

            <label><input type="radio" id="attiva-si" name="attiva" value=1> Sì</label>
            <label><input type="radio" id="attiva-no" name="attiva" value=0> No</label>
        </fieldset>

        <fieldset id="tavoli_checkbox">
            
            
        </fieldset> 
        <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
        <div class="controllopositivo" id="controllo1"><p id="avviso1"></p> </div>
        <button type="button"  class="btn-modifica-prenotazione" data-id="<?= $id ?>">Modifica</button>
     </form>
   </div>
  </div>
<script type="module" src="/ristorante/public/assets/js/prenotazioni/modificaPrenotazione.js" defer></script>    

</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>