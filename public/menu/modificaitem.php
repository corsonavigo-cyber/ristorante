<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Modifica Piatto';
$id=$_GET['id'];
?>
<?php 
require_once __DIR__ . '/../bootstrap.php'; // prima le dipendenze
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';    // ora $authService è disponibile
//pagina di esempio AJAX fetch API
?>
<main>
  <div class="piatti">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per modificare il Piatto</p>
   </div>
   <div class="piatto">
     <form action="" id="form_modifica" method="POST">
        <label for="nome-piatto" >Nome del Piatto : </label>
        <input type="text"  id="nome-piatto" name="nome-piatto" required>

        <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
        <label for="descrizione">Descrizione : </label>
        <textarea placeholder="inserisci qui la descrizione del piatto" id="descrizione" name="descrizione"></textarea>

        <label for="prezzo">Prezzo : </label>
        <input type="number"  id="prezzo" name="prezzo" required> €


        <fieldset>
            <legend>Allergeni</legend>
            <!--allergeniSelezionati[] serve  ariempire un array di allergeni-->
            <label><input type="checkbox" name="allergeniSelezionati[]" value="1">🌾 Glutine</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="2">🦞 Crostacei</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="3">🥚 Uova</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="4">🐟 Pesce</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="5">🥜 Arachidi</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="6">🌿 Soia</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="7">🥛 Latte</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="8">🌰 Frutta a guscio</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="9">🥬 Sedano</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="10">🌼 Senape</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="11">🌱 Semi di sesamo</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="12">🍷 Solfiti</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="13">🟡 Lupini</label>
            <label><input type="checkbox" name="allergeniSelezionati[]" value="14">🦑 Molluschi</label>
        </fieldset> 

        <fieldset>
            <legend>Il Piatto va Immediatamente inserito nel Menu Clienti? </legend>

            <label><input type="radio" id="in-menu-si" name="in_menu" value="si"> Sì</label>
            <label><input type="radio" id="in-menu-no" name="in_menu" value="no"> No</label>
        </fieldset>

        <fieldset>
            <legend>A Quale Categoria Appartiene il Piatto </legend>

            <label><input type="radio" id="antipasto" name="categoria" value="antipasto">Antipasto</label>
            <label><input type="radio" id="primo" name="categoria" value="primo">Primo</label>
            <label><input type="radio" id="secondo" name="categoria" value="secondo">Secondo</label>
            <label><input type="radio" id="dolce" name="categoria" value="dolce">Dolce</label>
            <label><input type="radio" id="altro" name="categoria" value="altro">altro</label>
        </fieldset>

        <button type="button" class="btn-modifica" data-id="<?= $id ?>">Salva Modifiche</button>
     </form>
   </div>
  </div>
<script>
    const API = '/ristorante/api/menu.php';
</script>
<script src="/ristorante/public/assets/js/menu.js" defer></script>    
<script>


</script>
</main>

</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>