import { cn } from '@/lib/utils';

type PrintCelular = {
    src: string;
    alt: string;
};

type LandingPrintProps = {
    src: string;
    alt: string;
    /** Mesma tela no celular, sobreposta ao print do computador: mostra que a funcionalidade existe nos dois. */
    celular?: PrintCelular;
    className?: string;
    priority?: boolean;
};

export function LandingCelular({ src, alt, priority = false, className }: PrintCelular & { priority?: boolean; className?: string }) {
    return (
        <div
            className={cn(
                'rounded-[1.4rem] border-[5px] border-slate-900 bg-slate-900 shadow-2xl shadow-slate-900/30 sm:rounded-[2rem] sm:border-[7px] dark:border-slate-700',
                className,
            )}
        >
            <img
                src={src}
                alt={alt}
                width={540}
                height={1169}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                className="block h-auto w-full rounded-[1.05rem] sm:rounded-[1.55rem]"
            />
        </div>
    );
}

export default function LandingPrint({ src, alt, celular, className, priority = false }: LandingPrintProps) {
    return (
        <figure className={cn('flex items-end', className)}>
            <div
                className={cn(
                    'min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-blue-600/10 sm:rounded-2xl sm:p-2.5 sm:shadow-2xl dark:border-slate-800 dark:bg-slate-900',
                    celular && 'mb-8 sm:mb-12',
                )}
            >
                <img
                    src={src}
                    alt={alt}
                    width={1440}
                    height={900}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    className="block h-auto w-full rounded-md sm:rounded-lg"
                />
            </div>
            {celular ? (
                <LandingCelular {...celular} priority={priority} className="relative z-10 -ml-[16%] w-[32%] flex-none sm:-ml-[12%] sm:w-[22%]" />
            ) : null}
        </figure>
    );
}
