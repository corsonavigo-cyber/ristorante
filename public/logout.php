
<?php

require_once __DIR__.'/../public/bootstrap.php';

$authService->logout();

header("Location: /login.php");
exit;

?>