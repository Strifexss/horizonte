import { useEffect, useRef, useState } from 'react';

const SEARCH_DEBOUNCE_MS = 800;

export type Option = { id: number | string; nome: string; [key: string]: unknown };

export interface AsyncSelectProps {
  loadOptions: (input: string) => Promise<Option[]>;
  value?: Option | null;
  onChange: (option: Option | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  autoFocus?: boolean;
  selectRef?: React.Ref<{ focus: () => void } | null>;
  /** When set, prepends a "+ Cadastrar" option if the typed text has no exact match. */
  creatable?: boolean;
  formatCreateLabel?: (input: string) => string;
  isDisabled?: boolean;
  /** Enter com a busca ainda carregando (ex.: leitor de código de barras) escolhe o primeiro resultado. */
  selectFirstOnEnter?: boolean;
  /** Texto exibido na lista de opções; o valor selecionado continua usando `nome`. */
  formatOptionText?: (option: Option) => string;
  /** Limpa e mantém o foco após escolher, para adicionar vários itens em sequência. */
  keepFocusOnSelect?: boolean;
  /** Título da tela de busca no celular. Sem ele, usa o placeholder. */
  label?: string;
  /** Id do botão que abre a busca no celular, para ligar com um `<Label htmlFor>`. */
  inputId?: string;
}

export type SelectOption = { value: number | string; label: string; __raw: Option; __isCreate?: boolean };

type AsyncOptionsConfig = Pick<AsyncSelectProps, 'loadOptions' | 'creatable' | 'formatCreateLabel' | 'formatOptionText'>;

/**
 * Busca com debounce compartilhada pelo dropdown (desktop) e pela tela de busca (celular).
 * Só a resposta da última requisição é aplicada.
 */
export function useAsyncOptions({ loadOptions, creatable = false, formatCreateLabel = defaultCreateLabel, formatOptionText }: AsyncOptionsConfig) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);
  const debounceTimer = useRef<number | null>(null);

  const cancelPending = () => {
    if (debounceTimer.current !== null) {
      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current !== null) {
        window.clearTimeout(debounceTimer.current);
      }
      requestId.current += 1;
    };
  }, []);

  const fetchOptions = (inputValue: string, onLoaded?: (loaded: SelectOption[]) => void) => {
    const id = ++requestId.current;
    setIsLoading(true);

    void (async () => {
      try {
        const opts = await loadOptions(inputValue);
        if (id !== requestId.current) {
          return;
        }

        const mapped = opts.map((o) => ({ value: o.id, label: formatOptionText ? formatOptionText(o) : o.nome, __raw: o }));
        const trimmed = inputValue.trim();

        if (
          creatable &&
          trimmed &&
          !opts.some((o) => String(o.nome).trim().toLowerCase() === trimmed.toLowerCase())
        ) {
          const createOption: SelectOption = {
            value: `__create__:${trimmed}`,
            label: formatCreateLabel(trimmed),
            __isCreate: true,
            __raw: {
              id: `__create__`,
              nome: trimmed,
              __create: true,
              __createName: trimmed,
            },
          };
          setOptions([...mapped, createOption]);
          return;
        }

        setOptions(mapped);
        onLoaded?.(mapped);
      } catch {
        if (id !== requestId.current) {
          return;
        }
        setOptions([]);
      } finally {
        if (id === requestId.current) {
          setIsLoading(false);
        }
      }
    })();
  };

  const scheduleFetch = (inputValue: string) => {
    cancelPending();
    requestId.current += 1;
    setIsLoading(false);

    debounceTimer.current = window.setTimeout(() => {
      debounceTimer.current = null;
      fetchOptions(inputValue);
    }, SEARCH_DEBOUNCE_MS);
  };

  return { options, isLoading, fetchOptions, scheduleFetch, cancelPending, hasPendingSearch: () => debounceTimer.current !== null };
}

function defaultCreateLabel(input: string): string {
  return `+ Cadastrar "${input}"`;
}

export function toOption(selected: SelectOption): Option {
  return selected.__raw ?? { id: selected.value, nome: selected.label };
}
