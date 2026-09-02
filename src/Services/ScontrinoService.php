<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\ScontrinoRepositories;
use App\Repositories\OrdiniRepositories;



class ScontrinoService {
    public function __construct(private ScontrinoRepositories $scontrinoRepo, private OrdiniRepositories $ordiniRepo,private LoggerService $logger,private StoricoOrdiniService $storicoOrdini){} 
//------------------------------LETTURA---------------------------------------

    public function visualizzaTuttiGliScontrini(): array {
        try {
            return $this->scontrinoRepo->visualizzaTuttiGliScontrini() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero scontrini: {$e->getMessage()}");
            return []; 
        }
    }
    //visualizza scontrini sul tavolo
    public function recuperaUnScontrinoBool(int $id_ordine): bool {
        try {
            return $this->scontrinoRepo->recuperaUnScontrino($id_ordine) ?? false;
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero scontrino: {$e->getMessage()}");
            return false; 
        }
    }
    //recuperaUnScontrinoAttivo
    public function recuperaUnScontrinoAttivo(int $id_ordine): ?array {
        try {
        $scontrino= $this->scontrinoRepo->recuperaUnScontrinoAttivo($id_ordine) ?? null;
        $this->logger->info('Recupero scontrino', [
            $scontrino
        ]);
        return $scontrino;
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero scontrino attivo: {$e->getMessage()}");
            return null; 
        }
    }

     public function recuperaUnScontrinoConDettaglio(int $id_scontrino): array
    {
        
        $scontrino = $this->scontrinoRepo->recuperaUnScontrinoConDettaglio($id_scontrino);

        if ($scontrino === null) {
        $this->logger->warning("Tentativo di accesso a scontrino inesistente o inattivo per ordine: {$id_scontrino}");
        throw new \RuntimeException("Scontrino non trovato o non più disponibile.");
        }

        return $scontrino;
    }

     //visualizza scontrini
    
    private function isDataValida(string $data): bool
    {
        $d = \DateTime::createFromFormat('Y-m-d', $data);
        if (!$d || $d->format('Y-m-d') !== $data) {
            return false;
        }

        $oggi = new \DateTime('today');

        $limiteMax = (clone $oggi)->modify('+1 year');

        return $d >= $oggi && $d <= $limiteMax;
    }

    private function validaData(string $data): void
    {
        if (!$this->isDataValida($data)) {
            throw new \InvalidArgumentException("Formato data non valido: $data (atteso Y-m-d)");
        }
    }


    public function visualizzaTuttiGliScontriniData(string $data_e_ora_pagamento): array {

        if (!$this-> isDataValida($data_e_ora_pagamento)) {
        $this->logger->warning("Formato data non valido: $data_e_ora_pagamento");
        return [];
    }
        try {
            return $this->scontrinoRepo->visualizzaTuttiGliScontriniData($data_e_ora_pagamento) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero degli scontrini per il giorno $data_e_ora_pagamento: {$e->getMessage()}");
            return []; 
        }
    }
    public function visualizzaTuttiGliScontriniOggi(): array {
    
        try {
            return $this->scontrinoRepo->visualizzaTuttiGliScontriniOggi() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero degli scontrini per oggi: {$e->getMessage()}");
            return []; 
        }
    }

    public function visualizzaIlTotDegliScontriniOggi(): array {
    
        try {
            return $this->scontrinoRepo->visualizzaIlTotDegliScontriniOggi() ;
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero dei tot degli scontrini per oggi: {$e->getMessage()}");
            return ['tot_incasso' => 0.0]; 
        }
    }
 //--------------------------------------INSERIMENTI--------------------------------------

  
 
    //inserire la prenotazione, nel js non dovrà andare da sola ma con il controllo
    public function nuovoScontrino(int $id_ordine, float $totale, array $dettagli): ?int{

        //da sviluopppare il controllo se l'ordine è già stato scontrinato, in tal caso non si può fare un nuovo scontrino
       if($this->scontrinoRepo->recuperaUnScontrino($id_ordine)) {
            $this->logger->warning("Tentativo di generare un nuovo scontrino per un ordine già scontrinato: {$id_ordine}");
            return 0; // Indica che lo scontrino esiste già
        }
        try {
             $id_scontrino = $this->scontrinoRepo->nuovoScontrino($id_ordine, $totale, $dettagli);
             if($id_scontrino){
                $this->ordiniRepo->aggiornaRelazioneOrdineStato($id_ordine, 2);
             }
             $this->logger->info("Nuovo scontrino inserito con successo! {$id_scontrino} rif. ordine {$id_ordine}");
             $this->storicoOrdini->scontrino("Nuovo scontrino inserito con successo! {$id_scontrino} rif. ordine {$id_ordine}");
             return $id_scontrino;
             
        }catch (\Throwable $e) {
             $this->logger->error("Generazione Scontrino fallita!  rif. ordine {$id_ordine}: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento Scontrino: {$e->getMessage()}");
        }   
    }

    //inserimento della prenotazione sul tavolo
    public function annullaScontrino(int $id_scontrino):bool{

        #salto l'autorizzazione in base al ruolo
       try {

             $esito = $this->scontrinoRepo->annullaScontrino($id_scontrino);
             if (!$esito) {
                // FIX: prima veniva ignorato l'esito e si ritornava sempre true
                $this->logger->warning("Storno scontrino senza effetto (già annullato o inesistente) {$id_scontrino} ");
                return false;
            }
 
            $messaggio = "Scontrino stornato con successo! {$id_scontrino} ";
            $this->logger->info($messaggio);
            $this->storicoOrdini->scontrino($messaggio);
 
            return true;
 
        } catch (\Throwable $e) {
            $this->logger->error("Scontrino non stornato {$id_scontrino} : {$e->getMessage()}");
            throw new \RuntimeException("Errore storno scontrino: {$e->getMessage()}");
        }
    }


    //recuperaValoriIva

    public function recuperaValoriIva(): array {
    
        try {
            return $this->scontrinoRepo->recuperaValoriIva() ;
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero valori iva: {$e->getMessage()}");
            return []; 
        }
    }

}