<?php
$title = 'Inserisci Prodotto Nel Menu';
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
     <p>compila i campi richiesti per inserire il Prodotto</p>
   </div>
   <div class="bevanda">
     <form action="" id="form_inserisci_item" method="POST">
        <label for="nome-item">Nome Prodotto : </label>
        <input type="text" id="nome-item" name="nome-item" required>

        <fieldset>
            <legend>Quale è Il Tipo Del Prodotto ?</legend>
            <label><input type="radio" id="piatto" name="tipo" value="piatto">Piatto</label>
            <label><input type="radio" id="bevanda" name="tipo" value="bevanda">Bevanda</label>
            <label><input type="radio" id="servizio" name="tipo" value="servizio">Servizio</label>
            <label><input type="radio" id="altro" name="tipo" value="altro">Altro</label>
        </fieldset>

        <fieldset>
            <legend>Quale è L'Iva Del Prodotto ?</legend>
            <label><input type="radio" id="Aliquota Ristorazione e Somministrazione" name="id_iva" value="1">10%-Aliquota Ristorazione e Somministrazione</label>
            <label><input type="radio" id="Aliquota Standard (Alcolici e Servizi)" name="id_iva" value="1">22%-Aliquota Standard (Alcolici e Servizi)</label>
            <label><input type="radio" id="Aliquota Minima (Prodotti di prima necessità)" name="id_iva" value="3">4%-Aliquota Minima (Prodotti di prima necessità)</label>
        </fieldset>

        <fieldset>
            <legend>Il Prodotto va Immediatamente inserito nel Menu Clienti?</legend>
            <label><input type="radio" id="in-menu-si" name="in_menu" value="si"> Sì</label>
            <label><input type="radio" id="in-menu-no" name="in_menu" value="no"> No</label>
        </fieldset>
        <!--piatto', 'bevanda', 'servizio', 'altro'       'antipasto','primo','secondo','dolce','bevanda_analcolica','bevanda_alcolica','fuori_menu','costo_aggiuntivo','altro-->
        <fieldset>
            <legend>Scegli Una Categoria Per Il Prodotto</legend>
            <label><input type="radio" id="bevanda_alcolica" name="categoria" value="bevanda_alcolica">Bevanda Alcolica</label>
            <label><input type="radio" id="bevanda_analcolica" name="categoria" value="bevanda_analcolica">Bevanda Analcolica</label>
            <label><input type="radio" id="antipasto" name="categoria" value="antipasto">Antipasto</label>
            <label><input type="radio" id="primo" name="categoria" value="primo">Primo</label>
            <label><input type="radio" id="secondo" name="categoria" value="secondo">Secondo</label>
            <label><input type="radio" id="dolce" name="categoria" value="dolce">Dolce</label>
            <label><input type="radio" id="altro" name="categoria" value="altro">Altro</label>
            <label><input type="radio" id="fuori_menu" name="categoria" value="fuori_menu">Fuori Menu</label>
            <label><input type="radio" id="costo_aggiuntivo" name="categoria" value="costo_aggiuntivo">Costo Aggiuntivo</label>
        </fieldset>


        <div class="controllopositivo" id="controllo"><p id="avviso"></p></div>

        <label for="descrizione">Descrizione : </label>
        <textarea placeholder="inserisci qui la descrizione del prodotto" id="descrizione" name="descrizione"></textarea>

        <label for="prezzo">Prezzo : </label>
        <input type="number" id="prezzo" name="prezzo" required> €



        <fieldset>
            <legend>Allergeni (Eventuali) </legend>
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

    
        <button type="button" class="btn-inserisci-item">Inserisci</button>
     </form>
   </div>
  </div>

<script type="module" src="/ristorante/public/assets/js/menu/inserisciitemmenu.js" defer></script>
</main>
<?php 
require_once __DIR__ . '/../footer.php';
?>