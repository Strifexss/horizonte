import type { KeyboardEvent } from 'react';

/**
 * Enter no teclado do celular vai para o próximo campo (pelo id) em vez de enviar o formulário.
 * Sem próximo campo, apenas fecha o teclado.
 */
export function irParaNoEnter(proximoId: string | null) {
    return (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();

        if (proximoId) {
            document.getElementById(proximoId)?.focus();
            return;
        }

        event.currentTarget.blur();
    };
}
