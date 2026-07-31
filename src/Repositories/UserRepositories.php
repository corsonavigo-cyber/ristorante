<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class UserRepositories extends BaseRepositories {

    
     #metodo per ottenere un utente dal database dato il suo username, restituisce un array associativo o null se non trovato
     public function getByUsername(string $username): ?array 
     {
        #preparo la connessione
        $stmt = $this->pdo->prepare('SELECT * FROM utente WHERE username = :username LIMIT 1'); #prepara una query SQL con un parametro
        $stmt->execute(['username' => $username]); #esegue la query sostituendo il parametro con il valore passato
        return $stmt->fetch() ?: null; #restituisce il risultato come array associativo o null se non trovato

     }

     public function getById(int $id_utente):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM utente WHERE id_utente =:id_utente LIMIT 1');
         $stmt->execute(['id_utente' => $id_utente]);
         return $stmt->fetch() ?:null;
     }

     public function inserisciUTente(string $username, string $email, string $passwordhash, string $ruolo, int $attivo):int{

        $stmt = $this->pdo->prepare('INSERT INTO utente (username,email,password,ruolo,attivo) VALUES (:username,:email,:password,:ruolo, :attivo)');
        $stmt->execute([
            'username'=>$username,
            'email'=>$email,
            'password'=>$passwordhash,
            'ruolo'=>$ruolo,
            'attivo'=>$attivo
        ]);
        return $this->pdo->lastInsertId();
     }
     public function aggiornaEmailUtente(int $id_utente, string $email): bool
     {
        $stmt = $this->pdo->prepare('UPDATE utente SET email = :email WHERE id_utente = :id_utente');
        $stmt->execute([
            'id_utente' => $id_utente,
            'email' => $email
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }

     public function aggiornaNomeUtente(int $id_utente, string $username): bool
     {
        $stmt = $this->pdo->prepare('UPDATE utente SET username = :username WHERE id_utente = :id_utente');
        $stmt->execute([
            'id_utente' => $id_utente,
            'username' => $username
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }
     public function cambiaStatoAttivo(int $id_utente, int $attivo):bool
     {
        $stmt = $this->pdo->prepare('UPDATE utente SET attivo = :attivo WHERE id_utente = :id_utente');
        $stmt->execute([
            'id_utente' => $id_utente,
            'attivo' => $attivo
        ]);
        return $stmt->rowCount()>0;
     }
     public function aggiornaPassword(int $id_utente, string $passwordhash):bool
     {
        $stmt = $this->pdo->prepare('UPDATE utente SET password = :password WHERE id_utente = :id_utente');
           $stmt->execute([
            'id_utente'=>$id_utente,
            'password'=>$passwordhash
           ]);
          return $stmt->rowCount()>0; 
     }
}