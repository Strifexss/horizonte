import { cn } from '@/lib/utils';

type LandingPrintProps = {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    /** No celular o print vira um recorte ampliado (proporção e foco), porque a tela inteira do desktop fica ilegível. */
    recorteMobile?: string;
};

export default function LandingPrint({ src, alt, className, priority = false, recorteMobile = 'aspect-[4/5] object-[30%_0%]' }: LandingPrintProps) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-blue-600/10 sm:p-2.5 sm:shadow-2xl dark:border-slate-800 dark:bg-slate-900',
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
                className={cn('block w-full rounded-lg object-cover sm:aspect-auto sm:h-auto sm:object-center', recorteMobile)}
            />
        </div>
    );
}
