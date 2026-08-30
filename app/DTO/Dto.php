<?php

namespace App\DTO;

/**
 * Classe base simples para DTOs.
 *
 * Uso:
 * class MyDto extends Dto { public ?int $id = null; public string $name = ''; }
 * $dto = MyDto::fromArray($data);
 * $all = $dto->all();
 */
class Dto
{
    /**
     * Cria uma instância do DTO preenchendo apenas propriedades públicas existentes
     * cujo nome bate com as chaves do array.
     *
     * @param array<string,mixed> $data
     * @return static
     */
    public static function fromArray(array $data): static
    {
        $instance = new static();

        foreach ($data as $key => $value) {
            if (property_exists($instance, $key)) {
                $instance->$key = $value;
            }
        }

        return $instance;
    }

    /**
     * Retorna todas as propriedades públicas que foram setadas (não nulas).
     *
     * @return array<string,mixed>
     */
    public function all(): array
    {
        $vars = get_object_vars($this);

        return array_filter(
            $vars,
            fn ($v) => $v !== null
        );
    }
}

