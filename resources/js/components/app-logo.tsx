import { branding } from '@/lib/branding';

type AppLogoProps = {
    fundo?: 'escuro' | 'claro';
};

export default function AppLogo({ fundo = 'escuro' }: AppLogoProps) {
    const completa = fundo === 'escuro' ? branding.completaFundoEscuro : branding.completaFundoClaro;

    return (
        <>
            <img src={branding.icone} alt="" className="hidden size-8 shrink-0 group-data-[collapsible=icon]:block" />
            <img src={completa} alt="Horizonte" className="h-8 w-auto max-w-[10rem] shrink-0 group-data-[collapsible=icon]:hidden" />
        </>
    );
}
