import * as React from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, locale = ptBR, ...props }: CalendarProps) {
    const padrao = getDefaultClassNames();

    return (
        <>
            <style>{`
                .rdp-range_middle { background-color: #fde68a; }
                .rdp-range_middle .rdp-day_button { background-color: #fde68a !important; border-radius: 0; }
                .rdp-range_start .rdp-day_button, .rdp-range_end .rdp-day_button { background-color: #f59e0b !important; color: #fff !important; }
            `}</style>
            <DayPicker
                showOutsideDays={showOutsideDays}
                locale={locale}
                className={cn(padrao.root, 'p-2', className)}
                classNames={{
                    ...padrao,
                    ...classNames,
                }}
                {...props}
            />
        </>
    );
}

Calendar.displayName = 'Calendar';

export { Calendar };
