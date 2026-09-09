<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Inserisci Prenotazione';
$extra_css = 'prenotazioni.css';
?>
<?php 
require_once __DIR__ . '/../bootstrap.php'; // prima le dipendenze
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';    // ora $authService è disponibile

?>
<main>
  <div class="piatti">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per inserire la Prenotazione</p>
   </div>
   <div class="piatto">
     <form action="" id="form_inserisci_prenotazione" method="POST">
        <label for="nome-prenotazione" >Nome della prenotazione : </label>
        <input type="text"  id="nome-prenotazione" name="nome-prenotazione" required>

        <label for="ora-prenotazione">Ora Prenotazione : </label>
        <input type="time" name="ora-prenotazione" id="ora-prenotazione" min="12:00"  max="21:30"  step="900">
    
        <label for="data-in-prenotazione">Data Prenotazione : </label>
        <input type="date" name="data-in-prenotazione" id="data-in-prenotazione" min="<?= date('Y-m-d') ?>" max="2026-12-31" required>

        <label for="numero-persone">Numero Persone : </label>
        <input type="number"  id="numero-persone" name="numero-persone" required> 


        <fieldset>
            <legend>La prenotazione è Attiva? </legend>

            <label><input type="radio" id="attiva-si" name="attiva" value=1> Sì</label>
            <label><input type="radio" id="attiva-no" name="attiva" value=0> No</label>
        </fieldset>

        <fieldset id="tavoli_checkbox">
            <!--fare una lista dinamica di checkbox con js per vedere i tavoli in modo dinamico. Poi mettere una funzione che controlli se il numero di persone ha bisogno di 1 o pui tavoli  -->
            
            
        </fieldset> 
        <div id="controllo" ><p id="avviso"></p></div>
        <div id="controllo1" ><p id="avviso1"></p></div>
        <button type="button" class="btn-inserisci-prenotazione" >Inserisci</button>
     </form>
   </div>
   <a class="btn" href="../tavoli/gestionetavoli.php">Alla Visualizzazione dei Tavoli</a>

  </div>
<script type="module" src="/ristorante/public/assets/js/prenotazioni/inserisciPrenotazione.js" defer></script>    

</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>