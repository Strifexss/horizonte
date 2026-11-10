import { router } from '@inertiajs/react';
import { useSyncExternalStore } from 'react';

type Ouvinte = () => void;

let carregando = false;
let ultimaConclusao = 0;
const ouvintes = new Set<Ouvinte>();

function avisar(): void {
    ouvintes.forEach((ouvinte) => ouvinte());
}

function inscrever(ouvinte: Ouvinte): () => void {
    ouvintes.add(ouvinte);
    return () => ouvintes.delete(ouvinte);
}

/**
 * Navega numa lista (página, filtro, ordenação) recarregando só as props da lista.
 * Com `only`, as props `Inertia::defer` vêm na mesma resposta: a lista antiga fica na tela
 * (esmaecida) até a nova chegar, sem o fallback vazio do `<Deferred>`.
 */
export function visitLista(url: string, data: Record<string, string | number>, props: string[]): void {
    router.get(url, data, {
        only: [...props, 'filters'],
        preserveScroll: true,
        preserveState: true,
        replace: true,
        onStart: () => {
            carregando = true;
            avisar();
        },
        onFinish: () => {
            carregando = false;
            ultimaConclusao += 1;
            avisar();
        },
    });
}

/** `true` enquanto uma navegação de lista está em andamento. */
export function useListaCarregando(): boolean {
    return useSyncExternalStore(inscrever, () => carregando);
}

/** Muda a cada navegação de lista concluída; serve de gatilho para rolagem e animação. */
export function useListaConclusao(): number {
    return useSyncExternalStore(inscrever, () => ultimaConclusao);
}
