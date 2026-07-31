<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\LeggiStoricoRepositories;

class LeggiStoricoService
{
    public function __construct(private LeggiStoricoRepositories $leggistoricorepository) {}

    // ritorna le righe già pulite/filtrate, pronte per il JSON di risposta
    public function ottieniStorico(): array
    {
        $contenuto = $this->leggistoricorepository->leggiStorico();

        return array_values(array_filter(
            explode("\n", $contenuto),
            fn(string $riga): bool => trim($riga) !== ''
        ));
    }
}