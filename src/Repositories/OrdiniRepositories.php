<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
use App\Enums\Stato;
use App\Enums\Momento;
#creo una nuova classe OrdiniRepositories che gestisce gli ordini nel database
class OrdiniRepositories extends BaseRepositories {

     private const API_TOT_QUERY = 'SELECT * FROM api_tot';

     public function __construct(private PDO $pdo){}
     //ordin COLLEGATE E NON AI TAVOLI
     public function visualizzaTuttiGliOrdini():?array
     {
        $stmt =$this->pdo->prepare(self::API_TOT_QUERY);
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }
    
     public function visualizzaUnOrdine(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare(self::API_TOT_QUERY . ' WHERE data_e_ora >= CURDATE() AND id_ordine = :id_ordine');
        $stmt->execute(['id_ordine' => $id_ordine]);
        return $stmt->fetchAll() ?:null;
     }
    
     public function visualizzaTuttiGliOrdiniOggi():?array
     {
        $stmt =$this->pdo->prepare(self::API_TOT_QUERY . ' WHERE data_e_ora >= CURDATE()');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaTuttiGliOrdiniDiIeri():?array
     {
        $stmt =$this->pdo->prepare(self::API_TOT_QUERY . ' WHERE data_e_ora < CURDATE()');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaTuttiGliOrdiniStato(int $id_stato):?array
     {
        $stmt =$this->pdo->prepare(self::API_TOT_QUERY . ' WHERE data_e_ora >= CURDATE() AND id_stato = :id_stato');
        $stmt->execute(['id_stato' => $id_stato]);
        return $stmt->fetchAll() ?:null;
     }
     public function visualizzaTuttiGliOrdiniMomento(int $id_momento):?array
     {
        $stmt =$this->pdo->prepare(self::API_TOT_QUERY . ' WHERE data_e_ora >= CURDATE() AND id_momento = :id_momento');
        $stmt->execute(['id_momento' => $id_momento]);
        return $stmt->fetchAll() ?:null;
     }
     public function visualizzaTuttiIMomenti():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM momento_del_servizio ');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaIlMomentoDiUnOrdine(int $id_ordine,int $id_momento):?array
     {
        $stmt =$this->pdo->prepare(self::API_TOT_QUERY . ' WHERE data_e_ora >= CURDATE() AND id_ordine = :id_ordine AND id_momento = :id_momento');
        $stmt->execute([
            'id_momento' => $id_momento,
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaItemDiUnOrdine(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare('SELECT item FROM api_tot WHERE data_e_ora >= CURDATE() AND id_ordine = :id_ordine');
        $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaBevandeDiUnOrdine(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare('SELECT bevande FROM api_tot WHERE data_e_ora >= CURDATE()  AND id_ordine = :id_ordine ');
        $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaOrdiniTavoloAperto(int $id_tavolo, int $id_stato):?array
     {
        $stmt =$this->pdo->prepare(self::API_TOT_QUERY . ' WHERE data_e_ora >= CURDATE() AND id_stato = :id_stato AND id_tavolo = :id_tavolo');
        $stmt->execute([
            'id_tavolo' => $id_tavolo,
            'id_stato' => $id_stato
        ]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaOrdiniTavoloPerModifica(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM dettaglio_ordini_tavoli WHERE id_ordine = :id_ordine');
        $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }
 

     // transazioni per evitare il rollback
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
        
     
                 //INSERIMENTI

    public function relazioneOrdineTavolo(int $id_ordine, array $tavoli):bool{

        
        //la js dovra controllare se in quel giorno il tavolo è disponibile per la ordine
        //prevedo che i tavoli siano un array in modo che posso selezionarlo 1 o più
        //dovrà controllare che l'ora di accesso si superiore alle ordine
        //nel conto dovro solo inviare il valore da ordin, si/no
          // FIX: prepare fuori dal loop (PDO permette riuso dello stesso prepared statement)
        $stmt = $this->pdo->prepare('INSERT INTO ordine_tavolo (id_ordine, id_tavolo) VALUES (:id_ordine, :id_tavolo)');
 
        $righeInserite = 0;
        foreach ($tavoli as $id_tavolo) {
            $stmt->execute([
                'id_ordine' => $id_ordine,
                'id_tavolo' => $id_tavolo
            ]);
            $righeInserite += $stmt->rowCount();
        }
        // FIX: true solo se TUTTI i tavoli sono stati inseriti correttamente
        return $righeInserite === count($tavoli);
    }

 
    public function relazioneOrdineStato(int $id_ordine, int $id_stato):bool{

        $stmt = $this->pdo->prepare('INSERT INTO  stato_ordine (id_ordine, id_stato) VALUES (:id_ordine, :id_stato)');
        $stmt->execute([
            'id_ordine'=>$id_ordine,
            'id_stato'=>$id_stato
        ]);
        return $stmt->rowCount()>0;
     }


     public function inserisciOrdine(int $numero_persone):int{

        $stmt = $this->pdo->prepare('INSERT INTO  ordine (numero_persone) VALUES (:numero_persone)');
        $stmt->execute([
            'numero_persone'=>$numero_persone
        ]);
        return $id_ordine = (int)$this->pdo->lastInsertId();
     }

     

     public function inserisciRelazioneOrdineItem(int $id_ordine, int $id_item, int $id_momento, int $quantita): bool
     {
        $stmt = $this->pdo->prepare('INSERT INTO relazione_ordine_item (id_ordine, id_item, id_momento, quantita) VALUES (:id_ordine, :id_item, :id_momento, :quantita)');
        $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_item' => $id_item,
            'id_momento' => $id_momento,
            'quantita' => $quantita,
        ]);
        return $stmt->rowCount() > 0;
     }




  

     //DELETE

     
//domani prevedere elimina la relazione in base id_ordine e poi elimina le relazioni e ordine, inserendole in un file storico in base al giorno s eè passato
//delete di supporto per le relazioni
     public function eliminaRelazioneOrdineTavolo(int $id_ordine):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM ordine_tavolo WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
         
     }
     

     public function eliminaOrdine(int $id_ordine):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM ordine WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        
     }

     public function eliminaRelazioneOrdineItemPerOrdine(int $id_ordine): bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM relazione_ordine_item WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
     }

    
     //elimana la relazione quando voglio cancellare l'ordine (per esempio se è sbagliato)
     public function eliminaRelazioneOrdineStato(int $id_ordine):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM stato_ordine WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        
     }

     public function eliminaRelazioneOrdineItemPerMomento(int $id_momento): bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM relazione_ordine_item WHERE id_momento = :id_momento');
        return $stmt->execute([
            'id_momento' => $id_momento
        ]);
     }

     public function eliminaRelazioneOrdineItemPerItem(int $id_item): bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM relazione_ordine_item WHERE id_item = :id_item');
        return $stmt->execute([
            'id_item' => $id_item
        ]);
     }

 
   
     //UPDATE
     //nel service deve inviare anche il conto allo scontrino e chiudersi, poi automaticamnete gli ordini di "ieri" saranno cancellati e inseriti nello storico
     public function aggiornaRelazioneOrdineStato(int $id_ordine, int $id_stato):bool
     {
        $stmt = $this->pdo->prepare('UPDATE stato_ordine SET id_stato = :id_stato WHERE id_ordine = :id_ordine');
        $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_stato' => $id_stato
        ]);
        return $stmt->rowCount()>0;
     }
     
     
     //2.aggiorna la Ordine
    public function aggiornaOrdine(int $id_ordine, int $numero_persone): bool
      {
         $stmt = $this->pdo->prepare('UPDATE ordine SET  numero_persone = :numero_persone WHERE id_ordine = :id_ordine');
         $stmt->execute([
            'id_ordine' => $id_ordine,
            'numero_persone'=>$numero_persone
         ]);
         return $stmt->rowCount()>0;
      }

   public function aggiornaTavoloOrdine(int $id_ordine, array $tavoli): bool
   {
      // niente beginTransaction/commit qui dentro -> la transazione
      // viene gestita un livello più in alto, nel Service, perché lì
      // viene chiamata insieme ad aggiornaOrdine() e devono essere atomiche insieme
      $this->eliminaRelazioneOrdineTavolo($id_ordine);
      $esito = $this->relazioneOrdioneTavolo($id_ordine, $tavoli);

      if (!$esito) {
         // lancia eccezione invece di tornare false ->
         // così il catch nel Service intercetta e fa rollBack() su TUTTO
         throw new \RuntimeException("Aggiornamento tavoli fallito per ordine {$id_ordine}");
      }

      return true;
   }
     
