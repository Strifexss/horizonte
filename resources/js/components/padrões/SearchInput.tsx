import { Search } from 'lucide-react';

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function SearchInput({ value, onChange, placeholder = 'Buscar...' }: Props) {
    return (
        <div className="relative w-full min-w-0">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#aaaaaa]">
                <Search className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
                type="text"
                name="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border py-2 pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
            />
        </div>
    );
}
