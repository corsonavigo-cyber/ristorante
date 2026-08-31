<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\OrdiniRepositories;
use App\Enums\Tipo;

class OrdiniService {
    public function __construct(private OrdiniRepositories $ordiniRepo, private LoggerService $logger, private StoricoOrdiniService $storicoordini){} 

//------------------------------LETTURA---------------------------------------

    public function visualizzaTuttiGliOrdini(): array {
        try {
            return $this->ordiniRepo->visualizzaTuttiGliOrdini() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero Ordini: {$e->getMessage()}");
            return []; 
        }
    }
    //visualizza Ordini sul tavolo
    public function visualizzaOrdiniTavoloStato( int $id_tavolo, int $id_stato): array {
        try {
            return $this->ordiniRepo->visualizzaOrdiniTavoloStato($id_tavolo,$id_stato) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero ordini del tavolo: {$e->getMessage()}");
            return []; 
        }
    }

     //visualizza ordini
    public function visualizzaUnOrdine(int $id_ordine): array {
        try {
            return $this->ordiniRepo->visualizzaUnOrdine($id_ordine) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero ordine: {$e->getMessage()}");
            return []; 
        }
    }

    //visualizza ordini da oggi 
    public function visualizzaTuttiGliOrdiniOggi(): array {
        try {
            return $this->ordiniRepo->visualizzaTuttiGliOrdiniOggi() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero ordini oggi: {$e->getMessage()}");
            return []; 
        }
    }

     //visualizza ordini vecchi 
    public function visualizzaTuttiGliOrdiniDiIeri() : array {
        try {
            return $this->ordiniRepo->visualizzaTuttiGliOrdiniDiIeri()  ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero ordini oggi: {$e->getMessage()}");
            return []; 
        }
    }

    //visualizzaOrdiniPerModifica

     public function visualizzaOrdiniTavoloPerModifica(int $id_ordine): array {
        try {
            return $this->ordiniRepo->visualizzaOrdiniTavoloPerModifica($id_ordine) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero ordine per modifica: {$e->getMessage()}");
            return []; 
        }
    }


    public function visualizzaTuttiGliOrdiniStato(int $id_stato): array {
        try {
            return $this->ordiniRepo->visualizzaTuttiGliOrdiniStato($id_stato) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero ordini stato: {$e->getMessage()}");
            return []; 
        }
    }

    public function visualizzaTuttiGliOrdiniMomento(int $id_momento): array {
        try {
            return $this->ordiniRepo->visualizzaTuttiGliOrdiniMomento($id_momento) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero ordini: {$e->getMessage()}");
            return []; 
        }
    }

    public function visualizzaTuttiIMomenti(): array {
        try {
            return $this->ordiniRepo->visualizzaTuttiIMomenti() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero  momenti: {$e->getMessage()}");
            return []; 
        }
    }
    
    public function visualizzaIlMomentoDiUnOrdine(int $id_ordine, int $id_momento): array {
        try {
            return $this->ordiniRepo->visualizzaIlMomentoDiUnOrdine($id_ordine, $id_momento) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero ordine nel momento: {$e->getMessage()}");
            return []; 
        }
    }
    public function visualizzaTipoItemDiUnOrdine(int $id_ordine, Tipo $tipo): array {
        try {
            return $this->ordiniRepo->visualizzaTipoItemDiUnOrdine($id_ordine, $tipo) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero bevanda nel momento: {$e->getMessage()}");
            return []; 
        }
    }

    

    private function isDataValida(string $data): bool
    {
        $d = \DateTime::createFromFormat('Y-m-d', $data);
        if (!$d || $d->format('Y-m-d') !== $data) {
            return false;
        }

        $oggi = new \DateTime('today');

        // FIX: limite massimo di ordine a 1 anno da oggi
        $limiteMax = (clone $oggi)->modify('+1 year');

        return $d >= $oggi && $d <= $limiteMax;
    }

    // FIX: nuovo metodo che lancia eccezione, da usare quando il dato DEVE essere valido
    private function validaData(string $data): void
    {
        if (!$this->isDataValida($data)) {
            throw new \InvalidArgumentException("Formato data non valido: $data (atteso Y-m-d)");
        }
    }

