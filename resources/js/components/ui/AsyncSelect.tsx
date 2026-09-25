import React from 'react';
import { StylesConfig } from 'react-select';
import AsyncSelectBase from 'react-select/async';

type Option = { id: number | string; nome: string; [key: string]: any };

interface AsyncSelectProps {
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
}

type SelectOption = { value: number | string; label: string; __raw: Option; __isCreate?: boolean };

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '2.5rem',
    backgroundColor: 'var(--background)',
    borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: state.isFocused ? '0 0 0 1px var(--ring)' : 'none',
    color: 'var(--foreground)',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 12px',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--foreground)',
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--foreground)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'var(--border)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
    '&:hover': {
      color: 'var(--foreground)',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
    '&:hover': {
      color: 'var(--foreground)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--popover-foreground)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    overflow: 'hidden',
    zIndex: 50,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 80,
    // Radix Dialog sets pointer-events:none on body; portaled menus must opt back in.
    pointerEvents: 'auto',
  }),
  menuList: (base) => ({
    ...base,
    padding: 4,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused || state.isSelected ? 'var(--accent)' : 'transparent',
    color: state.isFocused || state.isSelected ? 'var(--accent-foreground)' : 'var(--popover-foreground)',
    borderRadius: 'calc(var(--radius) - 4px)',
    cursor: 'pointer',
    fontWeight: state.data?.__isCreate ? 600 : base.fontWeight,
    '&:active': {
      backgroundColor: 'var(--accent)',
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
  }),
  loadingMessage: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
  }),
};

export default function AsyncSelect({
  loadOptions,
  value,
  onChange,
  placeholder = '',
  isClearable = true,
  autoFocus = false,
  selectRef,
  creatable = false,
  formatCreateLabel = (input: string) => `+ Cadastrar "${input}"`,
}: AsyncSelectProps) {
  const wrappedLoad = async (inputValue: string) => {
    try {
      const opts = await loadOptions(inputValue);
      const mapped = opts.map((o) => ({ value: o.id, label: o.nome, __raw: o }));
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
        return [...mapped, createOption];
      }

      return mapped;
    } catch {
      return [];
    }
  };

  const handleChange = (selected: SelectOption | null) => {
    if (!selected) {
      onChange(null);
      return;
    }
    onChange(selected.__raw ?? { id: selected.value, nome: selected.label });
  };

  const selected = value ? { value: value.id, label: value.nome, __raw: value } : null;

  return (
    <AsyncSelectBase<SelectOption, false>
      ref={selectRef as React.Ref<any>}
      classNamePrefix="app-select"
      cacheOptions={false}
      defaultOptions
      loadOptions={wrappedLoad}
      onChange={handleChange}
      value={selected}
      isClearable={isClearable}
      placeholder={placeholder}
      styles={selectStyles}
      autoFocus={autoFocus}
      filterOption={null}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      blurInputOnSelect
      closeMenuOnSelect
    />
  );
}
