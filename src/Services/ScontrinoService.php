<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\ScontrinoRepositories;


class ScontrinoService {
    public function __construct(private ScontrinoRepositories $scontrinoRepo, private LoggerService $logger,private StoricoOrdiniService $storicoOrdini){} 
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
    public function recuperaUnScontrino(int $id_ordine): array {
        try {
            return $this->scontrinoRepo->recuperaUnScontrino($id_ordine) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero scontrino: {$e->getMessage()}");
            return []; 
        }
    }
    

     public function recuperaUnScontrinoConDettaglio(int $id_scontrino): array
    {
        $scontrino = $this->scontrinoRepo->recuperaUnScontrino($id_scontrino);

        if ($scontrino === null) {
            $this->logger->warning("Tentativo di accesso a scontrino inesistente o inattivo: {$id_scontrino}");
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

        
       try {
             $id_scontrino = $this->scontrinoRepo->nuovoScontrino($id_ordine, $totale, $dettagli);
             $this->logger->info("Nuovo scontrino inserito con successo! {$id_scontrino} rif. ordine {$id_ordine}, {$numero_persone}: {json_encode($piatti)} {json_encode($bevande)} {$tot}");
             $this->storicoOrdini->scontrino("Nuovo scontrino inserito con successo! {$id_scontrino} rif. ordine {$id_ordine}, {$numero_persone}: {json_encode($piatti)} {json_encode($bevande)} {$tot}");
             return $id_scontrino;
             
        }catch (\Throwable $e) {
             $this->logger->error("Generazione Scontrino fallita!  rif. ordine {$id_ordine}: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento Scontrino: {$e->getMessage()}");
        }   
    }

    //inserimento della prenotazione sul tavolo
    public function annullaScontrino(int $id_scontrino,int $id_ordine):bool{

        #salto l'autorizzazione in base al ruolo
       try {

             $esito = $this->scontrinoRepo->annullaScontrino($id_scontrino);
             if (!$esito) {
                // FIX: prima veniva ignorato l'esito e si ritornava sempre true
                $this->logger->warning("Storno scontrino senza effetto (già annullato o inesistente) {$id_scontrino} rif. ordine {$id_ordine}");
                return false;
            }
 
            $messaggio = "Scontrino stornato con successo! {$id_scontrino} rif. ordine {$id_ordine}";
            $this->logger->info($messaggio);
            $this->storicoOrdini->scontrino($messaggio);
 
            return true;
 
        } catch (\Throwable $e) {
            $this->logger->error("Scontrino non stornato {$id_scontrino} rif. ordine {$id_ordine}: {$e->getMessage()}");
            throw new \RuntimeException("Errore storno scontrino: {$e->getMessage()}");
        }
    }

}