// PATCH  Ordini

    public function aggiornaMomentoRelazioneOrdineItem(int $id_ordine, int $id_item, int $id_momento): bool
    {
        $stmt = $this->pdo->prepare('UPDATE relazione_ordine_item SET id_momento = :id_momento WHERE id_ordine = :id_ordine AND id_item = :id_item');
        $stmt->execute([
            'id_item' => $id_item,
            'id_momento' => $id_momento,
            'id_ordine' => $id_ordine
        ]);
        return $stmt->rowCount() > 0;
    }


    public function aggiornaMomentoRelazioneOrdineItemByMomento(int $id_ordine, int $id_momento_vecchio, int $id_momento_nuovo): bool
    {
        $stmt = $this->pdo->prepare('UPDATE relazione_ordine_item SET id_momento = :id_momento_nuovo WHERE id_ordine = :id_ordine AND id_momento = :id_momento_vecchio');
        $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_momento_vecchio' => $id_momento_vecchio,
            'id_momento_nuovo' => $id_momento_nuovo
        ]);
        return $stmt->rowCount() > 0;
    }
        
    

    public function aggiornaQuantitaRelazioneOrdineItem(int $id_item, int $quantita): bool
    {
        $stmt = $this->pdo->prepare('UPDATE relazione_ordine_item SET quantita = :quantita WHERE id_item = :id_item');
        $stmt->execute([
            'id_item' => $id_item,
            'quantita' => $quantita
        ]);
        return $stmt->rowCount() > 0;
    }

        

}

/* 

 Chiudere un ordine

Io farei proprio una funzione dedicata.


*/