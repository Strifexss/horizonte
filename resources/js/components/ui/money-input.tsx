import * as React from 'react';
import { cn } from '@/lib/utils';

type MoneyInputProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> & {
    value?: number | string | null;
    onValueChange?: (value: number | null) => void;
    showSymbol?: boolean;
};

function toDigitsFromValue(v: number | string | null | undefined): string {
    if (v === null || v === undefined || v === '') return '';
    const s = typeof v === 'number' ? v.toFixed(2) : String(v).replace(',', '.');
    const parts = s.split('.');
    const intPart = parts[0].replace(/\D/g, '') || '0';
    const decPart = (parts[1] || '').replace(/\D/g, '');
    const dec = decPart.padEnd(2, '0').slice(0, 2);
    return (intPart + dec).replace(/^0+(?=\d)/, '');
}

function formatFromDigits(digits: string, showSymbol = false) {
    const d = digits.replace(/\D/g, '');
    const padded = d.padStart(3, '0');
    const len = d.length;
    const cents = d.slice(-2);
    const whole = d.slice(0, -2) || '0';
    const wholeFormatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formatted = `${wholeFormatted},${cents}`;
    return showSymbol ? `R$ ${formatted}` : formatted;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ className, value, onValueChange, showSymbol = false, disabled, ...props }, ref) => {
        const [digits, setDigits] = React.useState<string>(() => toDigitsFromValue(value));

        React.useEffect(() => {
            setDigits(toDigitsFromValue(value));
        }, [value]);

        const propagate = React.useCallback(
            (newDigits: string) => {
                setDigits(newDigits);
                const d = newDigits.replace(/\D/g, '');
                if (!d) {
                    onValueChange?.(null);
                    return;
                }
                const num = parseInt(d, 10) / 100;
                onValueChange?.(Number(num.toFixed(2)));
            },
            [onValueChange],
        );

        const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
            if (disabled) return;
            const k = e.key;
            if (k === 'Backspace') {
                e.preventDefault();
                const next = digits.slice(0, -1);
                propagate(next);
                return;
            }
            if (/^\d$/.test(k)) {
                e.preventDefault();
                const next = (digits + k).replace(/^0+(?=\d)/, '');
                propagate(next);
                return;
            }
            // allow navigation keys, tab, enter
            if (
                k === 'Tab' ||
                k === 'ArrowLeft' ||
                k === 'ArrowRight' ||
                k === 'ArrowUp' ||
                k === 'ArrowDown' ||
                k === 'Home' ||
                k === 'End' ||
                k === 'Enter'
            ) {
                return;
            }
            // block other keys
            e.preventDefault();
        };

        const onPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
            if (disabled) return;
            e.preventDefault();
            const text = e.clipboardData.getData('text');
            const onlyDigits = text.replace(/\D/g, '');
            if (!onlyDigits) return;
            const next = (digits + onlyDigits).replace(/^0+(?=\d)/, '');
            propagate(next);
        };

        const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
            if (disabled) return;
            const text = e.target.value || '';
            // extract digits from any input (handles mobile keyboards)
            const onlyDigits = text.replace(/\D/g, '');
            const next = onlyDigits.replace(/^0+(?=\d)/, '');
            propagate(next);
        };

        const display = digits ? formatFromDigits(digits, showSymbol) : '';

        return (
            <input
                {...props}
                ref={ref}
                value={display}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onChange={onChange}
                inputMode="numeric"
                pattern="[0-9]*"
                readOnly={false}
                disabled={disabled}
                className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    className,
                )}
            />
        );
    },
);

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;

