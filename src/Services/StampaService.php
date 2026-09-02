<?php
declare(strict_types=1);
namespace App\Services;
use App\Repositories\ScontrinoRepositories;
use App\Repositories\OrdiniRepositories;

class StampaService
{
    public function __construct(
        private OrdiniRepositories $ordiniRepo,
        private LoggerService $logger,
        private ScontrinoRepositories $scontrinoRepo,
        private string $dirStampe // path assoluta, iniettata da bootstrap.php (es. storage/logs/stampe)
    ) {}


    //capisce se è una stampa o una ristampa
    public function stampaScontrino(int $idScontrino): string
{
    $ristampa = $this->esisteStampaScontrino($idScontrino);

    return $this->generaScontrinoTxt(
        $idScontrino,
        $ristampa
    );
}
    /**
     * Genera un file .txt separato per cucina (piatti) e bar (bevande).
     */
    public function generaComandaTxt(int $id_ordine, bool $isModifica = false): array
{
    $righe = $this->ordiniRepo->visualizzaUnOrdine($id_ordine);
    if (count($righe) === 0) {
        throw new \RuntimeException("Ordine {$id_ordine} non trovato o senza voci comanda");
    }
    $testata = $righe[0];
    $perTipo = ['piatto' => [], 'bevanda' => []];
    foreach ($righe as $riga) {
        $tipo = $riga['tipo'] ?? 'piatto';
        $perTipo[$tipo][] = $riga;
    }
    $percorsi = [];
    foreach ($perTipo as $tipo => $voci) {
        if (count($voci) === 0) {
            continue;
        }
        $destinazione = $tipo === 'piatto' ? 'CUCINA' : 'BAR';
        $testo = $this->formattaComanda($testata, $voci, $destinazione, $isModifica);
        $percorsi[] = $this->salvaSuFile($id_ordine, $testo, strtolower($destinazione));
    }
    return $percorsi;
}

public function generaScontrinoTxt(int $id_scontrino ,bool $ristampa = false, bool $storno = false ): string
{
    // 1. Recupero dati scontrino tramite il serviceScontrino nella stessa cartella
    $dati = $this->scontrinoRepo->recuperaUnScontrinoConDettaglio($id_scontrino);    
    if (empty($dati)) {
        throw new \RuntimeException("Scontrino {$id_scontrino} non trovato");
    }

    $testo = $this->formattaScontrino($dati,$ristampa,$storno);

    $suffisso = $storno
        ? 'storno'
        : ($ristampa ? 'ristampa' : 'emesso');
    
    return $this->salvaSuFile($id_scontrino, $testo, $suffisso ,true);
}

private function formattaScontrino(array $dati, bool $ristampa = false, bool $storno = false): string
{
    $righe = [];
    if ($storno) {
        $righe[] = "  *** STORNO ***"; // riga in più solo se è una modifica
    }
    if ($ristampa) {
        $righe[] = "  *** RICEVUTA NON FISCALE - RISTAMPA ***"; // riga in più solo se è una modifica
    }else{
        $righe[] = "        RICEVUTA FISCALE";    
    }
    $righe[] = "Scontrino #: " . $dati['id_scontrino'];
    $righe[] = str_repeat('-', 32);
    $righe[] = "Data: " . $dati['data_e_ora_pagamento'];
    $righe[] = str_repeat('-', 32);

    $totaleImposta = 0;

    foreach ($dati['items'] as $item) {
            $quantita =(int) $item['quantita'];
            $prezzo =(float) $item['prezzo_unitario_storico'];
            $aliquota =(float) $item['aliquota_iva_storica'];
            $subtotale =$quantita * $prezzo;
            /*
             * Se prezzo_unitario_storico è IVA inclusa,
             * l'IVA va scorporata.
             */
            $iva =$subtotale *$aliquota /(100 + $aliquota);
            $totaleImposta += $iva;
            $righe[] = sprintf("%d x %-15s %8.2f",$quantita,substr((string) $item['nome'],0,15),$subtotale);
            $righe[] = sprintf(
                "   IVA %.2f%% %15.2f",
                $aliquota,
                $iva
            );
        }
        $righe[] =str_repeat('-', 32);
        $righe[] = sprintf(
            "TOTALE IVA: %18.2f",
            $totaleImposta
        );
        $righe[] = sprintf(
            "TOTALE: %24.2f",
            (float) $dati['totale']
        );
        $righe[] =
            str_repeat('=', 32);
        return implode("\n", $righe) . "\n";
    }



private function formattaComanda(array $testata, array $voci, string $destinazione, bool $isModifica = false): string
{
    $righe = [];
    $righe[] = str_repeat('=', 32);
    $righe[] = "  {$destinazione}";
    if ($isModifica) {
        $righe[] = "  *** ORDINE MODIFICATO ***"; // riga in più solo se è una modifica
    }
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

    //verifica se il file esiste già.
    public function esisteStampaScontrino(int $idScontrino): bool
    {
        $pattern = rtrim($this->dirStampe, DIRECTORY_SEPARATOR)
            . DIRECTORY_SEPARATOR
            . "scontrino_{$idScontrino}_emesso_*.txt";

        $files = glob($pattern);

        return $files !== false && !empty($files);
    }

    private function salvaSuFile(int $idDocumento, string $testo, string $suffisso , bool $scontrino= false): string
    {
        $prefisso =$scontrino? 'scontrino': 'ordine';
        $nomeFile ="{$prefisso}_{$idDocumento}_{$suffisso}_" .date('Ymd_His') .'.txt';
        $percorso =rtrim(
                $this->dirStampe,DIRECTORY_SEPARATOR) .DIRECTORY_SEPARATOR .$nomeFile;
        if (file_put_contents($percorso,$testo,LOCK_EX) === false) {
            $this->logger->error(
                "Scrittura file stampa fallita: {$percorso}"
            );
            throw new \RuntimeException(
                "Impossibile salvare il file di stampa {$nomeFile}"
            );
        }
        $this->logger->info(
            "File stampa generato: {$percorso}"
        );
        return $percorso;
    }
}

