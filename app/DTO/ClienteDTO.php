<?php

namespace App\DTO;

class ClienteDTO extends Dto
{
    public string $nome;

    public ?string $telefone = null;

    public ?string $documento = null;

    public ?string $email = null;

    public ?string $observacao = null;

    public bool $ativo = true;

    public ?int $usuario_id = null;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        $data['nome'] = trim((string) ($data['nome'] ?? ''));

        foreach (['telefone', 'documento', 'email', 'observacao'] as $campo) {
            $valor = trim((string) ($data[$campo] ?? ''));
            $data[$campo] = $valor === '' ? null : $valor;
        }

        $data['ativo'] = filter_var($data['ativo'] ?? true, FILTER_VALIDATE_BOOLEAN);

        if (isset($data['usuario_id']) && $data['usuario_id'] !== '') {
            $data['usuario_id'] = (int) $data['usuario_id'];
        }

        return parent::fromArray($data);
    }

    /**
     * Campos para gravar, incluindo os opcionais vazios (que `all()` descartaria).
     *
     * @return array<string, mixed>
     */
    public function paraGravar(): array
    {
        return [
            'nome' => $this->nome,
            'telefone' => $this->telefone,
            'documento' => $this->documento,
            'email' => $this->email,
            'observacao' => $this->observacao,
            'ativo' => $this->ativo,
            ...($this->usuario_id !== null ? ['usuario_id' => $this->usuario_id] : []),
        ];
    }
}
