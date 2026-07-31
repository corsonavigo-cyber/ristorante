<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class TavoloRepositories extends BaseRepositories {

     

     public function visualizzaTavoli():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM tavolo ORDER BY numero_tavolo');
         $stmt->execute();
         return $stmt->fetchAll() ?:null;
     }
     #metodo per ottenere un tavolo dal database dato il suo numero, restituisce un array associativo o null se non trovato
     public function getByNumero(int $numero): ?array 
     {
        #preparo la connessione
        $stmt = $this->pdo->prepare('SELECT * FROM tavolo WHERE numero_tavolo = :numero_tavolo LIMIT 1'); #prepara una query SQL con un parametro
        $stmt->execute(['numero_tavolo' => $numero]); #esegue la query sostituendo il parametro con il valore passato
        return $stmt->fetch() ?: null; #restituisce il risultato come array associativo o null se non trovato

     }

     public function getById(int $id_tavolo):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM tavolo WHERE id_tavolo =:id_tavolo LIMIT 1');
         $stmt->execute(['id_tavolo' => $id_tavolo]);
         return $stmt->fetch() ?:null;
     }

     public function inserisciTavolo(int $numero, int $posti_max, int $posti_min):int{

        $stmt = $this->pdo->prepare('INSERT INTO tavolo (numero_tavolo,posti_max,posti_min) VALUES (:numero_tavolo,:posti_max,:posti_min)');
        $stmt->execute([
            'numero_tavolo'=>$numero,
            'posti_max'=>$posti_max,
            'posti_min'=>$posti_min
        ]);
        return (int)$this->pdo->lastInsertId();
     }

     public function aggiornaTavolo(int $id_tavolo, int $numero, int $posti_max, int $posti_min): bool
     {
        $stmt = $this->pdo->prepare('UPDATE tavolo SET numero_tavolo = :numero_tavolo, posti_max = :posti_max, posti_min = :posti_min WHERE id_tavolo = :id_tavolo');
        $stmt->execute([
            'id_tavolo' => $id_tavolo,
            'numero_tavolo' => $numero,
            'posti_max' => $posti_max,
            'posti_min' => $posti_min
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }

     public function eliminaTavolo(int $id_tavolo):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM tavolo WHERE id_tavolo = :id_tavolo');
        $stmt->execute([
            'id_tavolo' => $id_tavolo
        ]);
        return $stmt->rowCount()>0;
     }
     
}