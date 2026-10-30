type Props = {
    contaGoogle: boolean;
};

/** Contas com senha e contas Google são independentes, mesmo com o mesmo e-mail. */
export default function SeloMetodoLogin({ contaGoogle }: Props) {
    return (
        <span
            className="text-muted-foreground shrink-0 rounded border px-1.5 text-[11px] font-semibold"
            title={contaGoogle ? 'Conta Google' : 'Conta com senha'}
        >
            {contaGoogle ? 'Google' : 'Senha'}
        </span>
    );
}