 //--------------------------------------INSERIMENTI--------------------------------------

  
    //inserire la ordine, nel js non dovrà andare da sola ma con il controllo
    public function relazioneOrdineStato(int $id_ordine, int $id_stato): ?bool{

        #salto l'autorizzazione in base al ruolo
       try {
             $this->ordiniRepo->relazioneOrdineStato($id_ordine,$id_stato);
             $this->logger->info("Ordine associato correttamente id_ordine {$id_ordine} con lo stao {$id_stato}: inserito con successo");
             return true;
             
        }catch (\Throwable $e) {
             $this->logger->error("Relazione ordine {$id_ordine} non inserita: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento ordine: {$e->getMessage()}");
        }   
    }

    public function relazioneOrdineTavolo(int $id_ordine, array $tavoli): ?bool{

        #salto l'autorizzazione in base al ruolo
       try {
            $this->ordiniRepo->relazioneOrdineTavolo($id_ordine,$tavoli);
            $tavoliString = is_array($tavoli) ? implode(', ', $tavoli) : $tavoli;

            $this->logger->info("Ordine inserito correttamente id_ordine {$id_ordine} sul tavolo {$tavoliString}: inserito con successo");             return true;
             
        }catch (\Throwable $e) {
             $this->logger->error("Relazione ordine {$id_ordine} non inserita: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento ordine: {$e->getMessage()}");
        }   
    }

    public function inserisciRelazioneOrdineItem(int $id_ordine, array $voci): array
    {
    if (count($voci) === 0) {
        throw new \InvalidArgumentException('La comanda non contiene elementi.'); // → 400
    }

    // validazione minima lato service, coerente con validaCampi() già usato in PrenotazioniService
    foreach ($voci as $i => $voce) {
        if (!isset($voce['id_item'], $voce['id_momento'], $voce['quantita'])) {
            throw new \InvalidArgumentException("Voce comanda #{$i} incompleta."); // → 400
        }
        if ((int) $voce['quantita'] <= 0) {
            throw new \InvalidArgumentException("Quantità non valida alla voce #{$i}."); // → 400
        }
    }

    try {
        $ids = $this->ordiniRepo->inserisciRelazioneOrdineItem($id_ordine, $voci);
        $this->logger->info("Comanda inserita per l'ordine {$id_ordine}: " . count($ids) . " voci");
        return $ids;
    } catch (\Throwable $e) {
        $this->logger->error("Inserimento comanda fallito per l'ordine {$id_ordine}: {$e->getMessage()}");
        throw new \Exception("Errore inserimento ordine-item: {$e->getMessage()}"); 
        }   
    }

    
    //inserimento dell ordine sul tavolo
    public function inserisciOrdine(int $numero_persone):int{

        #salto l'autorizzazione in base al ruolo
       try {

             $id_ordine = $this->ordiniRepo->inserisciOrdine($numero_persone);
             $this->logger->info("Ordine inserito correttamente id_ordine {$id_ordine} sul tavolo: inserito con successo");
             $this->storicoordini->aperto("Ordine inserito correttamente id_ordine {$id_ordine} sul tavolo: inserito con successo");             
             return $id_ordine;

        }catch (\Throwable $e) {
             $this->logger->error("Ordine non inserito id_ordine: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento Ordine : {$e->getMessage()}");
        }
        
   
    }


  
    public function inserisciOrdineDirettamenteNelTavoloStatoEPietanze(int $id_stato, int $id_ordine, array $items, array $tavoli ): array {
        try {
            $this->ordiniRepo->iniziaTransazione();

            $this->ordiniRepo->relazioneOrdineTavolo($id_ordine, $tavoli);
            $this->ordiniRepo->relazioneOrdineStato($id_ordine, $id_stato);
            $relazioni_inserite = [];
            $inserted = 0;
            foreach ($items as $item) {
                $id_relazione = $this->ordiniRepo->inserisciRelazioneOrdineItem(
                    $id_ordine,
                    (int) $item['id_item'],
                    (int) $item['id_momento'],
                    (int) $item['quantita'],
                    $item['note'] ?? null
                );
                $relazioni_inserite[] = $id_relazione;
                $inserted++;
            }

            $this->ordiniRepo->confermaTransazione();

            $tavoliStr = implode(', ', $tavoli);
            $this->logger->info("Ordine inserito correttamente id_ordine {$id_ordine} sul tavolo {$tavoliStr} con stato {$id_stato}");
            $this->storicoordini->aperto("Ordine inserito correttamente id_ordine {$id_ordine} sul tavolo {$tavoliStr}");

            return $relazioni_inserite;
        } catch (\Throwable $e) {
            if ($this->ordiniRepo->inTransaction()) {
                $this->ordiniRepo->annullaTransazione();
            }
            $this->logger->error("Inserimento ordine non riuscito: {$e->getMessage()}");
            throw new \RuntimeException("Errore inserimento ordine: {$e->getMessage()}");
        }
    }


//---------------------------------ELIMINAZIONE-------------------------------------------------------

