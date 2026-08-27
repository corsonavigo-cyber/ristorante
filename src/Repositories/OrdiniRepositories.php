<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
use App\Enums\Stato;
use App\Enums\Tipo;
use App\Enums\Momento;
#creo una nuova classe OrdiniRepositories che gestisce gli ordini nel database
class OrdiniRepositories extends BaseRepositories {

     private const API_TOT_BASE_QUERY = "SELECT 
    ordine.id_ordine,
    ordine.data_e_ora,
    ordine.numero_persone,
    GROUP_CONCAT(DISTINCT ordine_tavolo.id_tavolo ORDER BY ordine_tavolo.id_tavolo SEPARATOR ', ') AS id_tavoli,
    GROUP_CONCAT(DISTINCT tavolo.numero_tavolo ORDER BY tavolo.numero_tavolo SEPARATOR ', ') AS numeri_tavoli,
    relazione_ordine_item.id_comanda_dettaglio,
    relazione_ordine_item.id_item,
    relazione_ordine_item.id_momento,
    momento_del_servizio.nome_momento,
    relazione_ordine_item.quantita,
    relazione_ordine_item.note,
    item_menu.tipo,
    item_menu.categoria,
    item_menu.in_menu,
    item_menu.nome,
    item_menu.prezzo,
    item_menu.descrizione,
    item_menu.id_iva,
    allergeni_item.lista_allergeni,
    relazione_stato_ordine.id_stato,
    stato_conto.nome_stato
FROM ordine
LEFT JOIN ordine_tavolo 
    ON ordine_tavolo.id_ordine = ordine.id_ordine
LEFT JOIN tavolo 
    ON tavolo.id_tavolo = ordine_tavolo.id_tavolo
LEFT JOIN relazione_ordine_item 
    ON relazione_ordine_item.id_ordine = ordine.id_ordine
LEFT JOIN item_menu 
    ON item_menu.id_item = relazione_ordine_item.id_item
LEFT JOIN momento_del_servizio
    ON momento_del_servizio.id_momento = relazione_ordine_item.id_momento
LEFT JOIN (
    -- pre-aggregazione: un allergene concat per id_item, evita di moltiplicare le righe dell'ordine
    SELECT 
        relazione_allergeni_item.id_item,
        GROUP_CONCAT(DISTINCT allergene.nome_allergene ORDER BY allergene.nome_allergene SEPARATOR ', ') AS lista_allergeni
    FROM relazione_allergeni_item
    JOIN allergene ON allergene.id_allergene = relazione_allergeni_item.id_allergene
    GROUP BY relazione_allergeni_item.id_item
) AS allergeni_item 
    ON allergeni_item.id_item = item_menu.id_item
LEFT JOIN relazione_stato_ordine 
    ON relazione_stato_ordine.id_ordine = ordine.id_ordine
LEFT JOIN stato_conto 
    ON stato_conto.id_stato = relazione_stato_ordine.id_stato";

     private const API_TOT_GROUP_ORDER = "
GROUP BY 
    ordine.id_ordine,
    relazione_ordine_item.id_comanda_dettaglio,
    item_menu.id_item,
    relazione_ordine_item.id_momento,
    momento_del_servizio.nome_momento,
    stato_conto.nome_stato
    
ORDER BY 
    ordine.id_ordine,
    relazione_ordine_item.id_momento,
    momento_del_servizio.nome_momento,
    item_menu.tipo";

