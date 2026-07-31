<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\ScontrinoRepositories;
use PDO;

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

     //visualizza scontrini
    
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
            return $this->scontrinoRepo->visualizzaIlTotDegliScontriniOggi() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero dei tot degli scontrini per oggi: {$e->getMessage()}");
            return []; 
        }
    }
 //--------------------------------------INSERIMENTI--------------------------------------

  
 
    //inserire la prenotazione, nel js non dovrà andare da sola ma con il controllo
    public function nuovoScontrino(int $id_ordine,int $numero_persone, array $piatti, array $bevande ,int $tot): ?int{

        #salto l'autorizzazione in base al ruolo
       try {
             $id_scontrino = $this->scontrinoRepo->nuovoScontrino($id_ordine,$numero_persone,$piatti,$bevande,$tot);
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

             $this->scontrinoRepo->annullaScontrino($id_scontrino, $id_ordine);
             $this->logger->info("Scontrino annullato con successo! {$id_scontrino} rif. ordine {$id_ordine}");
             $this->storicoOrdini->scontrino("Scontrino annullato con successo! {$id_scontrino} rif. ordine {$id_ordine}");
             return true;
             
        }catch (\Throwable $e) {
             $this->logger->error("Scontrino non annullato {$id_scontrino} rif. ordine {$id_ordine}: {$e->getMessage()}");
             throw new \RuntimeException("Errore annullamento scontrino : {$e->getMessage()}");
        }
        
   
    }

}