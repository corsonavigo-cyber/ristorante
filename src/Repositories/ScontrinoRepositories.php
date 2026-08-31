<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database


#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class ScontrinoRepositories {

     public function __construct(private PDO $pdo){}
     //ordin COLLEGATE E NON AI TAVOLI
     public function visualizzaTuttiGliScontrini():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM scontrino_emesso');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }
    
     public function recuperaUnScontrino(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM scontrino_emesso WHERE id_ordine = :id_ordine');
        $stmt->execute(['id_ordine' => $id_ordine]);
        return $stmt->fetchAll() ?:null;
     }
    
     public function visualizzaTuttiGliScontriniOggi():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM scontrino_emesso WHERE data_e_ora >= CURDATE() AND attivo = 1');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }
     public function visualizzaTuttiGliScontriniData(string $data_e_ora_pagamento):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM scontrino_emesso WHERE data_e_ora_pagamento === :data_e_ora_pagamento AND attivo = 1');
        $stmt->execute(['data_e_ora_pagamento' => $data_e_ora_pagamento]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaIlTotDegliScontriniOggi():?array
     {
        $stmt =$this->pdo->prepare('SELECT SUM(tot) AS tot_incasso FROM scontrino_emesso WHERE data_e_ora = CURDATE() AND attivo = 1');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     
                 //INSERIMENTI

    public function nuovoScontrino(int $id_ordine,int $numero_persone, array $piatti, array $bevande ,int $tot):bool{

        $stmt = $this->pdo->prepare('INSERT INTO scontrino_emesso (id_ordine, piatti,numero_persone, bevande, tot) VALUES (:id_ordine,:numero_persone, :piatti, :bevande, :tot)');
 
        $stmt->execute([
                'id_ordine' => $id_ordine,
                'numero_persone' => $numero_persone,
                'piatti' => json_encode($piatti),
                'bevande' => json_encode($bevande),
                'tot' => $tot
            ]);
           
        return $stmt->rowCount()>0;
    }

 
    public function annullaScontrino(int $id_scontrino):bool{

        $stmt = $this->pdo->prepare('UPDATE  scontrino_emesso SET attivo = :0  WHERE id_scontrino =:id_scontrino ');
        $stmt->execute([
            'id_scontrino'=>$id_scontrino         
        ]);
        return $stmt->rowCount()===1;
     }
}

     