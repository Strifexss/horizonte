import ClientesForm from '@/components/clientes/ClientesForm';
import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Button } from '@/components/ui/button';
import type { VendaNamed } from '@/components/vendas/types';
import { Plus } from 'lucide-react';
import { useState } from 'react';

type ClienteOpcao = VendaNamed & { telefone?: string | null; documento?: string | null; padrao?: boolean };

type Props = {
    cliente: VendaNamed;
    onChange: (cliente: VendaNamed) => void;
    clientePadrao: VendaNamed;
    error?: string;
    disabled?: boolean;
};

async function loadClientes(q: string): Promise<ClienteOpcao[]> {
    const res = await fetch(`${route('clientes.autocomplete')}?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
        return [];
    }

    return res.json();
}

function rotulo(opcao: { nome: string }): string {
    const cliente = opcao as ClienteOpcao;
    const detalhe = cliente.padrao ? 'Padrão' : (cliente.telefone ?? cliente.documento);

    return detalhe ? `${cliente.nome} · ${detalhe}` : cliente.nome;
}

/** Cliente da venda: começa no CONSUMIDOR e permite cadastrar um novo sem sair da venda. */
export default function VendaClienteCampo({ cliente, onChange, clientePadrao, error, disabled = false }: Props) {
    const [formOpen, setFormOpen] = useState(false);

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">Cliente</span>
            <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                    <AsyncSelect
                        value={cliente}
                        onChange={(opcao) => onChange(opcao ? { id: Number(opcao.id), nome: opcao.nome } : clientePadrao)}
                        loadOptions={loadClientes}
                        formatOptionText={rotulo}
                        placeholder="Buscar cliente por nome, telefone ou CPF"
                        isClearable={cliente.id !== clientePadrao.id}
                        isDisabled={disabled}
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    aria-label="Cadastrar cliente"
                    title="Cadastrar cliente"
                    disabled={disabled}
                    onClick={() => setFormOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <InputError message={error} />

            <ClientesForm
                open={formOpen}
                onOpenChange={setFormOpen}
                cliente={null}
                only={[]}
                onCreated={(criado) => onChange({ id: criado.id, nome: criado.nome })}
            />
        </div>
    );
}
