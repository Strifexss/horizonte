import { cn } from '@/lib/utils';

type LandingPrintProps = {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
};

export default function LandingPrint({ src, alt, className, priority = false }: LandingPrintProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl shadow-blue-600/10 dark:border-slate-800 dark:bg-slate-900',
                className,
            )}
        >
            <img
                src={src}
                alt={alt}
                width={1440}
                height={900}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                className="block h-auto w-full rounded-lg"
            />
        </div>
    );
}
