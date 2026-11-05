import { cn } from '@/lib/utils';
import * as React from 'react';

type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
};

/** Interruptor liga/desliga (role="switch"), para opções que valem na hora, como "ativo" ou "favorito". */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({ checked, onCheckedChange, className, disabled, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
            'focus-visible:ring-ring ring-offset-background relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary' : 'bg-input',
            className,
        )}
        {...props}
    >
        <span
            aria-hidden="true"
            className={cn('bg-background pointer-events-none block size-5 rounded-full shadow-sm transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')}
        />
    </button>
));
Switch.displayName = 'Switch';

export { Switch };
