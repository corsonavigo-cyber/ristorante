<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Modifica Comanda';
$id = $_GET['id'] ?? null; //per preselezionare il tavolo


require_once __DIR__ . '/../bootstrap.php'; // prima le dipendenze
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';    // ora $authService è disponibile

?>
<main>
  <div class="piatti">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per Modificare la Comanda</p>
     
   </div>
   <div class="piatto">
     <form action="" id="form_modifica_ordine" method="POST">
        <button id="salva" > Salva </button>
       <div id="primo-step"> 
        <label for="numero-persone">Numero Persone : </label>
        <input type="number"  id="numero-persone" name="numero-persone" required> 


        <fieldset>
            <legend>Vuoi assegnare/aggiungere l'ordine a un altro tavolo/i? </legend>
             <fieldset id="tavoli_checkbox">
                
             </fieldset> 
             <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
            <div class="controllopositivo" id="controllo1"><p id="avviso1"></p> </div>
        </fieldset>
        <button id="avanti" type="button" class="btn-avanti" dataset-id="#">Avanti</button>
       <div>
    </div>
   </div>
      <div id="secondo-step" class="piattir hider">
        <div id="contenitore">
             <button type="button" id="aggiorna" class="aggiorna">Aggiorna</button> 
             <button type="button" id="indietro" class="btn-indietro">Indietro</button>
           <div id="momenti-servizio">
           </div>
         
            <div class="schermo">
              <div id="piatti">   
                <h3>Piatti:</h3>  
                <a class="btn" id="linkpiat" href="#">+ piatto fuorimenu</a>
                <div id="piatti_input">
            
                </div> 
            </div>
            <div id="bevande">

                <h3>Bevande:</h3>  
                <a class="btn" id="linkbev" href="#">+ bevanda  fuorimenu</a>
                <div id="bevande_input">
            
               </div>
            </div>
         </div> 
         <div >
            <ul id="riassunto-ordine"></ul>
         <div>


        </div>    
           
       <button type="button"  class="btn-inserisci-ordine" data-id="#">Salva & Stampa Comanda</button>
      </div>
   
      </form>
  
   
<script>
    const API = '/ristorante/api/tavoli.php';
    const API_ORDINI = '/ristorante/api/ordini.php';
    const API_MENU = '/ristorante/api/menu.php';

</script>
<script src="/ristorante/public/assets/js/tavoli.js" defer></script>    
<script src="/ristorante/public/assets/js/ordiniprima.js" defer></script> 



</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>