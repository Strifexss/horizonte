type HorizonteIlustracaoProps = {
    className?: string;
};

/**
 * Céu azul-marinho com o sol âmbar nascendo no horizonte, no mesmo desenho da logo
 * (meio sol sobre duas faixas), para o painel da tela de login.
 */
export default function HorizonteIlustracao({ className }: HorizonteIlustracaoProps) {
    return (
        <svg viewBox="0 0 600 720" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
            <defs>
                <linearGradient id="hz-ceu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#051a2e" />
                    <stop offset="0.55" stopColor="#082845" />
                    <stop offset="1" stopColor="#0f3d66" />
                </linearGradient>
                <radialGradient id="hz-brilho" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#f59e0b" stopOpacity="0.55" />
                    <stop offset="0.45" stopColor="#f59e0b" stopOpacity="0.18" />
                    <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="hz-sol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fbbf24" />
                    <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
                <pattern id="hz-grade" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
                </pattern>
            </defs>

            <rect width="600" height="720" fill="url(#hz-ceu)" />
            <rect width="600" height="720" fill="url(#hz-grade)" />

            <g fill="#ffffff">
                <circle cx="92" cy="128" r="1.6" opacity="0.7" />
                <circle cx="168" cy="214" r="1.2" opacity="0.5" />
                <circle cx="482" cy="96" r="1.8" opacity="0.7" />
                <circle cx="530" cy="236" r="1.2" opacity="0.5" />
                <circle cx="402" cy="168" r="1" opacity="0.6" />
                <circle cx="248" cy="88" r="1.2" opacity="0.5" />
            </g>

            <g stroke="#f59e0b" strokeOpacity="0.35" strokeWidth="1">
                <line x1="380" y1="120" x2="560" y2="290" />
            </g>
            <g fill="#f59e0b">
                <circle cx="560" cy="290" r="3" />
                <circle cx="380" cy="120" r="4" opacity="0.8" />
            </g>

            <circle cx="380" cy="120" r="12" fill="none" stroke="#f59e0b" strokeOpacity="0.4" />

            <circle cx="300" cy="500" r="230" fill="url(#hz-brilho)" />
            <path d="M190 500a110 110 0 0 1 220 0Z" fill="url(#hz-sol)" />

            <path d="M0 500C80 470 150 488 220 500S380 520 440 498 560 476 600 492V720H0Z" fill="#0b3358" />
            <rect x="0" y="499" width="600" height="2" fill="#f59e0b" opacity="0.5" />
            <rect x="214" y="526" width="172" height="12" rx="6" fill="#f59e0b" />
            <rect x="250" y="554" width="100" height="12" rx="6" fill="#f59e0b" opacity="0.85" />

            <path d="M0 600C90 570 170 590 260 606S430 628 520 600 590 584 600 588V720H0Z" fill="#0e3e69" opacity="0.9" />
            <path d="M0 660C110 636 200 650 300 664S470 684 600 650V720H0Z" fill="#124876" opacity="0.85" />
        </svg>
    );
}