    private function buildOrdiniQuery(string $filter = '', ?int $limit = null): string
    {
        $query = self::API_TOT_BASE_QUERY . ($filter ? " WHERE " . $filter : '') . self::API_TOT_GROUP_ORDER;

        if ($limit !== null) {
            $query .= " LIMIT {$limit}";
        }

        return $query;
    }

   
     //ordin COLLEGATE E NON AI TAVOLI
     public function visualizzaTuttiGliOrdini():?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery());
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }
    
     public function visualizzaUnOrdine(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery('ordine.id_ordine = :id_ordine'));
        $stmt->execute(['id_ordine' => $id_ordine]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaOrdiniTavoloStato(int $id_tavolo, int $id_stato):?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery(
            'ordine.data_e_ora >= CURDATE() AND ordine.data_e_ora < CURDATE() + INTERVAL 1 DAY AND ordine_tavolo.id_tavolo = :id_tavolo AND relazione_stato_ordine.id_stato = :id_stato',
            1
        ));
        $stmt->execute([
            'id_tavolo' => $id_tavolo,
            'id_stato' => $id_stato]);
        return $stmt->fetchAll() ?:null;
     }
    
     public function visualizzaTuttiGliOrdiniOggi():?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery('DATE(ordine.data_e_ora) = CURDATE()'));
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaTuttiGliOrdiniDiIeri():?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery('DATE(ordine.data_e_ora) = CURDATE()'));
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaTuttiGliOrdiniStato(int $id_stato):?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery('DATE(ordine.data_e_ora) = CURDATE() AND relazione_stato_ordine.id_stato = :id_stato'));
        $stmt->execute(['id_stato' => $id_stato]);
        return $stmt->fetchAll() ?:null;
     }
     public function visualizzaTuttiGliOrdiniMomento(int $id_momento):?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery('DATE(ordine.data_e_ora) = CURDATE() AND relazione_stato_ordine.id_stato = 1 AND relazione_ordine_item.id_momento = :id_momento'));
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
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery('DATE(ordine.data_e_ora) = CURDATE() AND ordine.id_ordine = :id_ordine AND relazione_ordine_item.id_momento = :id_momento'));
        $stmt->execute([
            'id_momento' => $id_momento,
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaTipoItemDiUnOrdine(int $id_ordine, Tipo $tipo):?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery('DATE(ordine.data_e_ora) = CURDATE() AND ordine.id_ordine = :id_ordine AND item_menu.tipo = :tipo'));
        $stmt->execute([
            'id_ordine' => $id_ordine,
            'tipo' => $tipo->value
        ]);
        return $stmt->fetchAll() ?: [];
     }



    

     public function visualizzaOrdiniTavoloPerModifica(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare($this->buildOrdiniQuery('ordine.id_ordine = :id_ordine'));
        $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }
 

     
                 //INSERIMENTI