    public function eliminaRelazioneOrdineTavolo(int $id_ordine):bool
    {
     try {
          $this->ordiniRepo->eliminaRelazioneOrdineTavolo($id_ordine);
          $this->logger->info("Ordine {$id_ordine} : eliminata con successo dal tavolo ");
          $this->storicoordini->cancellato("ordine {$id_ordine} : eliminato con successo dal tavolo");
          return true;
             
     }catch (\Throwable $e) {
             $this->logger->error("Eliminazione ordine {$id_ordine} fallita: {$e->getMessage()}");
             return false;
     }       
    }

    public function eliminaRelazioneOrdineStato(int $id_ordine):bool
    {
     try {
          $this->ordiniRepo->eliminaRelazioneOrdineStato($id_ordine);
          $this->logger->info("Relazione Ordine  {$id_ordine} stato : eliminata con successo dal tavolo ");
          $this->storicoordini->cancellato("Relazione Ordine stato {$id_ordine} : eliminato con successo dal tavolo");
          return true;
             
     }catch (\Throwable $e) {
             $this->logger->error("Eliminazione ordine stato {$id_ordine} fallita: {$e->getMessage()}");
             return false;
     }       
    }

    public function eliminaRelazioneOrdineItemPerOrdine(int $id_ordine):bool
    {
     try {
          $this->ordiniRepo->eliminaRelazioneOrdineItemPerOrdine($id_ordine);
          $this->logger->info("Relazione Ordine  {$id_ordine} Pietanza : eliminata con successo dal tavolo ");
          $this->storicoordini->cancellato("Relazione Ordine Pietanza {$id_ordine} : eliminato con successo dal tavolo");
          return true;
             
     }catch (\Throwable $e) {
             $this->logger->error("Eliminazione ordine Pietanza{$id_ordine} fallita: {$e->getMessage()}");
             return false;
     }       
    }

    

    public function eliminaRelazioneOrdineDiUnoSpecificoItem(int $id_comanda_dettaglio):bool
    {
     try {
          $this->ordiniRepo->eliminaRelazioneOrdineDiUnoSpecificoItem($id_comanda_dettaglio);
         
          $this->logger->info("Relazione  Momento Pietanze SU ITEM: eliminata con successo dal tavolo ");
          $this->storicoordini->cancellato("Relazione Momento stato per Pietanze  IN ITEM: eliminato con successo dal tavolo");
         
          return true;
             
     }catch (\Throwable $e) {

             $this->logger->error("Eliminazione Momento Pietanze  fallita: {$e->getMessage()}");
             return false;
     }       
    }

     public function eliminaRelazioneOrdinePerMomento(int $id_comanda_dettaglio, int $id_momento):bool
    {
     try {
          $this->ordiniRepo->eliminaRelazioneOrdinePerMomento($id_comanda_dettaglio, $id_momento);
         
          $this->logger->info("Relazione  Momento Pietanze{$id_momento} : eliminata con successo dal tavolo ");
          $this->storicoordini->cancellato("Relazione Momento stato per Pietanze {$id_momento} : eliminato con successo dal tavolo");
         
          return true;
             
     }catch (\Throwable $e) {

             $this->logger->error("Eliminazione Momento Pietanze {$id_momento} fallita: {$e->getMessage()}");
             return false;
     }       
    }
    
   
    

