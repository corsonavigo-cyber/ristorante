<?php
declare(strict_types=1);

namespace App\Services;

class StoricoOrdiniService
{
    private string $storicoFile; 

    public function __construct()
    {
        $cartellaLog = dirname(__DIR__, 2) . '/storage/logs';
        $this->storicoFile = $cartellaLog . '/storicoordini.txt';
    }

    public function cancellato(string $message): void
    {
        $this->write('CANCELLATO', $message);
    }

    public function aperto(string $message): void
    {
        $this->write('APERTO', $message);
    }

    public function scontrino(string $message): void
    {
        $this->write('INVIATO A SCONTRINO', $message);
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
            error_log("Impossibile scrivere nello storico ORDINI: {$this->storicoFile}");
        }
    }
}