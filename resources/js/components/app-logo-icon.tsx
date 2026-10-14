import { branding } from '@/lib/branding';

type AppLogoIconProps = {
    className?: string;
};

export default function AppLogoIcon({ className }: AppLogoIconProps) {
    return <img src={branding.icone} alt="Horizonte" className={className} />;
}
