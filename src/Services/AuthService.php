<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\UserRepositories;

class AuthService {
    public function __construct(private UserRepositories $userRepo, private LoggerService $logger){} #inietta il repository degli utenti

    public function login(string $username, string $password):  bool
    {
        $user = $this->userRepo->getByUsername($username); #ottiene l'utente dall'username

        if(!$user){
            $this->logger->warning("Login fallito: utente '{$username}' non trovato");
            return false;
        }

        if(!$user['attivo']){
            $this->logger->warning("Login fallito: utente '{$username}' non attivo");
            return false;
        }
        if(!password_verify($password, $user['password'])){
            $this->logger->warning("Login fallito: password errata per '{$username}'");
            return false;
        }

        session_regenerate_id(true); #rigenera l'id di sessione per sicurezza
        $_SESSION['user']=[
            'id' => $user['id'],
            'username' => $user['username'],
            'ruolo' => $user['ruolo']
        ];

        if($user['ruolo'] === 'admin'){
            $this->logger->info("Login riuscito come admin: '{$username}' (ruolo: admin)");
            header("Location:../public/dashboard.php");
            exit;
        } else if($user['ruolo']!=='admin'){
            $this->logger->info("Login riuscito: '{$username}' (ruolo: {$user['ruolo']})");
            header("Location:../public/tavoli/gestionetavoli.php");
            exit;
        }
             
        return true;
    }


    public function logout(): void
    {
        if(session_status() !== PHP_SESSION_ACTIVE){
            return;
        }
        
        $username = $_SESSION['user']['username'] ?? 'unknown';
        $_SESSION = [];
 
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();

        $this->logger->info("Logout: '{$username}'");
        header("Location:../public/login.php");
        exit;
    }

    function isAuth():bool{
        return isset($_SESSION['user']);
    }

    function requireAuth():bool{

        if (!$this->isAuth()){
            $this->logger->warning("Accesso non autorizzato");
            return false;
        }
        return true;
    }

    function requireRole(string $role):void{

          $this->requireAuth();
          if($_SESSION['user']['ruolo']!=$role){
            $this->logger->warning("Accesso negato: ruolo richiesto '{$role}'");
            header("Location:/../login.php");
            exit;
          }
    }

    function getCurrentUser():?array{

        if(!$this->isAuth()){
            return null;
        }
        return $_SESSION['user'];
    }
    public function register(string $username, string $email, string $password, string $ruolo):bool
    {
        $existingUser = $this->userRepo->getByUsername($username);
        if($existingUser){
            $this->logger->warning("Registrazione fallita: username '{$username}' già esistente");
            return false; #l'utente esiste già
        }

        if (!preg_match('/^[a-zA-Z0-9_]{3,15}$/', $username)) {
        $this->logger->warning("Registrazione fallita: username '{$username}' non valido");
        return false;
       }

        if (!filter_var( $email,FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        
        if (strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password) || strlen($password)>=20) {
            return false;
        }

        $passwordhash = password_hash($password, PASSWORD_DEFAULT);
        $attivo = 1; #imposta l'utente come attivo di default
        $this->userRepo->inserisciUTente($username, $email, $passwordhash, $ruolo, $attivo);
        $this->logger->info("Nuovo utente registrato: '{$username}' (ruolo: {$ruolo})");
        return true;
    }
    
    public function updateEmail(int $id_utente, string $newEmail):bool{

        $user = $this->userRepo->getById($id_utente);
        if(!$user){
            $this->logger->warning("Aggiornamento email fallito:Utente ID{$id_utente} non trovato");
            return false;
        }
        
        if (!filter_var($newEmail,FILTER_VALIDATE_EMAIL)) {
            $this->logger->warning("Aggiornamento email fallito: email '{$newEmail}'non valida''");
            return false;
        }

        $this->userRepo->aggiornaEmailUtente($id_utente, $newEmail);
        $this->logger->info("Utente {$id_utente}: email aggiornato a '{$newEmail}' (ruolo: {$user['ruolo']})");
        return true;
        
    }


    public function updateUsername(int $id_utente, string $newUsername):bool{

        $user = $this->userRepo->getById($id_utente);
        if(!$user){
            $this->logger->warning("Aggiornamento username fallito:Utente ID{$id_utente} non trovato");
            return false;
        }
        
        if (!preg_match('/^[a-zA-Z0-9_]{3,15}$/', $newUsername)) {
          $this->logger->warning("Aggiornamento fallito: username '{$newUsername}' non valido");
          return false;
        }

        $this->userRepo->aggiornaNomeUtente($id_utente, $newUsername);
        $this->logger->info("Utente {$id_utente}: username aggiornato a '{$newUsername}' (ruolo: {$user['ruolo']})");
        return true;
        
    }

    public function changePassword(int $userId,string $currentPassword,string $newPassword): bool {

        $user = $this->userRepo->getById($userId);

        if (!$user) {
            return false;
        }

        if (!password_verify($currentPassword, $user['password'])) {
            $this->logger->warning("Cambio password fallito per utente ID {$userId}: password attuale errata");
            return false;
        }

         if (strlen($newPassword) < 8 || !preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword) || strlen($newPassword)>=20) {
            
            $this->logger->warning("Cambio password fallito per utente ID {$userId}: nuova password non soddisfa i criteri di sicurezza");
            return false;
        }

        $newHash = password_hash($newPassword,PASSWORD_DEFAULT);

        $success = $this->userRepository->aggiornaPassword($userId,$newHash);

        if ($success) {
            $this->logger->info("Password cambiata per utente ID {$userId}");
        }
        return $success;
    }
}