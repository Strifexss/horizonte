import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Props = {
    url: string;
    suporteWhatsapp: string | null;
};

export default function ConfiguracoesSuporteForm({ url, suporteWhatsapp }: Props) {
    const { data, setData, put, processing, errors } = useForm({ suporte_whatsapp: suporteWhatsapp ?? '' });

    function salvar(evento: FormEvent<HTMLFormElement>): void {
        evento.preventDefault();
        put(url, { preserveScroll: true });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Suporte</CardTitle>
                <CardDescription>O Copiloto mostra este WhatsApp quando não sabe responder e quando alguém quer contratar um módulo.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={salvar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="suporte_whatsapp">WhatsApp do suporte</Label>
                        <Input
                            id="suporte_whatsapp"
                            inputMode="numeric"
                            value={data.suporte_whatsapp}
                            onChange={(evento) => setData('suporte_whatsapp', evento.target.value)}
                            placeholder="DDD + número, ex.: 83988003516"
                        />
                        <p className="text-muted-foreground text-xs">Só números, com DDD e sem o 55. Em branco, o Copiloto não indica contato.</p>
                        <InputError message={errors.suporte_whatsapp} />
                    </div>
                    <Button type="submit" variant="primary" disabled={processing} className="sm:mb-6">
                        Salvar
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
