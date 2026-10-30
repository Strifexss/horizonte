import InputError from '@/components/input-error';
import type { ConfiguracaoPagina } from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone } from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';

type Props = {
    idBase: string;
    configuracao: ConfiguracaoPagina;
    erros: Record<string, string | undefined>;
    onConfig: (campos: Partial<ConfiguracaoPagina>) => void;
};

export function linkValido(link: string | null | undefined): boolean {
    return /^https:\/\/\S+\.\S+/.test(link ?? '');
}

export default function MenuBoardsConteudoAviso({ idBase, configuracao, erros, onConfig }: Props) {
    const [testando, setTestando] = useState(false);
    const link = configuracao.qr_link ?? '';
    const valido = linkValido(link);
    const erroLink = erros['configuracao.qr_link'] ?? (link && !valido ? 'Use um endereço que comece com https://' : undefined);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <h3 className="text-[15px] font-semibold">Texto do aviso</h3>
                <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div className="grid gap-2">
                        <Label htmlFor={`${idBase}-titulo`}>Título</Label>
                        <textarea
                            id={`${idBase}-titulo`}
                            rows={2}
                            maxLength={60}
                            value={configuracao.titulo ?? ''}
                            onChange={(event) => onConfig({ titulo: event.target.value })}
                            placeholder={'Ex.: Gostou?\nAvalie a gente!'}
                            className="border-input rounded-md border bg-transparent px-3 py-2 text-base shadow-xs md:text-sm"
                        />
                        <span className="text-muted-foreground text-xs">Até 60 caracteres. Use Enter para quebrar a linha.</span>
                        <InputError message={erros['configuracao.titulo']} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${idBase}-texto`}>
                            Texto de apoio <span className="text-muted-foreground font-normal">(opcional)</span>
                        </Label>
                        <Input
                            id={`${idBase}-texto`}
                            maxLength={120}
                            value={configuracao.texto ?? ''}
                            onChange={(event) => onConfig({ texto: event.target.value })}
                            placeholder="Ex.: Aponte a câmera do celular para o QR Code."
                            className="h-11 text-base md:h-10 md:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-[15px] font-semibold">QR Code</h3>
                    <label className="flex min-h-11 items-center gap-2.5 text-sm">
                        <Checkbox checked={Boolean(configuracao.qr_ativo)} onCheckedChange={(marcado) => onConfig({ qr_ativo: marcado === true })} />
                        Mostrar QR Code na página
                    </label>
                </div>

                {configuracao.qr_ativo ? (
                    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <div className="grid gap-2">
                            <Label htmlFor={`${idBase}-qr-link`}>Link</Label>
                            <Input
                                id={`${idBase}-qr-link`}
                                type="url"
                                inputMode="url"
                                value={link}
                                onChange={(event) => onConfig({ qr_link: event.target.value })}
                                placeholder="Ex.: https://g.page/r/sua-loja/review"
                                aria-invalid={Boolean(erroLink)}
                                className="h-11 text-base md:h-10 md:text-sm"
                            />
                            <span className="text-muted-foreground text-xs">
                                Avaliação no Google, Instagram, cardápio online… precisa começar com https://
                            </span>
                            <InputError message={erroLink} />
                        </div>
                        {valido ? (
                            <p className="rounded-lg bg-sky-50 p-3 text-[13px] break-all text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                                O QR vai abrir: <strong>{link}</strong>
                            </p>
                        ) : null}
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="grid min-w-0 flex-[1_1_240px] gap-2">
                                <Label htmlFor={`${idBase}-qr-legenda`}>
                                    Legenda abaixo do QR <span className="text-muted-foreground font-normal">(opcional)</span>
                                </Label>
                                <Input
                                    id={`${idBase}-qr-legenda`}
                                    maxLength={40}
                                    value={configuracao.qr_legenda ?? ''}
                                    onChange={(event) => onConfig({ qr_legenda: event.target.value })}
                                    placeholder="Ex.: Avalie a gente no Google"
                                    className="h-11 text-base md:h-10 md:text-sm"
                                />
                            </div>
                            <Button type="button" variant="outline" className="h-11 md:h-10" disabled={!valido} onClick={() => setTestando(true)}>
                                <Smartphone />
                                Testar com o celular
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>

            <Dialog open={testando} onOpenChange={setTestando}>
                <DialogContent className="w-[calc(100vw-1rem)] md:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Teste com o seu celular</DialogTitle>
                        <DialogDescription>Aponte a câmera para o código. Ele deve abrir:</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm font-semibold break-all">{link}</p>
                    <div className="mx-auto w-full max-w-72 rounded-xl border p-4">
                        <QRCode value={link || ' '} level="M" size={256} viewBox="0 0 256 256" style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="primary" className="h-11 w-full justify-center md:h-10" onClick={() => setTestando(false)}>
                            Pronto
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
