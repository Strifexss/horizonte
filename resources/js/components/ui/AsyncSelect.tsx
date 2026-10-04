import React, { useCallback, useEffect, useRef, useState } from 'react';
import Select, { components, MenuListProps, StylesConfig } from 'react-select';

const SEARCH_DEBOUNCE_MS = 800;

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

const EDGE_EPSILON_PX = 1;

function assignMenuListRef(ref: MenuListProps<SelectOption, false>['innerRef'], node: HTMLDivElement | null) {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) {
    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }
}

/**
 * The menu is portaled to document.body, outside the Radix scroll lock.
 * That lock cancels touchmove on document, which is what blocks finger scrolling.
 * Stop the event while the list can still move, and cancel it at the edges so
 * the page behind does not pick up the leftover gesture. Wheel is left alone.
 */
function bindMenuTouchScroll(node: HTMLDivElement): () => void {
  let lastY = 0;

  const onTouchStart = (event: TouchEvent) => {
    lastY = event.touches[0]?.clientY ?? 0;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const deltaY = lastY - touch.clientY;
    lastY = touch.clientY;

    event.stopPropagation();

    if (deltaY === 0) {
      return;
    }

    const maxScroll = node.scrollHeight - node.clientHeight;
    const room = deltaY > 0 ? maxScroll - node.scrollTop : node.scrollTop;

    if (room > EDGE_EPSILON_PX && Math.abs(deltaY) < room - EDGE_EPSILON_PX) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    if (maxScroll > 0) {
      node.scrollTop = Math.min(maxScroll, Math.max(0, node.scrollTop + deltaY));
    }
  };

  node.addEventListener('touchstart', onTouchStart, { passive: true });
  node.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    node.removeEventListener('touchstart', onTouchStart);
    node.removeEventListener('touchmove', onTouchMove);
  };
}

function ScrollableMenuList(props: MenuListProps<SelectOption, false>) {
  const innerRefProp = useRef(props.innerRef);
  innerRefProp.current = props.innerRef;
  const cleanupRef = useRef<(() => void) | null>(null);

  const setListRef = useCallback((node: HTMLDivElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    assignMenuListRef(innerRefProp.current, node);

    if (!node) {
      return;
    }

    cleanupRef.current = bindMenuTouchScroll(node);
  }, []);

  return <components.MenuList {...props} innerRef={setListRef} />;
}

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
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current !== null) {
        window.clearTimeout(debounceTimer.current);
      }
      requestId.current += 1;
    };
  }, []);

  const fetchOptions = (inputValue: string) => {
    const id = ++requestId.current;
    setIsLoading(true);

    void (async () => {
      try {
        const opts = await loadOptions(inputValue);
        if (id !== requestId.current) {
          return;
        }

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
          setOptions([...mapped, createOption]);
          return;
        }

        setOptions(mapped);
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
    if (debounceTimer.current !== null) {
      window.clearTimeout(debounceTimer.current);
    }

    requestId.current += 1;
    setIsLoading(false);

    debounceTimer.current = window.setTimeout(() => {
      debounceTimer.current = null;
      fetchOptions(inputValue);
    }, SEARCH_DEBOUNCE_MS);
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
    <Select<SelectOption, false>
      ref={selectRef as React.Ref<any>}
      classNamePrefix="app-select"
      options={options}
      isLoading={isLoading}
      filterOption={null}
      openMenuOnClick
      onMenuOpen={() => {
        if (debounceTimer.current !== null) {
          window.clearTimeout(debounceTimer.current);
          debounceTimer.current = null;
        }
        fetchOptions('');
      }}
      onInputChange={(input, meta) => {
        if (meta.action === 'input-change') {
          scheduleFetch(input);
        }
      }}
      onChange={handleChange}
      value={selected}
      isClearable={isClearable}
      placeholder={placeholder}
      styles={selectStyles}
      components={{ MenuList: ScrollableMenuList }}
      autoFocus={autoFocus}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      blurInputOnSelect
      closeMenuOnSelect
    />
  );
}
