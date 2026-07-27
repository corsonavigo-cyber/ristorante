<?php
declare(strict_types=1);

namespace App\Services;

class LoggerService
{
    private string $logFile;

    public function __construct()
    {
        // 1. Imposta la timezone per i log
        date_default_timezone_set('Europe/Rome');
        //configurare il percorso per la cartella lo
        $logDir = dirname(__DIR__, 2) . '/storage/logs';
        $this->logFile = $logDir . '/app.log';
    }

   /* 
    soluzione alternativa per creare un file di log giornaliero
    public function __construct()
    {
      $this->logFile = dirname(__DIR__, 2)
        . '/storage/logs/'
        . date('Y-m-d')
        . '.log';
    } */

    public function info(string $message): void
    {
        $this->write('INFO', $message);
    }

    public function warning(string $message): void
    {
        $this->write('WARNING', $message);
    }

    public function error(string $message): void
    {
        $this->write('ERROR', $message);
    }

    private function write(
        string $level,
        string $message
    ): void {

        $line = sprintf(
            "[%s] [%s] %s%s",
            date('Y-m-d H:i:s'),
            $level,
            $message,
            PHP_EOL
        );

        file_put_contents(
            $this->logFile,
            $line,
            FILE_APPEND | LOCK_EX
        );
    }
}