<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\TavoloRepositories;

class TavoloService {
    public function __construct(private TavoloRepositories $tavoloRepo, private LoggerService $logger){} #inietta il repository dei tavoli

    public function visualizzaTavoli(): array {
        try {
            return $this->tavoloRepo->visualizzaTavoli() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero tavoli: {$e->getMessage()}");
            return []; 
        }
    }
 
    public function getById(int $id): ?array {
        try {
            return $this->tavoloRepo->getById($id);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero tavolo ID {$id}: {$e->getMessage()}");
            return null;
        }
    }


    public function inserisciTavolo(int $numero, int $posti_max,int $posti_min):int{

        #salto l'autorizzazione in base al ruolo
       try {
             $newId = $this->tavoloRepo->inserisciTavolo($numero, $posti_max, $posti_min);
             
        }catch (\Throwable $e) {
             $this->logger->error("Tavolo {$numero} non inserito: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento tavolo: {$e->getMessage()}");
        }
        $this->logger->info("Tavolo {$numero}: inserito con successo");
        return $newId;
        
        
    }

    public function eliminaTavolo(int $id_tavolo):bool{
       
       $id_ricerca= $this->tavoloRepo->getById($id_tavolo);
       
       if(!$id_ricerca){
            $this->logger->warning("Eliminazione Tavolo fallita: tavolo '{$id_tavolo}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->tavoloRepo->eliminaTavolo($id_tavolo);
             
        }catch (\Throwable $e) {
             $this->logger->error("Eliminazione Tavolo {$id_tavolo} fallita: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Tavolo {$id_tavolo}: eliminato con successo");
        return true;
        
        
    }

    public function modificaTavolo(int $id_tavolo, int $numero,int $posti_max,int $posti_min):bool{
       
       $id_ricerca= $this->tavoloRepo->getById($id_tavolo);
       
       if(!$id_ricerca){
            $this->logger->warning("Modifica del tavolo {$id_tavolo}  fallita: tavolo  non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->tavoloRepo->aggiornaTavolo($id_tavolo,$numero,$posti_max,$posti_min);
             
        }catch (\Throwable $e) {
             $this->logger->error("Tavolo {$id_tavolo} non aggiornato: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Tavolo {$numero}: aggiornato con successo");
        return true;
        
        
    }
    
    #servicies da impliementare alla fine
    function selezionaUnTavolo(int $numero):?array{
        
        #da aggiungere la relazione con le prenotazioni
        #da aggiungere la relazione con il conto
        return $this->tavoloRepo->getByNumero($numero);
        
    }
    
    function prenotaUnTavolo(int $id_tavolo,string $nome_cliente, int $posti, string $data_ora):bool{
        #in costruzione manca ancora da fare la tabella prenotazioni e la logica per inserire una prenotazione
        return true;
    }
    
}