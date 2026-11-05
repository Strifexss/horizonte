# Copiloto — chat de ajuda

Status: resolved

## Problema

Quem usa o Horizonte não tem onde tirar dúvida de uso dentro do app. O módulo pago `copiloto` só entrega insights no Dashboard.

## Decisões (sessão de grilling, 2026-11-05)

### Produto
- **Copiloto** é o chat de ajuda: gratuito, para toda Empresa e todo papel, sem depender de módulo.
- O módulo `copiloto` passa a ser exibido como **Copiloto Pro**. Hoje ele libera os insights do Dashboard; no futuro, a análise de dados no chat. A chave interna `copiloto` não muda.
- Escopo: só dúvidas de uso. Pergunta sobre valores, ou fora do sistema, recebe recusa educada com a tela certa. Quando a ajuda não cobre o assunto, o Copiloto diz que não sabe e oferece o WhatsApp do suporte.
- Aviso fixo no chat: "O Copiloto pode errar. Não digite senhas ou dados pessoais."

### Conteúdo
- Em toda pergunta, o agente recebe a ajuda **completa** de `resources/ajuda/`, filtrada pelos módulos da Empresa (arquivo e seções `<!-- modulo: x -->`).
- Módulo que a Empresa não tem: o agente recebe o **texto de venda** dele (`resources/ajuda/modulos/<modulo>.md`), nunca a ajuda de uso.
- A tela atual (componente Inertia) vai só como dica ao modelo.
- `AjudaRepositoryInterface::paraPergunta()` já recebe a pergunta. Hoje devolve a ajuda completa; quando a ajuda passar do limite, a implementação vira busca por seção, com embeddings no MySQL, sem mudar o Service.
- Gatilho de troca: teste que falha quando a ajuda passa de `copiloto.limite_tokens_ajuda` (estimativa de 4 caracteres por token), mais o acompanhamento do `Usage`.

### Abertura
- Saudação, campo livre e até 3 perguntas sugeridas da tela atual (`sugestoes:` no frontmatter). Telas sem ajuda usam as sugestões do Início.
- Uma das 3 pode ser **oferta** de módulo que a Empresa não tem (`oferta:` no frontmatter de `modulos/*.md`), com visual próprio, para todo papel e toda vez que o chat abre.
- Tocar numa sugestão envia a pergunta. Tocar na oferta mostra os benefícios e o botão "Quero o <módulo>", que abre o WhatsApp com mensagem pronta e registra o interesse.

### Conversa
- Guarda só a conversa atual (tabelas do `laravel/ai`); o modelo recebe as últimas 20 mensagens.
- "Nova conversa" apaga a anterior. Conversas sem atividade há 30 dias são apagadas por tarefa agendada.
- Resposta inteira (sem streaming), com indicador de digitando.
- O agente devolve saída estruturada `{resposta, respondeu}`. `respondeu: false` registra a pergunta (pergunta, data, Empresa; sem usuário) para o admin.

### Técnico
- Controller → `CopilotoService` → Repositories. O Service só conhece interfaces.
- `CopilotoAgenteInterface`: a implementação `LaravelAiCopilotoAgente` é a única classe que conhece o `laravel/ai`. `FakeCopilotoAgente` responde sem IA (local e prints), ligado por `COPILOTO_AGENTE=fake`.
- O agente recebe uma lista de tools, hoje vazia: ponto de extensão do Copiloto Pro. Tools de dados futuras recebem Empresa e usuário da sessão, nunca da IA.
- O `continue()` do SDK não confere o dono da conversa. O Service confere sempre.
- Limites: 10 perguntas por minuto e 100 por dia por usuário (`config/copiloto.php`). O limite global da chave de IA é compartilhado com os insights (mesma chave do `RateLimited('insights-ia')`).
- Configurações no admin: tabela `configuracao` (chave → valor) e tela "Configurações". Começa com o WhatsApp do suporte `83988003516` (10 ou 11 dígitos, aberto via `wa.me/55…`). Vazio: sem botão de suporte.
- Acesso: headset no header, ao lado de Novidades. Desktop: painel lateral; celular: modal em tela cheia (contrato "Modal no mobile").
- Produção usa a chave do Gemini em plano pago, com orçamento e alerta. O gratuito serve só para piloto.

## Fora desta versão
Lista de conversas anteriores, streaming, 👍/👎, busca semântica e tools de dados do Copiloto Pro.

## Issues
`issues/01` a `issues/05`.