    public function eliminaOrdine(int $id_ordine):bool{
       
       $id_ricerca= $this->visualizzaUnOrdine($id_ordine);
       
       if(!$id_ricerca){
            $this->logger->warning("Eliminazione ordine fallita: ordine '{$id_ordine}' non trovata");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->ordiniRepo->eliminaOrdine($id_ordine);
             $this->logger->info("ordine {$id_ordine}: eliminato con successo");
             $this->storicoordini->cancellato("ordine {$id_ordine} : eliminazione effettuata ");

             return true;
             
        }catch (\Throwable $e) {

             $this->logger->error("Eliminazione ordine {$id_ordine} fallita: {$e->getMessage()}");
             return false;
        }  

    }

    //eliminazione composta: cancella le ordini di ieri (+ le loro relazioni con i tavoli)
    public function eliminaOrdiniIeri(): bool
    {
        
        $ieri = (new \DateTime('yesterday'))->format('Y-m-d');

        $ordiniIeri = $this->ordiniRepo->visualizzaTuttiGliOrdiniDiIeri();

        // FIX: niente da cancellare -> non è un errore, esci silenziosamente
        if (!$ordiniIeri) {
            $this->logger->info(" Nessuna Eliminazione ordine multipla ordine ieri non presenti");
            return true;
        }

        try {
            $this->ordiniRepo->iniziaTransazione();

            foreach ($ordiniIeri as $ordineieri) { // FIX: singolo foreach, niente nesting
                $id = $ordineieri['id_ordine'];

                $this->ordiniRepo->eliminaRelazioneOrdineTavolo($id);
                $this->ordiniRepo->eliminaRelazioneOrdineStato($id);
                $this->ordiniRepo->eliminaRelazioneOrdineItemPerOrdine($id);
                
                $this->ordiniRepo->eliminaOrdine($id);

                // log prima che il dato sparisca, altrimenti perdi il contesto
                $this->storicoordini->cancellato(
                    "ordine id {$id} ({$ordineieri['id_ordine']}) del {$ordineieri['data_e_ora']} {$ordineieri['numero_persone']} {$ordineieri['piatti']} {$ordineieri['bevande']} automaticamente (scaduta)"
                );
            }

            $this->ordiniRepo->confermaTransazione();
            $this->logger->info("Pulizia automatica: rimosse " . count($ordiniIeri) . " ordini scadute (prima del {$ieri})");

            return true;
        } catch (\Throwable $e) {
            if ($this->ordiniRepo->inTransaction()) {
               $this->ordiniRepo->annullaTransazione();
            }
            $this->logger->error("Errore durante la pulizia ordini scadute: {$e->getMessage()}");
            return false;
        }
    }

    //eliminazione composta: cancella le ordinil'ordine (+ le sue relazioni con i tavoli,stato,momento,piatti,bevande)
  public function eliminaOrdineComposto(int $id_ordine): bool
    {

        $ordine = $this->ordiniRepo->visualizzaUnOrdine($id_ordine);

        
        if (!$ordine) {
             $this->logger->info(" Nessuna  ordine {$id_ordine} presente");
             return false;
        }

        try {
            $this->ordiniRepo->iniziaTransazione();

            
            $id = $id_ordine;

            $this->ordiniRepo->eliminaRelazioneOrdineTavolo($id);
            $this->ordiniRepo->eliminaRelazioneOrdineStato($id);
            $this->ordiniRepo->eliminaRelazioneOrdineItemPerOrdine($id);
            

            $this->ordiniRepo->eliminaOrdine($id);

            // log prima che il dato sparisca, altrimenti perdi il contesto
            $this->storicoordini->cancellato(
                "ordine id {$id} ( del {$ordine[0]['data_e_ora']} id tavolo {$ordine[0]['id_tavolo']} piatti {$ordine[0]['piatti']} bevande {$ordine[0]['bevande']} )"
            );
            

            $this->ordiniRepo->confermaTransazione();
            $this->logger->info("Cancellato: rimosso  ordine id {$id}   ");

            return true;
        } catch (\Throwable $e) {
            if ($this->ordiniRepo->inTransaction()) {
               $this->ordiniRepo->annullaTransazione();
               
            }
            $this->logger->error("Errore durante l'eliminazione dell' ordine: {$e->getMessage()}");
            return false;
        }
    }
//-------------------------------------PATCH---------------------------------------------------------
    public function aggiornaOrdine(int $id_ordine,int $numero_persone):bool{
       
       $id_ricerca= $this->visualizzaUnOrdine($id_ordine);
       
       if(!$id_ricerca){
            $this->logger->warning("Modifica ordine fallita: ordine '{$id_ordine}' non trovato");
            return false;
        }

       try {
             $this->ordiniRepo->aggiornaOrdine($id_ordine, $numero_persone);
             $this->logger->info("ordine id {$id_ordine} : aggiornata con successo");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("ordine id {$id_ordine} non aggiornata: {$e->getMessage()}");
             return false;
        }

    }

