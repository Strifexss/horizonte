<?php

namespace App\Services\Interfaces;

use Illuminate\Support\Collection;

interface SegmentosServiceInterface extends AbstractServiceInterface
{
    /**
     * Segmentos que aparecem no onboarding.
     */
    public function ativos(): Collection;
}
