<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\PrenotazioniRepositories;

class PrenotazioniService {
    public function __construct(private PrenotazioniRepositories $prenotazioniRepo, private LoggerService $logger, private StoricoPrenotazioniService $storicoPrenotazioni){} 

//------------------------------LETTURA---------------------------------------

    public function visualizzaPrenotazioni(): array {
        try {
            return $this->prenotazioniRepo->visualizzaPrenotazioni() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero prenotazioni: {$e->getMessage()}");
            return []; 
        }
    }
    //visualizza prenotazioni sul tavolo
    public function visualizzaPrenotazioniTavolo(int $id_tavolo): array {
        try {
            return $this->prenotazioniRepo->visualizzaPrenotazioniTavolo($id_tavolo) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero prenotazioni del tavolo: {$e->getMessage()}");
            return []; 
        }
    }

     //visualizza Prenotazioni
    public function visualizzaPrenotazione(int $id_prenotazione): array {
        try {
            return $this->prenotazioniRepo->visualizzaPrenotazione($id_prenotazione) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero prenotazione: {$e->getMessage()}");
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

        // FIX: limite massimo di prenotazione a 1 anno da oggi
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


    public function visualizzaPrenotazioniData(string $data_in_prenotazione): array {

        if (!$this-> isDataValida($data_in_prenotazione)) {
        $this->logger->warning("Formato data non valido: $data_in_prenotazione");
        return [];
    }
        try {
            return $this->prenotazioniRepo->visualizzaPrenotazioniData($data_in_prenotazione) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero delle prenotazioni per il giorno $data_in_prenotazione: {$e->getMessage()}");
            return []; 
        }
    }
 //--------------------------------------INSERIMENTI--------------------------------------

    //supporto per l'inserimento
    public function isTavoloDisponibile(int $id_tavolo, string $data_in_prenotazione): bool {
        try {
            return $this->prenotazioniRepo->isTavoloDisponibile($id_tavolo, $data_in_prenotazione);
        } catch (\Throwable $e) {
            $this->logger->error("Errore impossibile verificare disponibilità del tavolo: {$e->getMessage()}");
            return false; 
        }
    }
    //inserire la prenotazione, nel js non dovrà andare da sola ma con il controllo
    public function inserisciPrenotazione(string $nome_prenotazione, string $ora_prenotazione, string $data_in_prenotazione, int $attiva, int $numero_persone): ?int{

        #salto l'autorizzazione in base al ruolo
       try {
             $id_prenotazione = $this->prenotazioniRepo->inserisciPrenotazione($nome_prenotazione, $ora_prenotazione, $data_in_prenotazione, $attiva, $numero_persone);
             $this->logger->info("Prenotazione inserita correttamente id_prenotazione {$id_prenotazione} sul tavolo: inserito con successo");
             $this->storicoPrenotazioni->inserita("Prenotazione inserita correttamente id_prenotazione {$id_prenotazione} sul tavolo: inserito con successo");
             return $id_prenotazione;
             
        }catch (\Throwable $e) {
             $this->logger->error("Relazione Prenotazione {$id_prenotazione} non inserita: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento Prenotazione: {$e->getMessage()}");
        }   
    }

    //inserimento della prenotazione sul tavolo
    public function inserisciPrenotazioneTavolo(int $id_prenotazione, array $tavoli):bool{

        #salto l'autorizzazione in base al ruolo
       try {

             $this->prenotazioniRepo->inserisciPrenotazioneTavolo($id_prenotazione, $tavoli);
             $this->logger->info("Relazione Prenotazione inserita correttamente id_prenotazione {$id_prenotazione} sul tavolo: inserito con successo");
             $this->storicoPrenotazioni->inserita("Relazione Prenotazione inserita correttamente id_prenotazione {$id_prenotazione} sul tavolo: inserito con successo");
             return true;
             
        }catch (\Throwable $e) {
             $this->logger->error("Relazione Prenotazione {$id_prenotazione} non inserita: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento Relazione Prenotazione : {$e->getMessage()}");
        }
        
   
    }


    //inserimento composto

    public function inserisciPrenotazioneDirettamenteNelTavolo(string $nome_prenotazione, string $ora_prenotazione, string $data_in_prenotazione, int $attiva, int $numero_persone, array $tavoli):bool{

        #salto l'autorizzazione in base al ruolo
        if (!$this->isDataValida($data_in_prenotazione)) {
                $this->logger->warning("Inserimento prenotazione fallito: data non valida '{$data_in_prenotazione}'");
                return false;
            }

        #salto l'autorizzazione in base al ruolo

        try {
            $this->prenotazioniRepo->iniziaTransazione();

            // FIX: cattura l'id appena creato, ti serve per il secondo insert
            $id_prenotazione = $this->prenotazioniRepo->inserisciPrenotazione($nome_prenotazione, $ora_prenotazione, $data_in_prenotazione, $attiva, $numero_persone );

            $this->prenotazioniRepo->inserisciPrenotazioneTavolo($id_prenotazione, $tavoli);

            $this->prenotazioniRepo->confermaTransazione();

            // FIX: implode per trasformare l'array in stringa leggibile nel log
            $tavoliStr = implode(', ', $tavoli);

            $this->logger->info("Prenotazione inserita correttamente id_prenotazione {$id_prenotazione} sul tavolo {$tavoliStr}");
            $this->storicoPrenotazioni->effettuata("Prenotazione inserita correttamente id_prenotazione {$id_prenotazione} sul tavolo {$tavoliStr}");

            return true;
        } catch (\Throwable $e) {
            $this->prenotazioniRepo->annullaTransazione();
            $this->logger->error("Inserimento prenotazione non riuscito: {$e->getMessage()}");
            throw new \RuntimeException("Errore inserimento Prenotazione: {$e->getMessage()}");
        }

    }

//---------------------------------ELIMINAZIONE-------------------------------------------------------

    public function eliminaRelazionePrenotazioneTavolo(int $id_prenotazione):bool
    {
     try {
          $this->prenotazioniRepo->eliminaRelazionePrenotazioneTavolo($id_prenotazione);
          $this->logger->info("prenotazione {$id_prenotazione} : eliminata con successo dal tavolo ");
          $this->storicoPrenotazioni->cancellata("Prenotazione {$id_prenotazione} : eliminata con successo dal tavolo");
          return true;
             
     }catch (\Throwable $e) {
             $this->logger->error("Eliminazione prenotazione {$id_prenotazione} fallita: {$e->getMessage()}");
             return false;
     }       
    }

    public function eliminaPrenotazione(int $id_prenotazione):bool{
       
       $id_ricerca= $this->visualizzaPrenotazione($id_prenotazione);
       
       if(!$id_ricerca){
            $this->logger->warning("Eliminazione prenotazione fallita: prenotazione '{$id_prenotazione}' non trovata");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->prenotazioniRepo->eliminaPrenotazione($id_prenotazione);
              $this->logger->info("Prenotazione {$id_prenotazione}: eliminata con successo");
             return true;
             
        }catch (\Throwable $e) {
             $this->logger->error("Eliminazione Prenotazione {$id_prenotazione} fallita: {$e->getMessage()}");
             $this->storicoPrenotazioni->cancellata("Prenotazione {$id_prenotazione} : eliminazione fallita");
             return false;
        }  
    }

    //eliminazione composta: cancella le prenotazioni di ieri (+ le loro relazioni con i tavoli)
    public function eliminaPrenotazioniIeri(): bool
    {
        
        $ieri = (new \DateTime('yesterday'))->format('Y-m-d');

        $prenotazioniIeri = $this->prenotazioniRepo->visualizzaPrenotazioniPrimaDi($ieri);

        // FIX: niente da cancellare -> non è un errore, esci silenziosamente
        if (!$prenotazioniIeri) {
            return $this->logger->info(" Nessuna Eliminazione Prenotazione multipla prenotazione ieri non presenti");
        }

        try {
            $this->prenotazioniRepo->iniziaTransazione();

            foreach ($prenotazioniIeri as $prenotazioneieri) { // FIX: singolo foreach, niente nesting
                $id = $prenotazioneieri['id_prenotazione'];

                $this->prenotazioniRepo->eliminaRelazionePrenotazioneTavolo($id);
                $this->prenotazioniRepo->eliminaPrenotazione($id);

                // log prima che il dato sparisca, altrimenti perdi il contesto
                $this->storicoPrenotazioni->cancellata(
                    "Prenotazione id {$id} ({$prenotazioneieri['nome_prenotazione']}) del {$prenotazioneieri['data_in_prenotazione']} rimossa automaticamente (scaduta)"
                );
            }

            $this->prenotazioniRepo->confermaTransazione();
            $this->logger->info("Pulizia automatica: rimosse " . count($prenotazioniIeri) . " prenotazioni scadute (prima del {$oggi})");

            return true;
        } catch (\Throwable $e) {
            if ($this->prenotazioniRepo->inTransaction()) {
               $this->prenotazioniRepo->annullaTransazione();
            }
            $this->logger->error("Errore durante la pulizia prenotazioni scadute: {$e->getMessage()}");
            return false;
        }
    }

    //eliminazione composta: cancella le prenotazioni (+ le loro relazioni con i tavoli)
    public function eliminaPrenotazioniERelazioneTavolo(int $id_prenotazione): bool
    {
        $prenotazione = $this->prenotazioniRepo->visualizzaPrenotazione($id_prenotazione);

        // FIX: niente da cancellare -> non è un errore, esci silenziosamente
        if (!$prenotazione) {
            $this->logger->warning("Eliminazione prenotazione fallita: prenotazione '{$id_prenotazione}' non trovata");
            return false;
        }

        try {
            $this->prenotazioniRepo->iniziaTransazione();

            $this->prenotazioniRepo->eliminaRelazionePrenotazioneTavolo($id_prenotazione);
            $this->prenotazioniRepo->eliminaPrenotazione($id_prenotazione);

            // log PRIMA che il dato sparisca dal DB, altrimenti perdi il contesto
            $this->storicoPrenotazioni->cancellata(
                "Prenotazione id {$id_prenotazione} ({$prenotazione['nome_prenotazione']}) rimossa"
            );

            $this->prenotazioniRepo->confermaTransazione();

            $this->logger->info("Prenotazione {$id_prenotazione} rimossa con relazione tavolo");

            return true;
        } catch (\Throwable $e) {
            $this->prenotazioniRepo->annullaTransazione();
            $this->logger->error("Errore durante l'eliminazione prenotazione {$id_prenotazione}: {$e->getMessage()}");
            return false;
        }
    }

   //------------------------------------------UPDATE--------------------------------------------------------------

    public function modificaPrenotazione(int $id_prenotazione, string $nome_prenotazione, string $ora_prenotazione, string $data_in_prenotazione, int $attiva, int $numero_persone):bool{
       
       $id_ricerca= $this->visualizzaPrenotazione($id_prenotazione);
       
       if(!$id_ricerca){
            $this->logger->warning("Modifica prenotazione fallita: prenotazione '{$id_prenotazione}' non trovata");
            return false;
        }

        if (!$this->isDataValida($data_in_prenotazione)) {
            $this->logger->warning("Modifica prenotazione fallita: data non valida '{$data_in_prenotazione}'");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->prenotazioniRepo->aggiornaPrenotazione($id_prenotazione, $nome_prenotazione, $ora_prenotazione, $data_in_prenotazione, $attiva, $numero_persone);
             $this->logger->info("Prenotazione id {$id_prenotazione} : aggiornata con successo");
             $this->storicoPrenotazioni->spostata("Prenotazione {$id_prenotazione} : modificata con successo ");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("Prenotazione id {$id_prenotazione} non aggiornata: {$e->getMessage()}");
             return false;
        }

    }

    public function aggiornaTavoloPrenotazione(int $id_prenotazione,array $tavoli):bool{
       
       try {
             $this->prenotazioniRepo->aggiornaTavoloPrenotazione($id_prenotazione,$tavoli);
             $tavoliStr = implode(', ', $tavoli);
             $this->logger->info("Prenotazione id {$id_prenotazione} : aggiornata con successo sul/i tavoli {$tavoliStr} ");
             $this->storicoPrenotazioni->spostata("Prenotazione {$id_prenotazione} : modificata con successo sul/i tavoli {$tavoliStr} ");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("Prenotazione id {$id_prenotazione} non aggiornata: {$e->getMessage()}");
             return false;
        }

    }

    public function modificaPrenotazioneETavolo(int $id_prenotazione, string $nome_prenotazione, string $ora_prenotazione, string $data_in_prenotazione, int $attiva, int $numero_persone,array $tavoli):bool{
       
       $id_ricerca= $this->visualizzaPrenotazione($id_prenotazione);
       
       if(!$id_ricerca){
            $this->logger->warning("Modifica prenotazione fallita: prenotazione '{$id_prenotazione}' non trovata");
            return false;
        }

        if (!$this->isDataValida($data_in_prenotazione)) {
            $this->logger->warning("Modifica prenotazione fallita: data non valida '{$data_in_prenotazione}'");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
            $this->prenotazioniRepo->iniziaTransazione(); // unico punto in cui si apre la transazione

            $this->prenotazioniRepo->aggiornaPrenotazione( $id_prenotazione, $nome_prenotazione, $ora_prenotazione,$data_in_prenotazione, $attiva, $numero_persone);
            
            
            $this->prenotazioniRepo->aggiornaTavoloPrenotazione($id_prenotazione, $tavoli);

            $this->prenotazioniRepo->confermaTransazione(); // entrambe le query confermate insieme

            $this->logger->info("Prenotazione id {$id_prenotazione}: aggiornata con successo sia il tavolo che la prenotazione");
            $this->storicoPrenotazioni->spostata("Prenotazione {$id_prenotazione}: modificata con successo sia il tavolo che la prenotazione");

            return true;
        } catch (\Throwable $e) {
            $this->prenotazioniRepo->annullaTransazione(); // unico punto in cui si annulla -> coerente con l'unico beginTransaction
            $this->logger->error("Prenotazione id {$id_prenotazione} non aggiornata: {$e->getMessage()}");
            return false;
        }

    }



    //-------------------------------------PATCH----------------------------------------------------------

    public function aggiornaStatoPrenotazione(int $id_prenotazione, int $attiva):bool{
       
       $id_ricerca= $this->visualizzaPrenotazione($id_prenotazione);

       if(!$id_ricerca){
            $this->logger->warning("Modifica prenotazione fallita: prenotazione '{$id_prenotazione}' non trovata");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
        try {
             $this->prenotazioniRepo-> aggiornaStatoPrenotazione($id_prenotazione, $attiva);
             if($attiva === 0){
                $this->logger->info("Prenotazione id {$id_prenotazione} : aggiornata con successo");
                $this->storicoPrenotazioni->nonPresentati("Prenotazione {$id_prenotazione} : annullata con successo ");
                return true;
             }
             $this->logger->info("Prenotazione id {$id_prenotazione} : aggiornata con successo");
             $this->storicoPrenotazioni->inserita("Prenotazione {$id_prenotazione} : confermata con successo ");
             return true;
        }catch (\Throwable $e) {
             $this->logger->error("Prenotazione id {$id_prenotazione} non aggiornata: {$e->getMessage()}");
             return false;
        }
    }

    #Altri servicies da implementare alla fine ..
   
}