import { useCallback, useRef, useState } from 'react';
import { buildExtratoQuery } from '@/components/extrato/extratoQuery';
import type { ExtratoFilters } from '@/components/extrato/types';

export function useExtratoPdf(filters: ExtratoFilters): {
    pdfLoading: boolean;
    handleGeneratePdf: () => void;
} {
    const [pdfLoading, setPdfLoading] = useState(false);
    const pdfTimeoutRef = useRef<number | null>(null);

    const handleGeneratePdf = useCallback(() => {
        if (pdfLoading) {
            return;
        }
        setPdfLoading(true);

        const params = buildExtratoQuery(filters);
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== null && v !== undefined) {
                qs.append(k, String(v));
            }
        });

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.onload = () => {
            if (pdfTimeoutRef.current) {
                clearTimeout(pdfTimeoutRef.current);
                pdfTimeoutRef.current = null;
            }
            setPdfLoading(false);
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        };
        iframe.onerror = () => {
            if (pdfTimeoutRef.current) {
                clearTimeout(pdfTimeoutRef.current);
                pdfTimeoutRef.current = null;
            }
            setPdfLoading(false);
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        };
        iframe.src = route('extrato.pdf') + (qs.toString() ? `?${qs.toString()}` : '');
        document.body.appendChild(iframe);

        if (pdfTimeoutRef.current) {
            clearTimeout(pdfTimeoutRef.current);
        }
        pdfTimeoutRef.current = window.setTimeout(() => {
            setPdfLoading(false);
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
            pdfTimeoutRef.current = null;
        }, 10000);
    }, [filters, pdfLoading]);

    return { pdfLoading, handleGeneratePdf };
}
