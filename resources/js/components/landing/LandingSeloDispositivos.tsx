import { Monitor, Smartphone } from 'lucide-react';

export default function LandingSeloDispositivos() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Monitor aria-hidden="true" className="size-3.5" />
            <Smartphone aria-hidden="true" className="size-3.5" />
            Computador e celular
        </span>
    );
}
