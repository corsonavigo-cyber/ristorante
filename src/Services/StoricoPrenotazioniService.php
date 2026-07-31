<?php
declare(strict_types=1);

namespace App\Services;

class StoricoPrenotazioniService
{
    private string $storicoFile; 

    public function __construct()
    {
        $cartellaLog = dirname(__DIR__, 2) . '/storage/logs';
        $this->storicoFile = $cartellaLog . '/storicoprenotazioni.txt';
    }

    public function cancellata(string $message): void
    {
        $this->write('CANCELLATA', $message);
    }

    public function nonPresentati(string $message): void
    {
        $this->write('NON PRESENTATI', $message);
    }

    public function effettuata(string $message): void
    {
        $this->write('EFFETTUATA', $message);
    }

    public function inserita(string $message): void
    {
        $this->write('INSERITA', $message);
    }

    public function spostata(string $message): void
    {
        $this->write('SPOSTATA', $message);
    }

    private function write(string $level, string $message): void
    {
        $line = sprintf(
            "[%s] [%s] %s%s",
            date('Y-m-d H:i:s'),
            $level,
            $message,
            PHP_EOL
        );

        $esito = file_put_contents($this->storicoFile, $line, FILE_APPEND | LOCK_EX);

        // FIX: avvisa se la scrittura fallisce (permessi, disco pieno, ecc.)
        if ($esito === false) {
            error_log("Impossibile scrivere nello storico prenotazioni: {$this->storicoFile}");
        }
    }
}