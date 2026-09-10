<body>
<?php
$paginaCorrente = basename(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH));
$linkAttivo = static fn(string $pagina): string =>
  $paginaCorrente === $pagina ? ' aria-current="page"' : '';
?>
<header>
  <!--intestazione corretta-->
  <button class="menu" aria-expanded="false" aria-controls="mobile-menu" aria-label="Apri menu" type="button" >
    <span class="menu-icona"></span>
  </button>
  <nav class="mobile-menu" id="mobile" hidden>
      <button class="menu-chiuso"  aria-label="Chiudi menu">&times;</button>

    <ul>
      <li><a class="btn" href="/ristorante/public/tavoli/gestionetavoli.php"<?= $linkAttivo('gestionetavoli.php') ?>>Dashboard Tavoli</a></li>
      <li><a class="btn" href="/ristorante/public/menu/gestionemenuchevedonoiclienti.php"<?= $linkAttivo('gestionemenuchevedonoiclienti.php') ?>>Gestione Menu Per I Clienti</a></li>
      <li><a class="btn" href="/ristorante/public/dashboard.php"<?= $linkAttivo('dashboard.php') ?>>Prenotazioni</a></li>
      <li><a class="btn" href="/ristorante/public/prenotazioni/inserisciprenotazioni.php"<?= $linkAttivo('inserisciprenotazioni.php') ?>>Inserisci Una Prenotazione</a></li>
      <li><a class="btn" href="/ristorante/public/ordini/inserisciordine.php"<?= $linkAttivo('inserisciordine.php') ?>>Inserisci Comanda</a></li>
      <li><a class="btn" href="/ristorante/public/tavoli/inseriscitavolo.php"<?= $linkAttivo('inseriscitavolo.php') ?>>Inserisci Nuovo Tavolo</a></li>
      <li><a class="btn" href="/ristorante/public/ordini/visualizzascontrini.php"<?= $linkAttivo('visualizzascontrini.php') ?>>Storico Scontrini</a></li>
      <li><a class="btn" href="/ristorante/public/ordini/visualizzacomandebevande.php"<?= $linkAttivo('visualizzacomandebevande.php') ?>>Elenco Comande Bar</a></li>
      <li><a class="btn" href="/ristorante/public/ordini/visualizzacomandepiatti.php"<?= $linkAttivo('visualizzacomandepiatti.php') ?>>Elenco Comande Cucina</a></li>
      <li><a href="../../api/logout.php">Esci </a> </li>
    </ul>
  </nav>
</header>