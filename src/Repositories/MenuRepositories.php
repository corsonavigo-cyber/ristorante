<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
use App\Enums\Categoria;
use App\Enums\InMenu;
use App\Enums\Alcol;
#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class MenuRepositories {

     public function __construct(private PDO $pdo){}
     //PIATTI
     public function visualizzaItem():?array
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
        return $stmt->fetchAll() ?:null;
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
        LEFT JOIN iva ON iva.id_iva = item_menu.
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
        LEFT JOIN iva ON iva.id_iva = item_menu.
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
        LEFT JOIN iva ON iva.id_iva = item_menu.
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
        LEFT JOIN iva ON iva.id_iva = item_menu.
        WHERE in_menu = :in_menu 
    SQL);
        $stmt->execute(['in_menu' => $in_menu->value]);
        return $stmt->fetchAll() ?:null;
     }

                     //SELEZIONI ID

     #metodo per ottenere piatto dal database dato il suo id, restituisce un array associativo o null se non trovato
     public function selezionaPiattoId(int $id_item): ?array 
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
        LEFT JOIN iva ON iva.id_iva = item_menu.
        WHERE id_item = :id_item 
    SQL); 
        $stmt->execute(['id_item' => $id_item]); #esegue la query sostituendo il parametro con il valore passato
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
 /*
     public function inserisciBevanda(string $nome_bevanda, float $prezzo, string $descrizione, Alcol $alcol, InMenu $in_menu, array $allergeni_selezionati):bool{

        $stmt = $this->pdo->prepare('INSERT INTO bevanda (nome_bevanda, prezzo, descrizione, alcol, in_menu) VALUES (:nome_bevanda, :prezzo, :descrizione, :alcol, :in_menu)');
        $stmt->execute([
            'nome_bevanda'=>$nome_bevanda,
            'prezzo'=>$prezzo,
            'descrizione'=>$descrizione,
            'alcol'=>$alcol->value,
            'in_menu'=>$in_menu->value
        ]);
        $id_bevanda = (int)$this->pdo->lastInsertId();

        //inserimento nella tabella delle relazioni nell' inserimento ho intezione di aggiungere una selezione multipla per ottenere un array di id allergene
        foreach($allergeni_selezionati as $id_allergene) {
        $stmt2 = $this->pdo->prepare('INSERT INTO allergene_bevanda (id_allergene, id_bevanda) VALUES (:id_allergene, :id_bevanda)');
        $stmt2->execute([
        ':id_allergene' => $id_allergene,
        ':id_bevanda'   => $id_bevanda
        ]);
        }
        return $id_bevanda > 0;
     }

     public function inserisciPiatto(string $nome_piatto, float $prezzo, string $descrizione, InMenu $in_menu, Categoria $categoria, array $allergeni_selezionati):bool{

        $stmt = $this->pdo->prepare('INSERT INTO piatto (nome_piatto, prezzo, descrizione, in_menu, categoria) VALUES (:nome_piatto, :prezzo, :descrizione, :in_menu, :categoria )');
        $stmt->execute([
            'nome_piatto'=>$nome_piatto,
            'prezzo'=>$prezzo,
            'descrizione'=>$descrizione,
            'in_menu'=>$in_menu->value,
            'categoria'=>$categoria->value
        ]);
        $id_piatto = (int)$this->pdo->lastInsertId();

        //inserimento nella tabella delle relazioni nell' inserimento ho intezione di aggiungere una selezione multipla per ottenere un array di id allergene
        foreach($allergeni_selezionati as $id_allergene) {
        $stmt2 = $this->pdo->prepare('INSERT INTO allergene_piatto (id_allergene, id_piatto) VALUES (:id_allergene, :id_piatto)');
        $stmt2->execute([
        ':id_allergene' => (int)$id_allergene,
        ':id_piatto'   => $id_piatto
        ]);
        }
        return true;
     }

     //DELETE

     public function eliminaAllergene(int $id_allergene):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM allergeni WHERE id_allergene = :id_allergene');
        $stmt->execute([
            'id_allergene' => $id_allergene
        ]);
        return $stmt->rowCount()>0;
     }
     //delete di supporto per le relazioni
     public function eliminaRelazioneAllergenePiatto(int $id_piatto):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM allergene_piatto WHERE id_piatto = :id_piatto');
        $stmt->execute([
            'id_piatto' => $id_piatto
        ]);
        return $stmt->rowCount()>0;
     }
     

     public function eliminaRelazioneAllergeneBevanda(int $id_bevanda):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM allergene_bevanda WHERE id_bevanda = :id_bevanda');
        $stmt->execute([
            'id_bevanda' => $id_bevanda
        ]);
        return $stmt->rowCount()>0;
     }

     public function eliminaPiatto(int $id_piatto):bool
     {
        $this->eliminaRelazioneAllergenePiatto($id_piatto);
        $stmt = $this->pdo->prepare('DELETE FROM piatto WHERE id_piatto = :id_piatto');
        $stmt->execute([
            'id_piatto' => $id_piatto
        ]);
        return $stmt->rowCount()>0;
     }

     public function eliminaBevanda(int $id_bevanda):bool
     {
        $this->eliminaRelazioneAllergeneBevanda($id_bevanda);
        $stmt = $this->pdo->prepare('DELETE FROM bevanda WHERE id_bevanda = :id_bevanda');
        $stmt->execute([
            'id_bevanda' => $id_bevanda
        ]);
        return $stmt->rowCount()>0;
     }


     //UPDATE

     //1.cambio stato se in menu o no
     public function aggiornaStatoBevanda(int $id_bevanda, InMenu $in_menu): bool
     {
        $stmt = $this->pdo->prepare('UPDATE bevanda SET in_menu = :in_menu WHERE id_bevanda = :id_bevanda');
        $stmt->execute([
            'id_bevanda' => $id_bevanda,
            'in_menu' => $in_menu->value
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }

     public function aggiornaStatoPiatto(int $id_piatto, InMenu $in_menu): bool
     {
        $stmt = $this->pdo->prepare('UPDATE piatto SET in_menu = :in_menu WHERE id_piatto = :id_piatto');
        $stmt->execute([
            'id_piatto' => $id_piatto,
            'in_menu' => $in_menu->value
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }
     //2.aggiorna il l'elemento del menu
    public function aggiornaPiatto(int $id_piatto, string $nome_piatto, float $prezzo, string $descrizione, InMenu $in_menu, Categoria $categoria, array $allergeni_selezionati): bool
      {
         $stmt = $this->pdo->prepare('UPDATE piatto SET nome_piatto = :nome_piatto, prezzo = :prezzo, descrizione = :descrizione, in_menu = :in_menu, categoria = :categoria WHERE id_piatto = :id_piatto');
         $stmt->execute([
            'id_piatto'   => $id_piatto,
            'nome_piatto' => $nome_piatto,
            'prezzo'      => $prezzo,
            'descrizione' => $descrizione,
            'in_menu'     => $in_menu->value,
            'categoria'   => $categoria->value
         ]);

         // elimina e reinserisci sempre, indipendentemente da rowCount
         $this->eliminaRelazioneAllergenePiatto($id_piatto);

         foreach ($allergeni_selezionati as $id_allergene) {
            $stmt2 = $this->pdo->prepare('INSERT INTO allergene_piatto (id_allergene, id_piatto) VALUES (:id_allergene, :id_piatto)');
            $stmt2->execute([
                  ':id_allergene' => (int)$id_allergene,
                  ':id_piatto'    => $id_piatto
            ]);
         }

         return true;
      }
     public function aggiornaBevanda(int $id_bevanda, string $nome_bevanda, float $prezzo, string $descrizione, Alcol $alcol, InMenu $in_menu, array $allergeni_selezionati): bool
     {
        $stmt = $this->pdo->prepare('UPDATE bevanda SET nome_bevanda = :nome_bevanda, prezzo = :prezzo, descrizione = :descrizione, in_menu = :in_menu, alcol = :alcol WHERE id_bevanda = :id_bevanda');
        $stmt->execute([
            'id_bevanda' => $id_bevanda,
            'nome_bevanda' => $nome_bevanda,
            'prezzo' => $prezzo,
            'descrizione' => $descrizione,
            'alcol'=>$alcol->value,
            'in_menu'=>$in_menu->value
            
        ]);
        $this->eliminaRelazioneAllergeneBevanda($id_bevanda);
        
        foreach($allergeni_selezionati as $id_allergene) {
        $stmt2 = $this->pdo->prepare('INSERT INTO allergene_bevanda (id_allergene, id_bevanda) VALUES (:id_allergene, :id_bevanda)');
        $stmt2->execute([
            ':id_allergene' => $id_allergene,
            ':id_bevanda'   => $id_bevanda
        ]);
        }
        return true; 


     }

    */ 
     
}