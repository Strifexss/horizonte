import { useIsMobile } from '@/hooks/use-mobile';
import React, { useCallback, useRef } from 'react';
import Select, { components, MenuListProps, SelectInstance, StylesConfig } from 'react-select';
import { type AsyncSelectProps, type SelectOption, toOption, useAsyncOptions } from './async-select-options';
import AsyncSelectMobile from './AsyncSelectMobile';

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
 * the page behind does not pick up the leftover gesture. The same lock cancels wheel
 * before it reaches the list (some browsers then do not scroll), so wheel scrolls the
 * list by hand and always cancels the native scroll, which avoids scrolling twice.
 */
export function bindMenuScroll(node: HTMLElement): () => void {
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

  const onWheel = (event: WheelEvent) => {
    event.stopPropagation();

    if (event.ctrlKey || event.deltaY === 0) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const unidade = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientHeight : 1;
    node.scrollTop += event.deltaY * unidade;
  };

  node.addEventListener('touchstart', onTouchStart, { passive: true });
  node.addEventListener('touchmove', onTouchMove, { passive: false });
  node.addEventListener('wheel', onWheel, { passive: false });

  return () => {
    node.removeEventListener('touchstart', onTouchStart);
    node.removeEventListener('touchmove', onTouchMove);
    node.removeEventListener('wheel', onWheel);
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

    cleanupRef.current = bindMenuScroll(node);
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
    overscrollBehavior: 'contain',
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

function AsyncSelectDropdown({
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
  selectFirstOnEnter = false,
  formatOptionText,
  keepFocusOnSelect = false,
  inputId,
}: AsyncSelectProps) {
  const { options, isLoading, fetchOptions, scheduleFetch, cancelPending, hasPendingSearch } = useAsyncOptions({
    loadOptions,
    creatable,
    formatCreateLabel,
    formatOptionText,
  });
  const inputValueRef = useRef('');

  const handleChange = (selected: SelectOption | null) => {
    onChange(selected ? toOption(selected) : null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!selectFirstOnEnter || event.key !== 'Enter') {
      return;
    }

    const termo = inputValueRef.current.trim();
    if (termo === '') {
      return;
    }

    const buscaPendente = hasPendingSearch() || isLoading;
    if (!buscaPendente) {
      return;
    }

    event.preventDefault();
    cancelPending();

    fetchOptions(termo, (loaded) => {
      const [primeiro] = loaded.filter((option) => !option.__isCreate);
      if (primeiro) {
        handleChange(primeiro);
      }
    });
  };

  const selected = value ? { value: value.id, label: value.nome, __raw: value } : null;

  return (
    <Select<SelectOption, false>
      ref={selectRef as React.Ref<SelectInstance<SelectOption, false>>}
      inputId={inputId}
      classNamePrefix="app-select"
      options={options}
      isLoading={isLoading}
      filterOption={null}
      openMenuOnClick
      onMenuOpen={() => {
        cancelPending();
        fetchOptions('');
      }}
      onKeyDown={handleKeyDown}
      onInputChange={(input, meta) => {
        inputValueRef.current = meta.action === 'input-change' ? input : '';

        if (meta.action === 'input-change') {
          scheduleFetch(input);
        }
      }}
      onChange={handleChange}
      value={selected}
      isClearable={isClearable}
      isDisabled={isDisabled}
      placeholder={placeholder}
      styles={selectStyles}
      components={{ MenuList: ScrollableMenuList }}
      autoFocus={autoFocus}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      blurInputOnSelect={!keepFocusOnSelect}
      closeMenuOnSelect
    />
  );
}

/**
 * Autocomplete assíncrono. No desktop é um dropdown (react-select); no celular abre uma
 * tela de busca. Fluxos de leitura em sequência (`keepFocusOnSelect`, `selectFirstOnEnter`)
 * ficam sempre no dropdown, para não abrir uma tela a cada item.
 */
export default function AsyncSelect(props: AsyncSelectProps) {
  const isMobile = useIsMobile();
  const usaTelaDeBusca = isMobile && !props.keepFocusOnSelect && !props.selectFirstOnEnter;

  if (usaTelaDeBusca) {
    return <AsyncSelectMobile {...props} />;
  }

  return <AsyncSelectDropdown {...props} />;
}