public function relazioneOrdineTavolo(int $id_ordine, array $tavoli): bool
    {
        if (count($tavoli) === 0) {
            return false;
        }

        $commitHere = false;
        if (!$this->inTransaction()) {
            $this->iniziaTransazione();
            $commitHere = true;
        }

        $stmt = $this->pdo->prepare('INSERT INTO ordine_tavolo (id_ordine, id_tavolo) VALUES (:id_ordine, :id_tavolo)');
        $righeInserite = 0;

        try {
            foreach ($tavoli as $id_tavolo) {
                $stmt->execute([
                    'id_ordine' => $id_ordine,
                    'id_tavolo' => $id_tavolo
                ]);
                $righeInserite += $stmt->rowCount();
            }

            if ($righeInserite !== count($tavoli)) {
                throw new \RuntimeException('Inserimento tavoli ordine incompleto');
            }

            if ($commitHere) {
                $this->confermaTransazione();
            }

            return true;
        } catch (\Throwable $e) {
            if ($commitHere && $this->inTransaction()) {
                $this->annullaTransazione();
            }
            throw $e;
        }
    }

 
    public function relazioneOrdineStato(int $id_ordine, int $id_stato):bool{

        $stmt = $this->pdo->prepare('INSERT INTO  relazione_stato_ordine (id_ordine, id_stato) VALUES (:id_ordine, :id_stato)');
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

     

     public function inserisciRelazioneOrdineItem(int $id_ordine, array $voci): array
     {
        if(count($voci)===0){
            return [];
        }

        $commitHere=false;
        if(!$this->inTransaction()){
            $this->iniziaTransazione();
            $commitHere = true;
        }

        $stmt = $this->pdo->prepare('INSERT INTO relazione_ordine_item (id_ordine, id_item, id_momento, quantita, note) VALUES (:id_ordine, :id_item, :id_momento, :quantita, :note)');
        $righeInserite = 0;
        $idsInseriti = [];

        try{
            foreach ($voci as $voce){
        
            $stmt->execute([
                'id_ordine'  => $id_ordine,
                'id_item'    => $voce['id_item'],
                'id_momento' => $voce['id_momento'],
                'quantita'   => $voce['quantita'],
                'note'       => $voce['note'] ?? null,
                 ]);
                $righeInserite += $stmt->rowCount();
                $idsInseriti[] = (int) $this->pdo->lastInsertId();
            }
            if ($righeInserite !== count($voci)) {
                 throw new \RuntimeException('Inserimento comanda incompleto');
            }

            if ($commitHere) {
                $this->confermaTransazione();
            }

            return $idsInseriti;
        } catch (\Throwable $e) {
            if ($commitHere && $this->inTransaction()) {
                $this->annullaTransazione();
            }
            throw $e;
        }
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
        $stmt = $this->pdo->prepare('DELETE FROM relazione_stato_ordine WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        
     }

     public function eliminaRelazioneOrdinePerMomento(int $id_ordine, int $id_momento): bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM relazione_ordine_item WHERE id_momento = :id_momento AND id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_momento' => $id_momento
        ]);
     }

     public function eliminaRelazioneOrdineDiUnoSpecificoItem(int $id_ordine,int $id_comanda_dettaglio, int $id_momento): bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM relazione_ordine_item WHERE id_ordine = :id_ordine AND id_momento = :id_momento AND id_comanda_dettaglio = :id_comanda_dettaglio');
        return $stmt->execute([
            'id_momento' => $id_momento,
            'id_ordine' => $id_ordine,
            'id_comanda_dettaglio' => $id_comanda_dettaglio
        ]);
     }

 
   
     //UPDATE
     //nel service deve inviare anche il conto allo scontrino e chiudersi, poi automaticamnete gli ordini di "ieri" saranno cancellati e inseriti nello storico
     public function aggiornaRelazioneOrdineStato(int $id_ordine, int $id_stato):bool
     {
        $stmt = $this->pdo->prepare('UPDATE relazione_stato_ordine SET id_stato = :id_stato WHERE id_ordine = :id_ordine');
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
      $esito = $this->relazioneOrdineTavolo($id_ordine, $tavoli);

      if (!$esito) {
         // lancia eccezione invece di tornare false ->
         // così il catch nel Service intercetta e fa rollBack() su TUTTO
         throw new \RuntimeException("Aggiornamento tavoli fallito per ordine {$id_ordine}");
      }

      return true;
   }
     
// PATCH  Ordini

    public function aggiornaMomentoRelazioneOrdineItem(int $id_ordine, int $id_comanda_dettaglio, int $id_momento): bool
    {
        $stmt = $this->pdo->prepare('UPDATE relazione_ordine_item SET id_momento = :id_momento WHERE id_ordine = :id_ordine AND id_comanda_dettaglio = :id_comanda_dettaglio');
        $stmt->execute([
            'id_comanda_dettaglio' => $id_comanda_dettaglio,
            'id_momento' => $id_momento,
            'id_ordine' => $id_ordine
        ]);
        return $stmt->rowCount() > 0;
    }


    public function aggiornaMomentoRelazioneOrdineMomento(int $id_ordine, int $id_momento_vecchio, int $id_momento_nuovo): bool
    {
        $stmt = $this->pdo->prepare('UPDATE relazione_ordine_item SET id_momento = :id_momento_nuovo WHERE id_ordine = :id_ordine AND id_momento = :id_momento_vecchio');
        $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_momento_vecchio' => $id_momento_vecchio,
            'id_momento_nuovo' => $id_momento_nuovo
        ]);
        return $stmt->rowCount() > 0;
    }
        
    

    public function aggiornaQuantitaRelazioneOrdineItem(int $id_ordine, int $id_comanda_dettaglio, int $id_momento, int $quantita): bool
    {
        $stmt = $this->pdo->prepare('UPDATE relazione_ordine_item SET quantita = :quantita WHERE id_ordine = :id_ordine AND id_comanda_dettaglio = :id_comanda_dettaglio AND id_momento = :id_momento');
        $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_comanda_dettaglio' => $id_comanda_dettaglio,
            'id_momento' => $id_momento,
            'quantita' => $quantita
        ]);
        return $stmt->rowCount() > 0;
    }

        

}

/* 

 Chiudere un ordine

Io farei proprio una funzione dedicata.


*/