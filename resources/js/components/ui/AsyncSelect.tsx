import React from 'react';
import AsyncSelectBase from 'react-select/async';

type Option = { id: number | string; nome: string; [key: string]: any };

interface AsyncSelectProps {
  loadOptions: (input: string) => Promise<Option[]>;
  value?: Option | null;
  onChange: (option: Option | null) => void;
  placeholder?: string;
  isClearable?: boolean;
}

export default function AsyncSelect({ loadOptions, value, onChange, placeholder = '', isClearable = true }: AsyncSelectProps) {
  const wrappedLoad = async (inputValue: string) => {
    try {
      const opts = await loadOptions(inputValue);
      return opts.map((o) => ({ value: o.id, label: o.nome, __raw: o }));
    } catch {
      return [];
    }
  };

  const handleChange = (selected: any) => {
    if (!selected) {
      onChange(null);
      return;
    }
    onChange(selected.__raw ?? { id: selected.value, nome: selected.label });
  };

  const selected = value ? { value: value.id, label: value.nome, __raw: value } : null;

  return (
    // react-select styling is handled by global app styles / tailwind
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AsyncSelectBase
      cacheOptions
      defaultOptions
      loadOptions={wrappedLoad}
      onChange={handleChange}
      value={selected}
      isClearable={isClearable}
      placeholder={placeholder}
    />
  );
}

