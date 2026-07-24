<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Gestione Tavoli';
?>

<?php 
require_once __DIR__ . '/head.php';
require_once __DIR__ . '/navbar.php';
require_once __DIR__ . '/bootstrap.php';
//pagina di esempio AJAX fetch API
?>
<body>
    <h1>Dashboard sei loggatto!!</h1>
    <a href="menu/gestionemenuchevedonoiclienti.php">Gestione Menu Per I Clienti</a>
</body>
<?php 
require_once __DIR__ . '/footer.php';
 ?>