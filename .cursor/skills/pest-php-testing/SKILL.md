---
name: pest-php-testing
description: >-
  Cria, refatora e valida testes com Pest PHP em projetos Laravel: funções it()/test(),
  expectativas fluentes, tipagem forte, testes de arquitetura e checagem no terminal
  antes de encerrar a tarefa. Use when creating, refactoring, or running Pest tests,
  or when editing tests/**/*.php or app/**/*.php.
---

# Pest PHP Testing Specialist

## Objetivo

Garantir que todo código de produção e suíte de testes sigam o padrão declarativo do Pest PHP, mantendo alta cobertura, tipagem forte, testes de arquitetura e validação automatizada via terminal antes de finalizar qualquer tarefa.

Desenho do que testar (comportamento, isolamento, dados): skill `testing-best-practices`. Esta skill cobre a sintaxe Pest e o fechamento no terminal.

## Diretrizes Gerais de Sintaxe (Pest Standard)

### 1. Estilo de Teste

- **Sempre** use funções globais do Pest (`it(...)` ou `test(...)`).
- Prefira a convenção em inglês iniciando com ação: `it('registers a new user with valid payload', function () { ... });`.
- **NUNCA** declare classes no formato PHPUnit (`class UserTest extends TestCase`).

Feature tests deste projeto já estendem `Tests\TestCase` e usam `RefreshDatabase` em `tests/Pest.php`. Não repita isso no arquivo de teste.

### 2. Asserções Fluentes (`expect`)

- Prefira a API de expectativas fluentes em vez de métodos legados:

```php
// Recomendado (Pest)
expect($user->is_active)->toBeTrue();
expect($response->json('data'))->toHaveCount(3);
expect($user->email)->toBe('user@example.com');

// Evitar (Sintaxe Legada)
$this->assertTrue($user->is_active);
$this->assertCount(3, $response->json('data'));
```

Asserções HTTP do Laravel no teste de feature permanecem no response: `assertRedirect`, `assertSessionHas`, `assertForbidden`. O valor observado depois da request vai para `expect()`.

### 3. Tipagem forte

- Feche o teste com retorno `void`: `function (): void`.
- Tipar helpers em `tests/Pest.php` e argumentos de `dataset`.
- Não usar `mixed` nem suprimir o tipo do valor sob teste para fazer a asserção passar.

```php
it('registers a new user with valid payload', function (): void {
    $user = User::factory()->create();

    expect($user->email)->toBeString()->not->toBeEmpty();
});
```

### 4. Testes de arquitetura

O Horizonte não tem `pestphp/pest-plugin-arch` instalado. Não adicione o pacote sem pedido explícito. Enquanto `arch()` não existir no projeto, não escreva chamadas a `arch()`.

Quando o plugin estiver instalado, declare a regra do diretório inteiro com `arch()`, não com um teste que só abre um arquivo:

```php
arch('controllers do not use eloquent')
    ->expect('App\Http\Controllers')
    ->not->toUse('Illuminate\Database\Eloquent\Model');
```

Até lá, a fronteira de camadas continua a da skill `estrutura-padrao`: query só no repository, regra só no service, controller só recebe e responde.

### 5. Cobertura do comportamento alterado

- Um `it()` por comportamento observável. Nome descreve a ação e o resultado.
- Cubra o caminho feliz e cada falha de alto valor da mudança (validação, autorização, escopo de `usuario_id`).
- Feature test para o que passa por request. Unit test só para lógica sem framework.
- Leia os testes vizinhos e copie a estrutura deles.
- Crie o arquivo com `php artisan make:test --pest {Nome} --no-interaction`. Não coloque `Feature/` nem `Unit/` no nome; use `--unit` para unitário.

### 6. Validação no terminal

Antes de declarar a tarefa concluída:

1. `vendor/bin/pint --dirty --format agent` se houve PHP alterado.
2. O recorte afetado: `php artisan test --compact` com o caminho do arquivo ou `--filter=`.
3. Corrija as falhas e rode de novo. Só encerre com a suíte do recorte verde.

Não rode a suíte inteira no lugar do recorte. Peça ao usuário `php artisan test --compact` depois que o recorte passar.
