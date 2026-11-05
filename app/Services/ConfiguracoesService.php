<?php

namespace App\Services;

use App\DTO\ConfiguracoesDTO;
use App\Models\Configuracao;
use App\Repositories\Interfaces\ConfiguracaoRepositoryInterface;
use App\Services\Interfaces\ConfiguracoesServiceInterface;
use Illuminate\Support\Facades\Cache;

class ConfiguracoesService implements ConfiguracoesServiceInterface
{
    private const CACHE_PREFIXO = 'configuracao:';

    public function __construct(
        private ConfiguracaoRepositoryInterface $configuracaoRepository
    ) {}

    public function whatsappSuporte(): ?string
    {
        $numero = Cache::rememberForever(
            self::CACHE_PREFIXO.Configuracao::SUPORTE_WHATSAPP,
            fn (): string => (string) $this->configuracaoRepository->valor(Configuracao::SUPORTE_WHATSAPP)
        );

        return $numero === '' ? null : $numero;
    }

    public function linkWhatsappSuporte(?string $mensagem = null): ?string
    {
        $numero = $this->whatsappSuporte();

        if ($numero === null) {
            return null;
        }

        $link = 'https://wa.me/55'.$numero;

        return $mensagem === null ? $link : $link.'?text='.rawurlencode($mensagem);
    }

    public function atualizar(ConfiguracoesDTO $dados): void
    {
        $numero = preg_replace('/\D/', '', (string) $dados->suporte_whatsapp);

        $this->configuracaoRepository->definir(Configuracao::SUPORTE_WHATSAPP, $numero === '' ? null : $numero);
        Cache::forget(self::CACHE_PREFIXO.Configuracao::SUPORTE_WHATSAPP);
    }
}
