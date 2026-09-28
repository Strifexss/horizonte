<?php

namespace App\Http\Controllers;

use App\DTO\FinanceiroSearchDTO;
use App\Http\Requests\FinanceiroSearchRequest;
use App\Services\Interfaces\ExtratoServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;

class ExtratoPdfController extends Controller
{
    public function __construct(private ExtratoServiceInterface $extratoService) {}

    public function __invoke(FinanceiroSearchRequest $request)
    {
        $filters = FinanceiroSearchDTO::fromArray($request->validated());

        $parcelas = $this->extratoService->export($filters);
        $resumo = $this->extratoService->resumo($filters);

        $fileName = 'extrato-'.now()->format('Ymd-His').'.pdf';

        return Pdf::loadView('pdfs.extrato', [
            'parcelas' => $parcelas,
            'resumo' => $resumo,
            'filters' => $filters->all(),
        ])->download($fileName);
    }
}
