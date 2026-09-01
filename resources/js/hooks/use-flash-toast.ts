import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { usePage } from '@inertiajs/react';

export function useFlashToast() {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash?.success, flash?.error, flash?.warning]);
}
