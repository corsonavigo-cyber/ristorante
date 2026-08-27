<?php

namespace App\Services;

use App\Repositories\OrdiniRepositories;

class StampaService
{
    public function __construct(
        private OrdiniRepositories $ordiniRepo,
        private LoggerService $logger,
        private string $dirStampe // path assoluta, iniettata da bootstrap.php (es. storage/logs/stampe)
    ) {}

    /**
     * Genera un file .txt separato per cucina (piatti) e bar (bevande).
     * Ritorna i percorsi dei file effettivamente creati (uno o due, mai zero se l'ordine esiste).
     */
    public function generaComandaTxt(int $id_ordine): array
    {
        $righe = $this->ordiniRepo->visualizzaUnOrdine($id_ordine); // array denormalizzato: una riga per voce

        if (count($righe) === 0) {
            throw new \RuntimeException("Ordine {$id_ordine} non trovato o senza voci comanda"); // → 404
        }

        $testata = $righe[0]; // dati di testata ripetuti su ogni riga, prendo dalla prima

        // raggruppo le voci per tipo: piatto → cucina, bevanda → bar
        $perTipo = ['piatto' => [], 'bevanda' => []];
        foreach ($righe as $riga) {
            $tipo = $riga['tipo'] ?? 'piatto'; // fallback prudente se mai mancasse
            $perTipo[$tipo][] = $riga;
        }

        $percorsi = [];
        foreach ($perTipo as $tipo => $voci) {
            if (count($voci) === 0) {
                continue; // niente piatti o niente bevande: non genero un file vuoto
            }
            $destinazione = $tipo === 'piatto' ? 'CUCINA' : 'BAR';
            $testo = $this->formattaComanda($testata, $voci, $destinazione);
            $percorsi[] = $this->salvaSuFile($id_ordine, $testo, strtolower($destinazione));
        }

        return $percorsi;
    }

    private function formattaComanda(array $testata, array $voci, string $destinazione): string
    {
        $righe = [];
        $righe[] = str_repeat('=', 32);
        $righe[] = "  {$destinazione}";
        $righe[] = "  ORDINE #{$testata['id_ordine']}";
        $righe[] = "  Tavolo/i: {$testata['numeri_tavoli']}";
        $righe[] = "  {$testata['data_e_ora']}";
        $righe[] = str_repeat('=', 32);

        $momentoCorrente = null;
        foreach ($voci as $voce) {
            if ($voce['id_momento'] !== $momentoCorrente) {
                $momentoCorrente = $voce['id_momento'];
                $righe[] = '';
                $righe[] = "[{$voce['nome_momento']}]"; // es. "prima portata", "dolci", "prioritario"
            }
            $righe[] = "  {$voce['quantita']}x {$voce['nome']}";
            if (!empty($voce['note'])) {
                $righe[] = "     nota: {$voce['note']}";
            }
        }

        $righe[] = str_repeat('=', 32);
        return implode("\n", $righe) . "\n";
    }

    private function salvaSuFile(int $id_ordine, string $testo, string $suffisso): string
    {
        $percorso = rtrim($this->dirStampe, '/') . "/ordine_{$id_ordine}_{$suffisso}_" . date('Ymd_His') . '.txt';

        if (file_put_contents($percorso, $testo) === false) {
            $this->logger->error("Scrittura file stampa fallita per ordine {$id_ordine} ({$suffisso}) in {$percorso}");
            throw new \Exception("Impossibile salvare il file di stampa ({$suffisso})."); // → 500
        }

        $this->logger->info("Comanda TXT [{$suffisso}] generata per ordine {$id_ordine}: {$percorso}");
        return $percorso;
    }
}