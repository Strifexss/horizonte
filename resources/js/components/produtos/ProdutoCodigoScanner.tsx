import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScanBarcode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** API nativa do navegador (Chrome/Edge no Android e desktop). Não existe no Safari/iOS. */
type DetectorDeCodigo = { detect: (fonte: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
type ConstrutorDeDetector = new (opcoes: { formats: string[] }) => DetectorDeCodigo;

const FORMATOS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'];

function construtorDisponivel(): ConstrutorDeDetector | null {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return null;
    }

    return (window as unknown as { BarcodeDetector?: ConstrutorDeDetector }).BarcodeDetector ?? null;
}

type Props = {
    disabled?: boolean;
    onLido: (codigo: string) => void;
};

/**
 * Botão que abre a câmera e lê um código de barras. Só aparece onde o navegador
 * oferece o BarcodeDetector; nos demais, o campo continua aceitando digitação e leitor USB.
 */
export default function ProdutoCodigoScanner({ disabled, onLido }: Props) {
    const [suportado, setSuportado] = useState(false);
    const [aberto, setAberto] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const video = useRef<HTMLVideoElement>(null);
    // Guarda o callback mais recente sem reiniciar a câmera a cada render do formulário.
    const aoLer = useRef(onLido);
    aoLer.current = onLido;

    useEffect(() => {
        setSuportado(construtorDisponivel() !== null);
    }, []);

    useEffect(() => {
        const Detector = construtorDisponivel();

        if (!aberto || !Detector) {
            return;
        }

        let ativo = true;
        let stream: MediaStream | null = null;
        let quadro = 0;
        const detector = new Detector({ formats: FORMATOS });

        const procurar = async () => {
            if (!ativo || !video.current) {
                return;
            }

            try {
                const [lido] = await detector.detect(video.current);
                if (lido?.rawValue && ativo) {
                    aoLer.current(lido.rawValue);
                    setAberto(false);
                    return;
                }
            } catch {
                // Quadro ainda sem imagem: tenta de novo no próximo.
            }

            quadro = window.requestAnimationFrame(() => void procurar());
        };

        setErro(null);
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
            .then(async (midia) => {
                stream = midia;
                if (!ativo || !video.current) {
                    midia.getTracks().forEach((faixa) => faixa.stop());
                    return;
                }
                video.current.srcObject = midia;
                await video.current.play();
                void procurar();
            })
            .catch(() => setErro('Não foi possível abrir a câmera. Verifique a permissão do navegador.'));

        return () => {
            ativo = false;
            window.cancelAnimationFrame(quadro);
            stream?.getTracks().forEach((faixa) => faixa.stop());
        };
    }, [aberto]);

    if (!suportado) {
        return null;
    }

    return (
        <>
            <Button
                type="button"
                variant="secondary"
                size="icon"
                className="shrink-0"
                aria-label="Ler código de barras com a câmera"
                title="Ler código de barras com a câmera"
                disabled={disabled}
                onClick={() => setAberto(true)}
            >
                <ScanBarcode className="h-4 w-4" />
            </Button>

            <Dialog open={aberto} onOpenChange={setAberto}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-left text-lg md:text-lg">Ler código de barras</DialogTitle>
                        <DialogDescription>Aponte a câmera para o código do produto.</DialogDescription>
                    </DialogHeader>
                    {erro ? (
                        <p className="text-sm text-red-600">{erro}</p>
                    ) : (
                        <video ref={video} muted playsInline className="aspect-[4/3] w-full rounded-md bg-black object-cover" />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
