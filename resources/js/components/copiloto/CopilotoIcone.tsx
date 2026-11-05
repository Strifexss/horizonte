import type { SVGProps } from 'react';

/** Headset do Copiloto, no traço dos ícones lucide do app. */
export default function CopilotoIcone(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
            <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
            <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
            <path d="M19.5 19v.5a2.5 2.5 0 0 1-2.5 2.5h-3" />
        </svg>
    );
}
