import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

type FlashPageProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
    };
};

export function useFlashToast() {
    const { flash } = usePage<FlashPageProps>().props;

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
    }, [flash?.success, flash?.error, flash?.warning]);
}
