<?php

namespace App\Enums;

enum Tipo: string {
    case piatto = 'piatto';
    case bevanda = 'bevanda';
    case servizio = 'servizio';
    case altro = 'altro';
}

?>