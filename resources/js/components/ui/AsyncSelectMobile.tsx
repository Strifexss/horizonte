import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Loader2, Plus, Search, X } from 'lucide-react';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { type AsyncSelectProps, type SelectOption, toOption, useAsyncOptions } from './async-select-options';

/** Destaca em negrito o trecho buscado dentro do texto da opção. */
function HighlightedText({ text, query }: { text: string; query: string }) {
  const termo = query.trim();
  const index = termo ? text.toLowerCase().indexOf(termo.toLowerCase()) : -1;

  if (index < 0) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, index)}
      <strong className="font-semibold">{text.slice(index, index + termo.length)}</strong>
      {text.slice(index + termo.length)}
    </>
  );
}

type MobileSearchProps = Omit<AsyncSelectProps, 'selectFirstOnEnter' | 'keepFocusOnSelect'>;

/**
 * No celular, o dropdown fica atrás do teclado. Aqui o campo vira um botão que abre
 * uma tela de busca própria, com a lista logo abaixo do campo de busca.
 */
export default function AsyncSelectMobile({
  loadOptions,
  value,
  onChange,
  placeholder = '',
  isClearable = true,
  autoFocus = false,
  selectRef,
  creatable = false,
  formatCreateLabel,
  isDisabled = false,
  formatOptionText,
  label,
  inputId,
}: MobileSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { options, isLoading, fetchOptions, scheduleFetch, cancelPending, hasPendingSearch } = useAsyncOptions({
    loadOptions,
    creatable,
    formatCreateLabel,
    formatOptionText,
  });

  useImperativeHandle(selectRef as React.Ref<{ focus: () => void }>, () => ({ focus: () => triggerRef.current?.focus() }), []);

  useEffect(() => {
    if (autoFocus) {
      triggerRef.current?.focus();
    }
  }, [autoFocus]);

  const openSearch = () => {
    setQuery('');
    cancelPending();
    fetchOptions('');
    setOpen(true);
  };

  const choose = (selected: SelectOption) => {
    onChange(toOption(selected));
    setOpen(false);
  };

  const title = label ?? placeholder;
  const createOption = options.find((option) => option.__isCreate);
  const results = options.filter((option) => !option.__isCreate);
  const searching = isLoading || hasPendingSearch();

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          disabled={isDisabled}
          onClick={openSearch}
          aria-haspopup="dialog"
          className={cn(
            'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full items-center gap-2 rounded-md border px-3 text-left text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            isClearable && value ? 'pr-20' : 'pr-10',
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', !value && 'text-muted-foreground')}>{value ? value.nome : placeholder}</span>
        </button>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {isClearable && value && !isDisabled && (
            <button
              type="button"
              aria-label="Limpar seleção"
              onClick={() => onChange(null)}
              className="text-muted-foreground hover:text-foreground pointer-events-auto flex size-8 items-center justify-center rounded-md"
            >
              <X className="size-4" />
            </button>
          )}
          <ChevronDown className="text-muted-foreground size-4" aria-hidden="true" />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="h-[100dvh] w-[100vw] max-w-none gap-0 rounded-none p-0"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById(`${inputId ?? 'async-select'}-busca`)?.focus();
          }}
        >
          <DialogHeader className="shrink-0 gap-3 space-y-0 border-b px-4 pt-4 pb-3 text-left">
            <DialogTitle className="pr-12 text-left text-lg md:text-lg">{title}</DialogTitle>
            <DialogDescription className="sr-only">Busque e toque em uma opção para selecionar.</DialogDescription>
            <div className="border-input focus-within:ring-ring flex h-11 items-center gap-2 rounded-md border px-3 focus-within:ring-2">
              <Search className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              <input
                id={`${inputId ?? 'async-select'}-busca`}
                type="text"
                inputMode="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  scheduleFetch(event.target.value);
                }}
                placeholder={placeholder || 'Buscar...'}
                aria-label={`Buscar ${title}`.trim()}
                autoComplete="off"
                enterKeyHint="search"
                className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-base outline-hidden"
              />
              {searching && <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" aria-hidden="true" />}
              {query && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setQuery('');
                    cancelPending();
                    fetchOptions('');
                  }}
                  className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" role="listbox" aria-label={title}>
            {createOption && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => choose(createOption)}
                className="text-primary hover:bg-accent flex min-h-14 w-full items-center gap-3 border-b px-4 text-left text-base font-medium"
              >
                <Plus className="size-5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 truncate">{createOption.label.replace(/^\+\s*/, '')}</span>
              </button>
            )}

            {results.map((option) => {
              const isSelected = value !== null && value !== undefined && String(value.id) === String(option.value);

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option)}
                  className={cn('hover:bg-accent flex min-h-14 w-full items-center gap-3 border-b px-4 text-left text-base', isSelected && 'bg-accent/60')}
                >
                  <span className="min-w-0 flex-1">
                    <HighlightedText text={option.label} query={query} />
                  </span>
                  {isSelected && <Check className="text-primary size-5 shrink-0" aria-label="Selecionado" />}
                </button>
              );
            })}

            {!searching && results.length === 0 && !createOption && (
              <p className="text-muted-foreground px-4 py-8 text-center text-sm">Nenhum resultado encontrado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
