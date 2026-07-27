<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
use App\Enums\Categoria;
use App\Enums\InMenu;
use App\Enums\Tipo;

#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class MenuRepositories extends BaseRepositories {
     
     //ITEM
     public function visualizzaItem(): array
     {
          $stmt = $this->pdo->prepare(<<<'SQL'
        SELECT 
            item_menu.id_item,
            item_menu.tipo,
            item_menu.categoria,
            item_menu.in_menu,
            item_menu.nome,
            item_menu.prezzo,
            item_menu.descrizione,
            iva.id_iva,
            iva.aliquota,
            iva.descrizione as descrizione_iva,
            allergene.id_allergene,
            allergene.nome_allergene    
        FROM item_menu
        LEFT JOIN relazione_allergeni_item ON relazione_allergeni_item.id_item = item_menu.id_item
        LEFT JOIN allergene ON allergene.id_allergene = relazione_allergeni_item.id_allergene
        LEFT JOIN iva ON iva.id_iva = item_menu.id_iva
    SQL);

        $stmt->execute();
        return $stmt->fetchAll() ?:[];
     }

     public function visualizzaItemConRelazioni(int $id_item):?array
     {
        $stmt =$this->pdo->prepare(<<<'SQL'
        SELECT 
            item_menu.id_item,
            item_menu.tipo,
            item_menu.categoria,
            item_menu.in_menu,
            item_menu.nome,
            item_menu.prezzo,
            item_menu.descrizione,
            iva.id_iva,
            iva.aliquota,
            iva.descrizione as descrizione_iva,
            allergene.id_allergene,
            allergene.nome_allergene    
        FROM item_menu
        LEFT JOIN relazione_allergeni_item ON relazione_allergeni_item.id_item = item_menu.id_item
        LEFT JOIN allergene ON allergene.id_allergene = relazione_allergeni_item.id_allergene
        LEFT JOIN iva ON iva.id_iva = item_menu.id_iva
        WHERE id_item = :id_item LIMIT 1
    SQL);
        $stmt->execute(['id_item' => $id_item]);
        return $stmt->fetch() ?:null;
     }
 
     //ALLERGENI
     public function visualizzaAllergeni():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM allergene');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }
     
     //PER CATEGORIA 
     public function selezionaItemPerCategoria(Categoria $categoria): ?array{
        $stmt =$this->pdo->prepare(<<<'SQL'
        SELECT 
            item_menu.id_item,
            item_menu.tipo,
            item_menu.categoria,
            item_menu.in_menu,
            item_menu.nome,
            item_menu.prezzo,
            item_menu.descrizione,
            iva.id_iva,
            iva.aliquota,
            iva.descrizione as descrizione_iva,
            allergene.id_allergene,
            allergene.nome_allergene    
        FROM item_menu
        LEFT JOIN relazione_allergeni_item ON relazione_allergeni_item.id_item = item_menu.id_item
        LEFT JOIN allergene ON allergene.id_allergene = relazione_allergeni_item.id_allergene
        LEFT JOIN iva ON iva.id_iva = item_menu.id_iva
        WHERE categoria = :categoria 
    SQL);
        $stmt->execute(['categoria' => $categoria->value]);
        return $stmt->fetchAll() ?:null;
     }

     //per TIPO
    public function selezionaItemPerTipo(Tipo $tipo): ?array{
        $stmt =$this->pdo->prepare(<<<'SQL'
        SELECT 
            item_menu.id_item,
            item_menu.tipo,
            item_menu.categoria,
            item_menu.in_menu,
            item_menu.nome,
            item_menu.prezzo,
            item_menu.descrizione,
            iva.id_iva,
            iva.aliquota,
            iva.descrizione as descrizione_iva,
            allergene.id_allergene,
            allergene.nome_allergene    
        FROM item_menu
        LEFT JOIN relazione_allergeni_item ON relazione_allergeni_item.id_item = item_menu.id_item
        LEFT JOIN allergene ON allergene.id_allergene = relazione_allergeni_item.id_allergene
        LEFT JOIN iva ON iva.id_iva = item_menu.id_iva
        WHERE tipo = :tipo 
    SQL);
        $stmt->execute(['tipo' => $tipo->value]);
        return $stmt->fetchAll() ?:null;
     }

     //in menu
     public function selezionaItemInMenu(InMenu $in_menu): ?array{
        $stmt =$this->pdo->prepare(<<<'SQL'
        SELECT 
            item_menu.id_item,
            item_menu.tipo,
            item_menu.categoria,
            item_menu.in_menu,
            item_menu.nome,
            item_menu.prezzo,
            item_menu.descrizione,
            iva.id_iva,
            iva.aliquota,
            iva.descrizione as descrizione_iva,
            allergene.id_allergene,
            allergene.nome_allergene    
        FROM item_menu
        LEFT JOIN relazione_allergeni_item ON relazione_allergeni_item.id_item = item_menu.id_item
        LEFT JOIN allergene ON allergene.id_allergene = relazione_allergeni_item.id_allergene
        LEFT JOIN iva ON iva.id_iva = item_menu.id_iva
        WHERE in_menu = :in_menu 
    SQL);
        $stmt->execute(['in_menu' => $in_menu->value]);
        return $stmt->fetchAll() ?:null;
     }

                     //SELEZIONI ID

     #metodo per ottenere piatto dal database dato il suo id, restituisce un array associativo o null se non trovato
     public function selezionaItemIdIva(int $id_iva): ?array 
     {
        #preparo la connessione
        $stmt = $this->pdo->prepare(<<<'SQL'
        SELECT 
            item_menu.id_item,
            item_menu.tipo,
            item_menu.categoria,
            item_menu.in_menu,
            item_menu.nome,
            item_menu.prezzo,
            item_menu.descrizione,
            iva.id_iva,
            iva.aliquota,
            iva.descrizione as descrizione_iva,
            allergene.id_allergene,
            allergene.nome_allergene    
        FROM item_menu
        LEFT JOIN relazione_allergeni_item ON relazione_allergeni_item.id_item = item_menu.id_item
        LEFT JOIN allergene ON allergene.id_allergene = relazione_allergeni_item.id_allergene
        LEFT JOIN iva ON iva.id_iva = item_menu.id_iva
        WHERE id_iva = :id_iva LIMIT 1
    SQL); 
        $stmt->execute(['id_iva' => $id_iva]); #esegue la query sostituendo il parametro con il valore passato
        return $stmt->fetch() ?: null; #restituisce il risultato come array associativo o null se non trovato

     }


     public function selezionaAllergeneId(int $id_allergene):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM allergene WHERE id_allergene =:id_allergene LIMIT 1');
        $stmt->execute(['id_allergene' => $id_allergene]);
        return $stmt->fetch() ?:null;
     }
                  
                //INSERIMENTI

     public function inserisciAllergene(string $nome_allergene):int{

        $stmt = $this->pdo->prepare('INSERT INTO allergene (nome_allergene) VALUES (:nome_allergene)');
        $stmt->execute([
            'nome_allergene'=>$nome_allergene
        ]);
        return (int)$this->pdo->lastInsertId();
     }

     public function inserisciRelazioneAllergene(string $id_item, array $allergeni_selezionati):int{

        //inserimento nella tabella delle relazioni nell' inserimento ho intezione di aggiungere una selezione multipla per ottenere un array di id allergene
        foreach($allergeni_selezionati as $id_allergene) {
            $stmt2 = $this->pdo->prepare('INSERT INTO relazione_allergeni_item (id_item, id_allergene) VALUES (:id_item, :id_allergene)');
            $stmt2->execute([
            ':id_item'   => $id_item,
            ':id_allergene' => $id_allergene
        ]);
        }
        return (int)$this->pdo->lastInsertId();
     }
 
     public function inserisciItem(Tipo $tipo, Categoria $categoria, InMenu $in_menu, string $nome,float $prezzo, string $descrizione, int $id_iva, array $allergeni_selezionati):bool{
       
        $this->iniziaTransazione();
        try{
            $stmt = $this->pdo->prepare('INSERT INTO item_menu (tipo,categoria,in_menu,nome,prezzo,descrizione,id_iva) VALUES (:tipo, :categoria, :in_menu, :nome, :prezzo, :descrizione, :id_iva)');
            $stmt->execute([
                'tipo'=>$tipo->value,
                'categoria'=>$categoria->value,
                'in_menu'=>$in_menu->value,
                'nome'=>$nome,
                'prezzo'=>$prezzo,
                'descrizione'=>$descrizione,
                'id_iva'=>$id_iva
                
            ]);
            $id_item = (int)$this->pdo->lastInsertId();

            $this->inserisciRelazioneAllergene($id_item,$allergeni_selezionati);
            
            $this->confermaTransazione();
            return $id_item > 0;

        }catch (\Throwable $e) {

            $this->annullaTransazione();
            throw $e;

        }

     }

    

     //DELETE

     public function eliminaAllergene(int $id_allergene):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM allergene WHERE id_allergene = :id_allergene');
        $stmt->execute([
            'id_allergene' => $id_allergene
        ]);
        return $stmt->rowCount()>0;
     }

     public function eliminaRelazioneAllergeneItem(int $id_item):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM relazione_allergeni_item WHERE id_item = :id_item');
        $stmt->execute([
            'id_item' => $id_item
        ]);
        return $stmt->rowCount()>0;
     }
     

     

     public function eliminaItem(int $id_item):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM item_menu WHERE id_item = :id_item');
        $stmt->execute([
            'id_item' => $id_item
        ]);
        return $stmt->rowCount()>0;
     }

    public function eliminaItemComposto(int $id_item): bool
{
        $this->iniziaTransazione();

        try {

            $this->eliminaRelazioneAllergeneItem($id_item);

            $this->eliminaItem($id_item);

            $this->confermaTransazione();

            return true;

        } catch (\Throwable $e) {

            $this->annullaTransazione();

            throw $e;
        }
    }
    


     //UPDATE

     //1.cambio stato se in menu o no
     public function aggiornaStatoItem(int $id_item, InMenu $in_menu): bool
     {
        $stmt = $this->pdo->prepare('UPDATE item_menu SET in_menu = :in_menu WHERE id_item = :id_item');
        $stmt->execute([
            'id_item' => $id_item,
            'in_menu' => $in_menu->value
        ]);
        return $stmt->rowCount()>0; 

     }
     //2.aggiorna il l'elemento del menu
    public function aggiornaItem(int $id_item, Tipo $tipo, InMenu $in_menu, Categoria $categoria, string $nome, float $prezzo, string $descrizione,  int $id_iva, array $allergeni_selezionati): bool
      {

         $this->iniziaTransazione();
        try{
            // elimina e reinserisci sempre, indipendentemente da rowCount
            $this->eliminaRelazioneAllergeneItem($id_item);
            //fai l'update
            $stmt = $this->pdo->prepare('UPDATE item_menu SET tipo = :tipo, categoria = :categoria, in_menu = :in_menu, nome = :nome , prezzo = :prezzo, descrizione = :descrizione, id_iva = :id_iva WHERE id_item = :id_item');
            $stmt->execute([
            'id_item'   => $id_item,   
            'tipo'=> $tipo->value,
            'in_menu'     => $in_menu->value,
            'categoria'   => $categoria->value,
            'nome' => $nome,
            'prezzo'      => $prezzo,
            'descrizione' => $descrizione,
            'id_iva'=>$id_iva
            ]);

            // reinserisci
            $this->inserisciRelazioneAllergene($id_piatto,$allergeni_selezionati);
            $this->confermaTransazione();
            return true;
      }catch (\Throwable $e) {

            $this->annullaTransazione();

            throw $e;
        }
    }

    public function aggiornaStatoIva(int $id_item, Categoria $categoria): bool
     {
        $stmt = $this->pdo->prepare('UPDATE item_menu SET id_iva = :id_iva WHERE id_item = :id_item');
        $stmt->execute([
            'id_item' => $id_item,
            'in_menu' => $in_menu->value
        ]);
        return $stmt->rowCount()>0; 

     }

}