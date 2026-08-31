<?php 
declare(strict_types=1); 
namespace App\Repositories; 



class ScontrinoRepositories extends BaseRepositories {


     public function visualizzaTuttiGliScontrini():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM scontrino_emesso');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }
    
     public function recuperaUnScontrino(int $id_scontrino):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM scontrino_emesso WHERE $id_scontrino = :id_scontrino AND attivo = 1');
        $stmt->execute(['id_scontrino' => $id_scontrino]);
        return $stmt->fetchAll() ?:null;
     }
    
    public function recuperaUnScontrinoConDettaglio(int $id_scontrino): ?array
    {
    // 1. Query principale: cerchiamo lo scontrino
    $stmt = $this->pdo->prepare('
        SELECT * FROM scontrino_emesso 
        WHERE id_scontrino = :id_scontrino AND attivo = 1
    ');
    $stmt->execute(['id_scontrino' => $id_scontrino]);
    $scontrino = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$scontrino) {
        return null;
    }

    // 2. Query dettagli: prendiamo tutti gli item collegati
    $stmtDettagli = $this->pdo->prepare('
        SELECT 
            sd.quantita, 
            sd.prezzo_unitario_storico, 
            sd.aliquota_iva_storica,
            i.nome
        FROM scontrino_dettaglio sd
        JOIN item_menu i ON sd.id_item = i.id_item
        WHERE sd.id_scontrino = :id_scontrino
    ');
    $stmtDettagli->execute(['id_scontrino' => $id_scontrino]);
    $dettagli = $stmtDettagli->fetchAll(\PDO::FETCH_ASSOC);

    // 3. Uniamo tutto in un unico array strutturato
    $scontrino['items'] = $dettagli;

    return $scontrino;
    }

    public function visualizzaTuttiGliScontriniOggi(): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM scontrino_emesso WHERE data_e_ora_pagamento >= CURDATE() AND attivo = 1'
        );
        $stmt->execute();
        return $stmt->fetchAll() ?: null;
    }

     public function visualizzaTuttiGliScontriniData(string $data_e_ora_pagamento):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM scontrino_emesso WHERE data_e_ora_pagamento = :data_e_ora_pagamento AND attivo = 1');
        $stmt->execute(['data_e_ora_pagamento' => $data_e_ora_pagamento]);
        return $stmt->fetchAll() ?:null;
     }

    public function visualizzaIlTotDegliScontriniOggi(): ?float
    {
        $stmt = $this->pdo->prepare(
            'SELECT SUM(totale) AS tot_incasso FROM scontrino_emesso
             WHERE data_e_ora_pagamento >= CURDATE() AND attivo = 1'
        );
        $stmt->execute();
        $tot = $stmt->fetchColumn();
        return $tot !== null ? (float) $tot : null;
    }

     
                 //INSERIMENTI

    public function nuovoScontrino(int $id_ordine, float $totale, array $dettagli): ?int
    {
        if (count($dettagli) === 0) {
            return null; 
        }
 
        $commitHere = false;
        if (!$this->inTransaction()) {
            $this->iniziaTransazione();
            $commitHere = true;
        }
 
        try {
            $stmtEmesso = $this->pdo->prepare(
                'INSERT INTO scontrino_emesso (id_ordine, totale, attivo)
                 VALUES (:id_ordine,:totale, 1)'
            );
            $stmtEmesso->execute([
                'id_ordine' => $id_ordine,
                'totale' => $totale,
            ]);
 
            $id_scontrino = (int) $this->pdo->lastInsertId();
 
            // 2) righe di dettaglio — statement preparato una sola volta fuori dal loop
            $stmtDettaglio = $this->pdo->prepare(
                'INSERT INTO scontrino_dettaglio
                    (id_scontrino, id_item, quantita, prezzo_unitario_storico, aliquota_iva_storica)
                 VALUES (:id_scontrino, :id_item, :quantita, :prezzo_unitario_storico, :aliquota_iva_storica)'
            );
 
            $righeInserite = 0;
            foreach ($dettagli as $riga) {
                $stmtDettaglio->execute([
                    'id_scontrino' => $id_scontrino,
                    'id_item' => $riga['id_item'],
                    'quantita' => $riga['quantita'],
                    'prezzo_unitario_storico' => $riga['prezzo_unitario_storico'],
                    'aliquota_iva_storica' => $riga['aliquota_iva_storica'],
                ]);
                $righeInserite += $stmtDettaglio->rowCount();
            }
 
            if ($righeInserite !== count($dettagli)) {
                throw new \RuntimeException('Inserimento dettaglio scontrino incompleto');
            }
 
            if ($commitHere) {
                $this->confermaTransazione();
            }
 
            return $id_scontrino;
 
        } catch (Throwable $e) {
            if ($commitHere && $this->inTransaction()) {
                $this->annullaTransazione(); 
            }
            throw $e; // rilancio per farlo gestire al Service (log, risposta 500, ecc.)
        }
    }

 
 public function annullaScontrino(int $id_scontrino): bool
    {
        $stmt = $this->pdo->prepare('UPDATE scontrino_emesso SET attivo = 0 WHERE id_scontrino = :id_scontrino');
        $stmt->execute(['id_scontrino' => $id_scontrino]);
 
        return $stmt->rowCount() > 0;
    }

     
public function recuperaValoriIva():?array
{
    $stmt = $this->pdo->prepare('SELECT * FROM iva');
    $stmt->execute([]);
    return $stmt->fetchAll() ?:null;
}
}