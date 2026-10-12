import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type ReactNode } from 'react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    titulo: string;
    descricao: ReactNode;
    textoConfirmar: string;
    variante: 'destructive' | 'default';
    processing: boolean;
    onConfirmar: () => void;
};

export default function UsuariosConfirm({ open, onOpenChange, titulo, descricao, textoConfirmar, variante, processing, onConfirmar }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                    <DialogDescription asChild>
                        <div>{descricao}</div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary" disabled={processing}>
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button variant={variante} onClick={onConfirmar} disabled={processing}>
                        {textoConfirmar}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
