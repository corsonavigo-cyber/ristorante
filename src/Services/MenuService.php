<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\MenuRepositories;
use App\Enums\Categoria;
use App\Enums\InMenu;
use App\Enums\Tipo;

class MenuService {
    public function __construct(private MenuRepositories $menuRepo, private LoggerService $logger){} 

    public function visualizzaItem(): ?array {
        try {
            return $this->menuRepo->visualizzaItem() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero item: {$e->getMessage()}");
            return []; 
        }
    }
    //visualizzaitem
    public function visualizzaItemConRelazioni(int $id_item): ?array{
        try {
            return $this->menuRepo->visualizzaItemConRelazioni($id_item) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero item: {$e->getMessage()}");
            return []; 
        }
    }
    //visualizzaitemiva
    public function selezionaItemIdIva(int $id_iva): ?array {
        try {
            return $this->menuRepo->selezionaItemIdIva($id_iva) ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero item per categoria iva : {$e->getMessage()}");
            return []; 
        }
    }


    public function visualizzaListaAllergeni(): ?array {
        try {
            return $this->menuRepo->visualizzaAllergeni() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero Allergeni: {$e->getMessage()}"); 
            return []; 
        }
    }

    public function selezionaItemPerCategoria(Categoria $categoria): ?array{
        try {
            return $this->menuRepo->selezionaItemPerCategoria($categoria);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero CAtegoria : {$e->getMessage()}");
            return [];
        }
    }

    public function selezionaItemPerTipo(Tipo $tipo): ?array {
        try {
            return $this->menuRepo->selezionaItemPerTipo($tipo);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero item ID {$id_item}: {$e->getMessage()}");
            return [];
        }
    }

    public function selezionaAllergene(int $id_allergene): ?array {
        try {
            return $this->menuRepo->selezionaAllergeneId($id_allergene);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero Allergene ID {$id_allergene}: {$e->getMessage()}");
            return [];
        }
    }

    public function selezionaItemInMenu(InMenu $in_menu): ?array {
        try {
            return $this->menuRepo->selezionaItemInMenu($in_menu);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero item in menu : {$e->getMessage()}");
            return [];
        }
    }

     public function selezionaItemInMenuTipo(InMenu $in_menu,Tipo $tipo): ?array {
        try {
            return $this->menuRepo->selezionaItemInMenuTipo($in_menu, $tipo);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero item in menu : {$e->getMessage()}");
            return [];
        }
    }

    public function nuovoAllergene(string $nome_allergene):int{

        #salto l'autorizzazione in base al ruolo
       try {
             $newIdAllergene = $this->menuRepo->inserisciAllergene($nome_allergene);
             $this->logger->info("Allergene {$nome_allergene}: inserito con successo");
             return $newIdAllergene;
             
        }catch (\Throwable $e) {
             $this->logger->error("Allergene {$nome_allergene} non inserito: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento allergene: {$e->getMessage()}");
        }
        
   
    }


    public function cancellaAllergene(int $id_allergene):bool{
       
       $id_ricerca= $this->selezionaAllergene($id_allergene);
       
       if(!$id_ricerca){
            $this->logger->warning("Eliminazione Allergene fallita: allergene '{$id_allergene}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->eliminaAllergene($id_allergene);
             
        }catch (\Throwable $e) {
             $this->logger->error("Eliminazione Allergene {$id_allergene} fallita: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Allergene {$id_allergene}: eliminato con successo");
        return true;
        
        
    }

    

    public function cancellaItem(int $id_item):bool{
       
       $id_ricerca= $this->visualizzaItemConRelazioni($id_item);
       
       if(!$id_ricerca){
            $this->logger->warning("Eliminazione item fallita: item '{$id_item}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->eliminaItemComposto($id_item);
             $this->logger->info("Item {$id_item}: eliminato con successo");
            return true;    
             
        }catch (\Throwable $e) {
             $this->logger->error("Eliminazione item {$id_item} fallito: {$e->getMessage()}");
             return false;
        }
           
    }
    

   

    public function aggiornaItem(int $id_item, Tipo $tipo, InMenu $in_menu, Categoria $categoria, string $nome, float $prezzo, string $descrizione,  int $id_iva, array $allergeni_selezionati):bool{
       
       $id_ricerca= $this->visualizzaItemConRelazioni($id_item);
       
       if(!$id_ricerca){
            $this->logger->warning("Modifica item fallita: item '{$id_item}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->aggiornaItem($id_item, $tipo, $in_menu, $categoria, $nome, $prezzo, $descrizione,  $id_iva, $allergeni_selezionati);
        }catch (\Throwable $e) {
             $this->logger->error("item id {$id_item} non aggiornato: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("item id {$id_item}: aggiornato con successo");
        return true;
        
        
    }

    public function aggiornaStatoItem(int $id_item, InMenu $in_menu): bool{
       
       $id_ricerca= $this->visualizzaItemConRelazioni($id_item);
       
       if(!$id_ricerca){
            $this->logger->warning("Non è possibile rimuovere l'item : item '{$id_item}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->aggiornaStatoItem($id_item, $in_menu);
             $this->logger->info("item '{$id_item}' : rimosso dal menu clienti con successo");
             return true;
        
        }catch (\Throwable $e) {
             $this->logger->error("item '{$id_item}' non rimosso dal menu: {$e->getMessage()}");
             return false;
        }
     
        
    }

  
   
}