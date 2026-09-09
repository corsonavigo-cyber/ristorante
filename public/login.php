<?php 
$extra_css = 'login.css';
require_once __DIR__.'/bootstrap.php';
require_once __DIR__.'/head.php';


$errore=null;


if($_SERVER['REQUEST_METHOD']==='POST'){
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if($username === '' || $password ===''){
        $errore = "Username e password sono obbligatori";
    }else if($authService->login($username,$password)){
        header('Location:dashboard.php');
        exit;
    }else{
        $errore = "Credenziali non valide";
    }
}



?>

<body class="bodylogin">
    <div class="cards">
        <h2 class="title">Login</h2>
        <br>
        <?php if($errore): ?>
            <div class="alert">
                <!-- importante per l'accessibilità, usare htmlspecialchars per evitare XSS -->
                <?= htmlspecialchars($errore) ?>
            </div>
        <?php endif; ?>
        <form method="POST" action="" >
            <div class="card">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
                <br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>

                <button type="submit">Login</button>
            </div>
        </form>
    </div>
</body>
<?php

require_once __DIR__.'/footer.php';

?>