    public function aggiornaTavoloOrdine(int $id_ordine,array $tavoli):bool{
       
       try {
             $this->ordiniRepo->aggiornaTavoloOrdine($id_ordine,$tavoli);
             $tavoliStr = implode(', ', $tavoli);
             $this->logger->info("ordine id {$id_ordine} : aggiornata con successo sul/i tavoli {$tavoliStr} ");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("ordine id {$id_ordine} non aggiornata: {$e->getMessage()}");
             return false;
        }

    }

    public function aggiornaRelazioneOrdineStato(int $id_ordine,int $id_stato):bool{
       
       try {
             $this->ordiniRepo->aggiornaRelazioneOrdineStato($id_ordine,$id_stato);
             
             $this->logger->info("ordine id {$id_ordine} : aggiornata con successo sul/i tavoli {$id_stato} ");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("ordine id {$id_ordine} non aggiornata: {$e->getMessage()}");
             return false;
        }

    }

    public function aggiornaMomentoRelazioneOrdineItem(int $id_ordine, int $id_comanda_dettaglio, int $id_momento):bool{
       
       try {
             $this->ordiniRepo->aggiornaMomentoRelazioneOrdineItem($id_ordine,$id_comanda_dettaglio, $id_momento);
             
             $this->logger->info("bevanda id {$id_comanda_dettaglio} : aggiornata con successo sul/i momento {$id_momento} ");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("bevanda id {$id_comanda_dettaglio} non aggiornata: {$e->getMessage()}");
             return false;
        }

    }

    
    public function aggiornaMomentoRelazioneOrdineMomento(int $id_ordine, int $id_momento_vecchio, int $id_momento_nuovo):bool{
       
       try {
             $this->ordiniRepo->aggiornaMomentoRelazioneOrdineMomento($id_ordine, $id_momento_vecchio, $id_momento_nuovo);
             
             $this->logger->info("momento id { $id_momento_vecchio} : aggiornata con successo sul/i momento {$id_momento_nuovo} ");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("momento id {$id_momento_vecchio} non aggiornata: {$e->getMessage()}");
             return false;
        }

    }

    

    public function aggiornaQuantitaRelazioneOrdineItem(int $id_ordine, int $id_comanda_dettaglio, int $id_momento, int $quantita, string $note):bool{
       
       try {
             $this->ordiniRepo->aggiornaQuantitaRelazioneOrdineItem($id_ordine, $id_comanda_dettaglio, $id_momento, $quantita, $note);
             
             $this->logger->info("bevanda id {$id_comanda_dettaglio} : aggiornata con successo sul/i quantita {$quantita} ");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("bevanda id {$id_comanda_dettaglio} non anata: {$e->getMessage()}");
             return false;
        }

    }

    public function chiudiOrdine(int $id_ordine, float $totale, array $dettagli): int
{
    $this->pdo->beginTransaction();
    try {
        $id_scontrino = $this->scontrinoRepo->nuovoScontrino($id_ordine, $totale, $dettagli);
        $this->ordiniRepo->aggiornaRelazioneOrdineStato($id_ordine, 2);
        $this->pdo->commit();
        return $id_scontrino;
    } catch (\Throwable $e) {
        $this->pdo->rollBack();
        throw $e;
    }
}

   

}