import InputError from '@/components/input-error';
import { router, useForm } from '@inertiajs/react';
import { Delete } from 'lucide-react';
import { useEffect, useState } from 'react';

type PareamentoFormValues = {
    pin: string;
};

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const TECLA =
    'h-[4.4vw] min-h-12 rounded-[0.75vw] border-2 border-slate-800 bg-[#0e1a2e] text-[1.7vw] font-semibold text-slate-50 hover:border-amber-500 hover:bg-[#1b2d4a] focus-visible:border-amber-500 focus-visible:bg-[#1b2d4a] focus-visible:outline-none';

export default function TvPareamentoForm() {
    const [limiteAtingido, setLimiteAtingido] = useState(false);
    const { data, setData, post, processing, errors, clearErrors } = useForm<PareamentoFormValues>({ pin: '' });

    useEffect(() => {
        return router.on('invalid', (event) => {
            if (event.detail.response.status === 429) {
                event.preventDefault();
                setLimiteAtingido(true);
            }
        });
    }, []);

    function definirPin(valor: string): void {
        clearErrors();
        setLimiteAtingido(false);
        setData('pin', valor.replace(/\D/g, '').slice(0, 4));
    }

    function conectar(event: React.FormEvent): void {
        event.preventDefault();
        post(route('tv.parear'), { preserveScroll: true });
    }

    return (
        <form onSubmit={conectar} className="flex flex-1 flex-col items-center justify-center gap-[2vw]" noValidate>
            <div className="flex flex-col items-center gap-[0.6vw] text-center">
                <label htmlFor="tv-pin" className="text-[2.5vw] leading-tight font-semibold tracking-tight">
                    Digite o PIN de 4 dígitos para conectar esta TV
                </label>
                <p className="text-[1.25vw] text-slate-400">O PIN fica no ERP, em Menu Board › Pareamento de TV.</p>
            </div>

            <div className="flex items-start gap-[3.3vw]">
                <div className="flex flex-col items-center gap-[1vw]">
                    <input
                        id="tv-pin"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        autoFocus
                        maxLength={4}
                        value={data.pin}
                        onChange={(event) => definirPin(event.target.value)}
                        placeholder="····"
                        className={`h-[8.3vw] w-[27vw] rounded-[1vw] border-[3px] bg-[#0b1527] pl-[0.4em] text-center text-[5.4vw] font-semibold tracking-[0.4em] text-white tabular-nums focus:border-amber-500 focus:ring-[6px] focus:ring-amber-500/20 focus:outline-none ${
                            errors.pin || limiteAtingido ? 'border-red-500' : 'border-slate-700'
                        }`}
                    />
                    <InputError message={errors.pin} className="text-[1.25vw] text-red-300" />
                    {limiteAtingido ? (
                        <p role="alert" className="text-[1.25vw] text-red-300">
                            Muitas tentativas. Aguarde um minuto e tente de novo.
                        </p>
                    ) : null}
                    <button
                        type="submit"
                        disabled={data.pin.length < 4 || processing}
                        className="h-[4.2vw] min-h-12 w-[27vw] rounded-[0.85vw] bg-amber-500 text-[1.45vw] font-bold text-[#082845] hover:bg-amber-600 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {processing ? 'Conectando...' : 'Conectar TV'}
                    </button>
                </div>

                <div role="group" aria-label="Teclado numérico" className="grid w-[17vw] grid-cols-3 gap-[0.6vw]">
                    {TECLAS.map((numero) => (
                        <button key={numero} type="button" className={TECLA} onClick={() => definirPin(data.pin + numero)}>
                            {numero}
                        </button>
                    ))}
                    <button
                        type="button"
                        className={`${TECLA} flex items-center justify-center`}
                        aria-label="Apagar"
                        onClick={() => definirPin(data.pin.slice(0, -1))}
                    >
                        <Delete className="size-[1.7vw]" />
                    </button>
                    <button type="button" className={TECLA} onClick={() => definirPin(data.pin + '0')}>
                        0
                    </button>
                    <button type="button" className={TECLA} aria-label="Limpar" onClick={() => definirPin('')}>
                        C
                    </button>
                </div>
            </div>
        </form>
    );
}
