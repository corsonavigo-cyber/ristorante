<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Visualizza Comande Bar';
$id = $_GET['id'] ?? null; //per preselezionare il tavolo


require_once __DIR__ . '/../bootstrap.php'; // prima le dipendenze
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';    // ora $authService è disponibile

?>
<main>
  <div class="piatti">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
  
        <div id="comande-bar">
            <div id="bevande">

                <h3>Ordini Bar</h3>  
               
                <div id="bevande_bar">
            
               </div>
            </div>
        </div>    
           
       
      </div>
   
      </form>
  
   
<script>
    const API_ORDINI = '/ristorante/api/ordini.php';

</script>
<script src="/ristorante/public/assets/js/ordiniprima.js" defer></script> 


</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>