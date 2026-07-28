<?php
$title = 'Inserisci Bevanda';
?>
<?php 
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';
?>
<main>
  <div class="bevande">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per inserire la Bevanda</p>
   </div>
   <div class="bevanda">
     <form action="" id="form_inserisci_bevanda" method="POST">
        <label for="nome-bevanda">Nome della Bevanda : </label>
        <input type="text" id="nome-bevanda" name="nome-bevanda" required>

        <div class="controllopositivo" id="controllo"><p id="avviso"></p></div>

        <label for="descrizione">Descrizione : </label>
        <textarea placeholder="inserisci qui la descrizione della bevanda" id="descrizione" name="descrizione"></textarea>

        <label for="prezzo">Prezzo : </label>
        <input type="number" id="prezzo" name="prezzo" required> €

        <fieldset>
            <legend>Allergeni</legend>
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
            <legend>La Bevanda va Immediatamente inserita nel Menu Clienti?</legend>
            <label><input type="radio" id="in-menu-si" name="in_menu" value="si"> Sì</label>
            <label><input type="radio" id="in-menu-no" name="in_menu" value="no"> No</label>
        </fieldset>

        <fieldset>
            <legend>La Bevanda Contiene Alcol?</legend>
            <label><input type="radio" id="alcol-si" name="alcol" value="si"> Sì</label>
            <label><input type="radio" id="alcol-no" name="alcol" value="no"> No</label>
        </fieldset>

        <button type="button" class="btn-inserisci-bevanda">Inserisci</button>
     </form>
   </div>
  </div>
<script>
    const API = '/ristorante/api/menu.php';
</script>
<script src="/ristorante/public/assets/js/menu.js" defer></script>
</main>
<?php 
require_once __DIR__ . '/../footer.php';
?>