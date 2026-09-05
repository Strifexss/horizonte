import React from 'react';
import { Trash2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmDeleteModal({
    open,
    onOpenChange,
    title = 'Excluir parcela',
    description = 'Esta ação não pode ser desfeita. A parcela será removida permanentemente.',
    confirmLabel = 'Excluir',
    cancelLabel = 'Cancelar',
    processing = false,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    processing?: boolean;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:h-auto md:w-[420px] max-w-full overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-600" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-row gap-2 mt-4">
                    <DialogClose asChild>
                        <Button
                            className="w-full"
                            variant="secondary"
                            type="button"
                            disabled={processing}
                            onClick={() => onOpenChange(false)}
                        >
                            {cancelLabel}
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        className="ml-2 w-full"
                        variant="destructive"
                        loading={processing}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
