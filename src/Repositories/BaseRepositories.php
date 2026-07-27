<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database

abstract class  BaseRepositories {

     public function __construct(private PDO $pdo){}

    //POROPRIETA' SQL PER LE TRANZAZIONI MULTIPLE
    public function inTransaction(): bool {
         return $this->pdo->inTransaction();
      }

      public function iniziaTransazione(): void {
         if (!$this->pdo->inTransaction()) { // evita "There is already an active transaction"
            $this->pdo->beginTransaction();
         }
      }

      public function confermaTransazione(): void {
         if ($this->pdo->inTransaction()) { // evita errori se non c'è nulla da confermare
            $this->pdo->commit();
         }
      }

      public function annullaTransazione(): void {
         if ($this->pdo->inTransaction()) { // evita "There is no active transaction"
            $this->pdo->rollBack();
         }
      }
}