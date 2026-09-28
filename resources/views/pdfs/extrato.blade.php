<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Extrato</title>
    <style>
        /* Fonte reduzida para caber todas as colunas no PDF */
        body { font-family: "DejaVu Sans", Arial, sans-serif; font-size: 10px; color: #222; }
        .header { text-align: center; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; word-wrap: break-word; }
        th, td { border: 1px solid #ddd; padding: 4px 6px; vertical-align: top; }
        th { background: #f5f5f5; font-weight: 600; font-size: 9px; }
        td { font-size: 9.5px; }
        .text-right { text-align: right; }
        .muted { color: #666; font-size: 9px; }
        /* Ajustes para truncar texto muito longo em células */
        td { overflow: hidden; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Extrato Financeiro</h2>
        <div class="muted">Gerado em: {{ now()->format('d/m/Y H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>DATA</th>
                <th>DESCRIÇÃO</th>
                <th>PRODUTO</th>
                <th>QTD</th>
                <th>FORNECEDOR</th>
                <th>CATEGORIA</th>
                <th>CONTA</th>
                <th class="text-right">VALOR</th>
                <th class="text-right">PAGO</th>
                <th>STATUS</th>
            </tr>
        </thead>
        <tbody>
            @foreach($parcelas as $p)
                @php
                    $data = $p->data_competencia ?? $p->data_vencimento;
                    $valor = number_format($p->valor ?? 0, 2, ',', '.');
                    $valorPago = number_format($p->valor_pago ?? 0, 2, ',', '.');
                    $isReceita = strtoupper($p->financeiro->tipo ?? '') === 'RECEITA';
                    $status = (!$p->valor_pago || $p->valor_pago == 0) ? 'ABERTO' : (($p->valor_pago >= $p->valor) ? 'PAGO' : 'PARCIAL');
                    $produtoLabel = $p->produto->nome ?? '';
                    if (!empty($p->produto->grupo->nome ?? '')) {
                        $produtoLabel = $produtoLabel ? ($produtoLabel . ' - ' . $p->produto->grupo->nome) : $p->produto->grupo->nome;
                    }
                    $fornecedor = $p->produto->fornecedor->nome ?? $p->fornecedor->nome ?? '';
                @endphp
                <tr>
                    <td>{{ \Illuminate\Support\Str::of($data?->toDateString() ?? '')->replace('-', '/')->__toString() ? \Carbon\Carbon::parse($data)->format('d/m/Y') : '' }}</td>
                    <td>{{ $p->descricao }}</td>
                    <td>{{ $produtoLabel }}</td>
                    <td class="text-right">{{ $p->quantidade ?? '-' }}</td>
                    <td>{{ $fornecedor }}</td>
                    <td>{{ $p->categoria->nome ?? '' }}</td>
                    <td>{{ $p->conta->nome ?? '' }}</td>
                    <td class="text-right">{{ $valor }}</td>
                    <td class="text-right">{{ $valorPago }}</td>
                    <td>{{ $status }}</td>
                    {{-- coluna de parcela removida do PDF --}}
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top:12px; font-size:12px;">
        <strong>Total registros:</strong> {{ count($parcelas) }}<br>
        <strong>Entradas:</strong> {{ number_format($resumo['total_credits'] ?? 0, 2, ',', '.') }} &nbsp;&nbsp;
        <strong>Saídas:</strong> {{ number_format($resumo['total_debits'] ?? 0, 2, ',', '.') }}
    </div>
</body>
</html>

