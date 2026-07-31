<?php
declare(strict_types=1);

namespace App\Repositories;

class LeggiStoricoRepositories
{
    private string $file;

    public function __construct(string $file)
    {
        $this->file = $file;
    }

    // legge il contenuto grezzo del file storico, lancia se non esiste/non leggibile
    public function leggiStorico(): string
    {
        if (!file_exists($this->file)) {
            throw new \RuntimeException('File storico non trovato');
        }
        // lock in lettura: evita letture parziali se un altro processo sta scrivendo
        $handle = fopen($this->file, 'r');
        if ($handle === false) {
            throw new \Exception('Impossibile aprire il file storico');
        }

        flock($handle, LOCK_SH); // lock condiviso (shared) — "sto leggendo, aspetta a scrivere"
        $contenuto = stream_get_contents($handle);
        flock($handle, LOCK_UN);  // rilascio il lock
        fclose($handle);


        if ($contenuto === false) {
            throw new \Exception('Errore nella lettura del file storico');
        }

        return $contenuto;
    }
}