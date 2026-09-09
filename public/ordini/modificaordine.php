<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Modifica Comanda';
$id = $_GET['id'] ?? null; //per preselezionare il tavolo
$extra_css='ordini.css';


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
        <input type="hidden" id="per_ordine_id" name="nascosto" value="">
        <button type="button"id="salva-ordine-stampa" > Salva&Stampa </button>       <div id="primo-step"> 
        <label for="numero-persone">Numero Persone : </label>
        <input type="number"  id="numero-persone" name="numero-persone" required> 


        <fieldset>
            <legend>Vuoi assegnare/aggiungere l'ordine a un altro tavolo/i? </legend>
            
            <label for="lavagnaTavoliSi">
                <input type="radio" id="lavagnaTavoliSi" class="lavagnaTavoliSi" name="lavagnaTavoli" value="si">
                Sì
            </label>
            <label for="lavagnaTavoliNo">
                <input type="radio" id="lavagnaTavoliNo" class="lavagnaTavoliNo" name="lavagnaTavoli" value="no" checked>
                No
            </label>

            <fieldset id="tavoli_checkbox" style="display:none;">
                
            </fieldset> 
            <div class="controllopositivo" id="controllo"><p id="avviso"></p></div>
            <div class="controllopositivo" id="controllo1"><p id="avviso1"></p></div>
        </fieldset>
        <button id="avanti" type="button" class="btn-avanti" dataset-id="#">Avanti</button>
       <div>
    </div>
   </div>
          <section id="secondo-step" class="piattir hider">
          <div id="contenitore">
            <div class="componi-comanda">
                <button type="button" id="btn-elimina-ordine-in-corso" class="btn-elimina-ordine-in-corso">Elimina</button>
              <div id="momenti-servizio">
              </div>
            
              <div class="schermo" class="1">
                <div id="piatti" >   
                  <h3>Piatti:</h3>  
                  <a class="btn" id="linkpiat" href="#">+ piatto fuorimenu</a>
                  <div id="piatti_input">
              
                  </div> 
                </div>
                <div id="bevande" >

                  <h3>Bevande:</h3>  
                  <a class="btn" id="linkbev" href="#">+ bevanda  fuorimenu</a>
                  <div id="bevande_input">
              
                  </div>
                </div>
            </div> 
            </div> 
            <div class="riassunto1" >
              
              <ul id="riassunto-ordine"></ul>
            </div>

          </div>
          </div>    
            <dialog id="dettaglioModal_item" class="dettaglioModal">

      <div id="dettaglioContenuto_item"></div>

      <div class="azioni-modal">
          <button type="button" id="btn-annulla-item" class="chiudiModal" data-salva="false">
              Annulla
          </button>

          <button type="button" id="btn-salva-item" class="chiudiModal" data-salva="true">
              Salva
          </button>
      </div>

    </dialog>
    <button type="button"  class="btn-inserisci-ordine hider" data-id="#">Modifica & Ristampa Comanda</button>
    
    <a href="../ordini/visualizzaordine.php?id=<?=$id?>"
            class="btn"
            data-id="<?=$id?>">
            Vai allo Scontrino 
        </a>
  </section>
   
      </form>
  
   
<script>
    const API = '/ristorante/api/tavoli.php';
    const API_ORDINI = '/ristorante/api/ordini.php';
    const API_MENU = '/ristorante/api/menu.php';

</script>
<script type="module" src="/ristorante/public/assets/js/ordini/init-modifica.js" defer></script> 



</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>