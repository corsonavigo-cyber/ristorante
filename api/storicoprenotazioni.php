<?php
declare(strict_types=1);

require_once __DIR__ . '/../public/bootstrap.php';

header('Content-Type: application/json');

$type = $_GET['type'] ?? null;

try {
    match ([$_SERVER['REQUEST_METHOD'], $type]) {
        ['GET', 'storico'] => (function () use ($leggiStoricoService) {
            http_response_code(200);
            echo json_encode(['data' => $leggiStoricoService->ottieniStorico()]);
        })(),
        ['GET', 'ordinistorico'] => (function () use ($leggiStoricoOrdiniService) {
            http_response_code(200);
            echo json_encode(['data' => $leggiStoricoOrdiniService->ottieniStorico()]);
        })(),
        default => throw new \InvalidArgumentException('Endpoint non valido'),
    };
} catch (\ValueError $e) {
    http_response_code(422);
    echo json_encode(['data' => $e->getMessage()]);
} catch (\InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['data' => $e->getMessage()]);
} catch (\RuntimeException $e) {
    http_response_code(404);
    echo json_encode(['data' => $e->getMessage()]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['data' => $e->getMessage()]);
}