<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class PrenotazioniRepositories extends BaseRepositories {
    //select con join

     private const SELECT_PRENOTAZIONE_TAVOLI = <<<'SQL'
        SELECT
            prenotazione.id_prenotazione,
            prenotazione.nome_prenotazione,
            prenotazione.ora_prenotazione,
            prenotazione.data_in_prenotazione,
            prenotazione.attiva,
            prenotazione.numero_persone,
            GROUP_CONCAT(tavoli_prenotazione.id_tavolo ORDER BY tavolo.numero_tavolo SEPARATOR ', ') AS id_tavoli,
            GROUP_CONCAT(tavolo.numero_tavolo ORDER BY tavolo.numero_tavolo SEPARATOR ', ') AS numero_tavoli
        FROM prenotazione
        LEFT JOIN tavoli_prenotazione
            ON tavoli_prenotazione.id_prenotazione = prenotazione.id_prenotazione
        LEFT JOIN tavolo
            ON tavolo.id_tavolo = tavoli_prenotazione.id_tavolo
        SQL;
     
     //PRENOTAZIONI COLLEGATE E NON AI TAVOLI
     public function visualizzaPrenotazioni():?array
     {
        $stmt =$this->pdo->prepare(
            self::SELECT_PRENOTAZIONE_TAVOLI . <<<'SQL'

            WHERE prenotazione.data_in_prenotazione >= CURDATE()
            GROUP BY prenotazione.id_prenotazione
            ORDER BY prenotazione.data_in_prenotazione, prenotazione.ora_prenotazione
            SQL
    );
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaPrenotazioniTavolo(int $id_tavolo):?array
     {
        $stmt =$this->pdo->prepare(
            self::SELECT_PRENOTAZIONE_TAVOLI .<<<'SQL'
            
            WHERE prenotazione.data_in_prenotazione >= CURDATE() AND tavoli_prenotazione.id_tavolo = :id_tavolo
            GROUP BY prenotazione.id_prenotazione
            ORDER BY prenotazione.data_in_prenotazione, prenotazione.ora_prenotazione
        SQL);
        $stmt->execute(['id_tavolo' => $id_tavolo]);
        return $stmt->fetchAll() ?:null;
     }

    public function visualizzaPrenotazione(int $id_prenotazione):?array
    {
        $stmt =$this->pdo->prepare(
            self::SELECT_PRENOTAZIONE_TAVOLI .<<<'SQL'
            WHERE prenotazione.data_in_prenotazione >= CURDATE() AND prenotazione.id_prenotazione = :id_prenotazione
            GROUP BY id_prenotazione, ora_prenotazione,data_in_prenotazione, attiva, numero_persone
            ORDER BY data_in_prenotazione, ora_prenotazione
        SQL);
        $stmt->execute(['id_prenotazione' => $id_prenotazione]);
        return $stmt->fetch() ?:null;
    }
   
    public function visualizzaPrenotazioniData(string $data_in_prenotazione):?array
    //il js dovra mostrare con con un class warning quelle che non sono state collegate a un conto entro 1 ora dall'orario di prenotazione
     {
        $stmt = $this->pdo->prepare(
            self::SELECT_PRENOTAZIONE_TAVOLI . '
            WHERE prenotazione.data_in_prenotazione >= CURDATE()
            AND prenotazione.data_in_prenotazione = :data_in_prenotazione
            GROUP BY prenotazione.id_prenotazione
            ORDER BY prenotazione.ora_prenotazione,
                    prenotazione.numero_persone DESC'
        );        
        $stmt->execute(['data_in_prenotazione' => $data_in_prenotazione]);
        return $stmt->fetchAll() ?:null;
     }

    public function visualizzaPrenotazioniPrimaDi(string $data): array {
            $stmt = $this->pdo->prepare('SELECT * FROM prenotazione WHERE data_in_prenotazione < :data');
            $stmt->execute(['data' => $data]);
            return $stmt->fetchAll() ?:null;
    }


                //INSERIMENTI

    public function inserisciPrenotazioneTavolo(int $id_prenotazione,array $tavoli):bool{
        
       
        $stmt = $this->pdo->prepare('INSERT INTO tavoli_prenotazione (id_prenotazione, id_tavolo) VALUES (:id_prenotazione, :id_tavolo)');
 
        $righeInserite = 0;
        foreach ($tavoli as $id_tavolo) {
            $stmt->execute([
                'id_prenotazione' => $id_prenotazione,
                'id_tavolo' => $id_tavolo
            ]);
            $righeInserite += $stmt->rowCount();
        }
        // FIX: true solo se TUTTI i tavoli sono stati inseriti correttamente
        return $righeInserite === count($tavoli);
    }

 
    public function inserisciPrenotazione(string $nome_prenotazione, string $ora_prenotazione, string $data_in_prenotazione, int $attiva, int $numero_persone):int{

        $stmt = $this->pdo->prepare('INSERT INTO prenotazione (nome_prenotazione, ora_prenotazione, data_in_prenotazione, attiva, numero_persone) VALUES (:nome_prenotazione, :ora_prenotazione, :data_in_prenotazione, :attiva, :numero_persone)');
        $stmt->execute([
            'nome_prenotazione'=>$nome_prenotazione,
            'ora_prenotazione'=>$ora_prenotazione,
            'data_in_prenotazione'=>$data_in_prenotazione,
            'attiva'=>$attiva,
            'numero_persone'=>$numero_persone
        ]);
        return $id_prenotazione = (int)$this->pdo->lastInsertId();
     }

   public function isTavoloDisponibile(int $id_tavolo, string $data_in_prenotazione):bool
   {
       $prenotazioni_del_tavolo = $this->visualizzaPrenotazioniTavolo($id_tavolo);
       if( $prenotazioni_del_tavolo === null) { return true; }
       foreach($prenotazioni_del_tavolo as $prenotazione) { 
          if($prenotazione['data_prenotazione']===$data_in_prenotazione){
          return false;
          }
         }
       return true;
   }


     //DELETE

     
//domani prevedere elimina la relazione in base id_prenotazione e poi elimina le relazioni e le prenotazioni, inserendole in un file storico in base al giorno s eè passato
//delete di supporto per le relazioni
     public function eliminaRelazionePrenotazioneTavolo(int $id_prenotazione):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM tavoli_prenotazione WHERE id_prenotazione = :id_prenotazione');
        $stmt->execute([
            'id_prenotazione' => $id_prenotazione
        ]);
        return $stmt->rowCount()>0;
     }
     

     public function eliminaPrenotazione(int $id_prenotazione):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM prenotazione WHERE id_prenotazione = :id_prenotazione');
        $stmt->execute([
            'id_prenotazione' => $id_prenotazione
        ]);
        return $stmt->rowCount()>0;
     }

     //UPDATE

     //1.cambio stato prenotazione
     public function aggiornaStatoPrenotazione(int $id_prenotazione, int $attiva): bool
     {
        $stmt = $this->pdo->prepare('UPDATE prenotazione SET attiva = :attiva WHERE id_prenotazione = :id_prenotazione');
        $stmt->execute([
            'id_prenotazione' => $id_prenotazione,
            'attiva' => $attiva
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }

     
     //2.aggiorna la prenotazione
    public function aggiornaPrenotazione(int $id_prenotazione, string $nome_prenotazione, string $ora_prenotazione, string $data_in_prenotazione, int $attiva, int $numero_persone): bool
      {
         $stmt = $this->pdo->prepare('UPDATE prenotazione SET nome_prenotazione = :nome_prenotazione, ora_prenotazione = :ora_prenotazione, data_in_prenotazione = :data_in_prenotazione, attiva = :attiva , numero_persone = :numero_persone WHERE id_prenotazione = :id_prenotazione');
         $stmt->execute([
            'id_prenotazione' => $id_prenotazione,
            'nome_prenotazione' => $nome_prenotazione,
            'ora_prenotazione' => $ora_prenotazione,
            'data_in_prenotazione' => $data_in_prenotazione,
            'attiva'=> $attiva,
            'numero_persone'=>$numero_persone
         ]);
         return $stmt->rowCount()>0;
      }

   public function aggiornaTavoloPrenotazione(int $id_prenotazione, array $tavoli): bool
   {
      $this->iniziaTransazione();

      try {
         $this->eliminaRelazionePrenotazioneTavolo($id_prenotazione);
         $esito = $this->inserisciPrenotazioneTavolo($id_prenotazione, $tavoli);

         if (!$esito) {
            throw new \RuntimeException("Aggiornamento tavoli fallito per prenotazione {$id_prenotazione}");
         }

         $this->confermaTransazione();
         return true;
      } catch (\Throwable $e) {
         $this->annullaTransazione();
         throw $e;
      }
   }
     
}