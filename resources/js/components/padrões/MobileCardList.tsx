import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

const LONG_PRESS_MS = 1000;
const MOVE_TOLERANCE_PX = 10;

export type MobileCardAction = {
    key: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
    destructive?: boolean;
};

type CardProps = {
    expanded: boolean;
    onToggle: () => void;
    onPress: () => void;
    actions: MobileCardAction[];
    children: ReactNode;
};

/** Toque abre o item; segurar 1s revela a faixa de ações embaixo do card. */
function MobileCard({ expanded, onToggle, onPress, actions, children }: CardProps) {
    const [holding, setHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(false);
    const holdTimer = useRef<number | null>(null);
    const progressTimer = useRef<number | null>(null);
    const origin = useRef<{ x: number; y: number } | null>(null);
    const longPressFired = useRef(false);
    const suppressClick = useRef(false);

    function clearTimers(): void {
        if (holdTimer.current !== null) {
            window.clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }

        if (progressTimer.current !== null) {
            window.clearTimeout(progressTimer.current);
            progressTimer.current = null;
        }
    }

    function cancelHold(): void {
        clearTimers();
        origin.current = null;
        setHolding(false);
        setHoldProgress(false);
    }

    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    function onPointerDown(event: PointerEvent<HTMLButtonElement>): void {
        if (event.button !== 0 || actions.length === 0) {
            return;
        }

        cancelHold();
        longPressFired.current = false;
        origin.current = { x: event.clientX, y: event.clientY };
        setHolding(true);
        progressTimer.current = window.setTimeout(() => setHoldProgress(true), 16);
        holdTimer.current = window.setTimeout(() => {
            holdTimer.current = null;
            longPressFired.current = true;
            origin.current = null;
            setHolding(false);
            setHoldProgress(false);
            onToggle();
        }, LONG_PRESS_MS);
    }

    function onPointerMove(event: PointerEvent<HTMLButtonElement>): void {
        if (!origin.current || holdTimer.current === null) {
            return;
        }

        const dx = Math.abs(event.clientX - origin.current.x);
        const dy = Math.abs(event.clientY - origin.current.y);

        if (dx > MOVE_TOLERANCE_PX || dy > MOVE_TOLERANCE_PX) {
            cancelHold();
        }
    }

    function onPointerUp(): void {
        if (longPressFired.current) {
            suppressClick.current = true;
            longPressFired.current = false;
            window.setTimeout(() => {
                suppressClick.current = false;
            }, 400);
        }

        cancelHold();
    }

    return (
        <article className="border-sidebar-border/70 overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900">
            <button
                type="button"
                className="relative w-full p-3 text-left transition-colors select-none active:bg-slate-50 dark:active:bg-slate-800"
                style={{ WebkitTouchCallout: 'none' }}
                aria-expanded={expanded}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={cancelHold}
                onPointerLeave={cancelHold}
                onClick={() => {
                    if (suppressClick.current) {
                        suppressClick.current = false;
                        return;
                    }

                    onPress();
                }}
            >
                {children}
                {holding ? (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-amber-100 dark:bg-amber-950/60">
                        <span
                            className={`block h-full bg-amber-500 ${holdProgress ? 'w-full' : 'w-0'} transition-[width] duration-1000 ease-linear`}
                        />
                    </span>
                ) : null}
            </button>
            {actions.length > 0 ? (
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="border-sidebar-border/70 flex border-t">
                            {actions.map((action, index) => (
                                <button
                                    key={action.key}
                                    type="button"
                                    className={cn(
                                        'inline-flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium',
                                        index > 0 && 'border-sidebar-border/70 border-l',
                                        action.destructive
                                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                                            : 'hover:bg-accent text-slate-700 dark:text-slate-200',
                                    )}
                                    onClick={action.onClick}
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </article>
    );
}

type Props<T> = {
    items: T[];
    getKey: (item: T, index: number) => string | number;
    renderContent: (item: T) => ReactNode;
    onPress: (item: T) => void;
    actions: (item: T) => MobileCardAction[];
};

export default function MobileCardList<T>({ items, getKey, renderContent, onPress, actions }: Props<T>) {
    const [expandedKey, setExpandedKey] = useState<string | number | null>(null);

    return (
        <div className="flex flex-col gap-2 md:hidden">
            {items.map((item, index) => {
                const key = getKey(item, index);

                return (
                    <MobileCard
                        key={key}
                        expanded={expandedKey === key}
                        onToggle={() => setExpandedKey((current) => (current === key ? null : key))}
                        onPress={() => {
                            setExpandedKey(null);
                            onPress(item);
                        }}
                        actions={actions(item).map((action) => ({
                            ...action,
                            onClick: () => {
                                setExpandedKey(null);
                                action.onClick();
                            },
                        }))}
                    >
                        {renderContent(item)}
                    </MobileCard>
                );
            })}
        </div>
    );
}
