<?php
namespace App\Enums;

enum Categoria: string {
    case antipasto = 'antipasto';
    case primo     = 'primo';
    case secondo   = 'secondo';
    case dolce   = 'dolce';
    case bevanda_analcolica = 'bevanda_analcolica';
    case bevanda_alcolica = 'bevanda_alcolica';
    case fuori_menu = 'fuori_menu';
    case costo_aggiuntivo = 'costo_aggiuntivo';
    case altro   = 'altro';
}
?>

