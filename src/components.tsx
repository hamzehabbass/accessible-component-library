import {
  cloneElement,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

type Direction = "ltr" | "rtl";
type Theme = "light" | "dark";

export function ThemeProvider({
  children,
  dir = "ltr",
  theme = "light",
}: {
  children: ReactNode;
  dir?: Direction;
  theme?: Theme;
}) {
  return (
    <div className="acl-root" dir={dir} data-theme={theme}>
      {children}
    </div>
  );
}

function classes(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    size = "md",
    variant = "primary",
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={classes("acl-button", `acl-button--${variant}`, `acl-button--${size}`, className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
});

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const { "aria-describedby": existingDescription, "aria-invalid": ariaInvalid, ...rest } = props;
  const describedBy = [existingDescription, error ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
  return (
    <>
      <input
        id={inputId}
        className={classes("acl-input", className)}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy}
        {...rest}
      />
      {error && (
        <span className="acl-error" id={errorId}>
          {error}
        </span>
      )}
    </>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ children, className, error, id, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const { "aria-describedby": existingDescription, "aria-invalid": ariaInvalid, ...rest } = props;
  const describedBy = [existingDescription, error ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
  return (
    <>
      <select
        id={selectId}
        className={classes("acl-input", className)}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span className="acl-error" id={errorId}>
          {error}
        </span>
      )}
    </>
  );
}

export function Checkbox({
  children,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children?: ReactNode }) {
  return (
    <label className={classes("acl-choice", className)}>
      <input type="checkbox" className="acl-check" {...props} />
      {children && <span>{children}</span>}
    </label>
  );
}

export function Radio({
  children,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children?: ReactNode }) {
  return (
    <label className={classes("acl-choice", className)}>
      <input type="radio" className="acl-check" {...props} />
      {children && <span>{children}</span>}
    </label>
  );
}

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  className?: string;
}

export function Switch({
  checked,
  className,
  disabled,
  label,
  onCheckedChange,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={classes("acl-switch", checked && "is-checked", className)}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="acl-switch__thumb" aria-hidden="true" />
    </button>
  );
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

function DialogSurface({
  children,
  className,
  labelledBy,
  onClose,
  open,
  title,
}: DialogProps & { drawer?: boolean; placement?: "start" | "end" }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    (getFocusable()[0] ?? dialog).focus();

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    dialog.addEventListener("keydown", handleKeyDown);
    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="acl-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? titleId}
        tabIndex={-1}
        className={classes("acl-dialog", className)}
      >
        <div className="acl-dialog__header">
          <h2 id={labelledBy ?? titleId} className="acl-dialog__title">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </Button>
        </div>
        <div className="acl-dialog__body">{children}</div>
      </div>
    </div>
  );
}

export function Modal(props: DialogProps) {
  return <DialogSurface {...props} />;
}

export interface DrawerProps extends DialogProps {
  placement?: "start" | "end";
}

export function Drawer({ placement = "end", ...props }: DrawerProps) {
  return (
    <DialogSurface
      {...props}
      className={classes(`acl-drawer--${placement}`, props.className)}
    />
  );
}

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export function Tabs({
  items,
  label = "Tabs",
  orientation = "horizontal",
}: {
  items: TabItem[];
  label?: string;
  orientation?: "horizontal" | "vertical";
}) {
  const [active, setActive] = useState(items.find((item) => !item.disabled)?.id ?? "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function moveFocus(index: number, key: string) {
    const enabled = items
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter(({ item }) => !item.disabled);
    const current = enabled.findIndex(({ item }) => item.id === active);
    const delta = key === "Home" ? 0 : key === "End" ? enabled.length - 1 : (current + index + enabled.length) % enabled.length;
    const target = enabled[delta];
    if (!target) return;
    setActive(target.item.id);
    tabRefs.current[target.itemIndex]?.focus();
  }

  return (
    <div className="acl-tabs">
      <div
        role="tablist"
        tabIndex={-1}
        aria-label={label}
        aria-orientation={orientation}
        className={classes("acl-tablist", `acl-tablist--${orientation}`)}
        onKeyDown={(event) => {
          const previousKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
          const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
          if (event.key === previousKey) {
            event.preventDefault();
            moveFocus(-1, event.key);
          } else if (event.key === nextKey) {
            event.preventDefault();
            moveFocus(1, event.key);
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            moveFocus(0, event.key);
          }
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            id={`${item.id}-tab`}
            role="tab"
            type="button"
            aria-selected={active === item.id}
            aria-controls={`${item.id}-panel`}
            tabIndex={active === item.id ? 0 : -1}
            disabled={item.disabled}
            className="acl-tab"
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${item.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${item.id}-tab`}
          hidden={active !== item.id}
          tabIndex={0}
          className="acl-tabpanel"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpenItems = [],
}: {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenItems?: string[];
}) {
  const [openItems, setOpenItems] = useState(() => new Set(defaultOpenItems));
  return (
    <div className="acl-accordion">
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        const buttonId = `${item.id}-trigger`;
        const panelId = `${item.id}-content`;
        return (
          <section className="acl-accordion__item" key={item.id}>
            <h3 className="acl-accordion__heading">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="acl-accordion__trigger"
                onClick={() => {
                  setOpenItems((previous) => {
                    const next = allowMultiple ? new Set(previous) : new Set<string>();
                    if (isOpen) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  });
                }}
              >
                {item.title}
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="acl-accordion__panel"
            >
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function DropdownMenu({
  label,
  items,
}: {
  label: string;
  items: Array<{ label: string; onSelect: () => void; disabled?: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus();
  }, [open]);

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const menuItems = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [],
    );
    const current = menuItems.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      menuItems[(current + delta + menuItems.length) % menuItems.length]?.focus();
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      menuItems[event.key === "Home" ? 0 : menuItems.length - 1]?.focus();
    }
  }

  return (
    <div className="acl-menu">
      <Button
        ref={triggerRef}
        variant="ghost"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {label}
      </Button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="acl-menu__items"
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className="acl-menu__item"
              onClick={() => {
                item.onSelect();
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Tooltip({
  children,
  content,
}: {
  children: ReactElement<{ "aria-describedby"?: string }>;
  content: ReactNode;
}) {
  const tooltipId = useId();
  const existingDescription = children.props["aria-describedby"];
  return (
    <span className="acl-tooltip">
      {cloneElement(children, {
        "aria-describedby": [existingDescription, tooltipId].filter(Boolean).join(" "),
      })}
      <span id={tooltipId} role="tooltip" className="acl-tooltip__content">
        {content}
      </span>
    </span>
  );
}

export function Toast({
  children,
  onDismiss,
  open = true,
  duration,
  status = "status",
}: {
  children: ReactNode;
  onDismiss?: () => void;
  open?: boolean;
  duration?: number;
  status?: "status" | "alert";
}) {
  useEffect(() => {
    if (!open || duration === undefined || !onDismiss) return;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDismiss, open]);
  if (!open) return null;
  return (
    <div role={status} className="acl-toast">
      <span>{children}</span>
      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Dismiss notification">
          <span aria-hidden="true">×</span>
        </Button>
      )}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  label = "Pagination",
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  if (pageCount < 1) return null;
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  return (
    <nav aria-label={label} className="acl-pagination">
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        Previous
      </Button>
      {pages.map((pageNumber) => (
        <Button
          key={pageNumber}
          variant={currentPage === pageNumber ? "primary" : "ghost"}
          size="sm"
          aria-current={currentPage === pageNumber ? "page" : undefined}
          aria-label={`Page ${pageNumber}`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === pageCount}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        Next
      </Button>
    </nav>
  );
}

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  caption,
}: {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  caption: string;
}) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [ascending, setAscending] = useState(true);
  const sortedRows = sortKey
    ? [...rows].sort((a, b) => {
        const first = a[sortKey];
        const second = b[sortKey];
        const comparison = String(first).localeCompare(String(second), undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return ascending ? comparison : -comparison;
      })
    : rows;
  return (
    <div className="acl-table-scroll">
      <table className="acl-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => {
              const activeSort = sortKey === column.key;
              return (
                <th
                  key={String(column.key)}
                  scope="col"
                  aria-sort={
                    activeSort ? (ascending ? "ascending" : "descending") : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="acl-table__sort"
                      onClick={() => {
                        if (activeSort) setAscending((value) => !value);
                        else {
                          setSortKey(column.key);
                          setAscending(true);
                        }
                      }}
                    >
                      {column.header}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => {
                const value = row[column.key];
                return (
                  <td key={String(column.key)}>
                    {column.render ? column.render(value, row) : String(value ?? "")}
                  </td>
                );
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="acl-table__empty">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  min,
  max,
  disabled,
}: {
  id?: string;
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const valueString =
    value && !Number.isNaN(value.getTime())
      ? [
          value.getFullYear().toString().padStart(4, "0"),
          (value.getMonth() + 1).toString().padStart(2, "0"),
          value.getDate().toString().padStart(2, "0"),
        ].join("-")
      : "";
  return (
    <div className="acl-field">
      <label htmlFor={inputId} className="acl-label">
        {label}
      </label>
      <input
        id={inputId}
        className="acl-input"
        type="date"
        value={valueString}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const next = event.target.value;
          onChange(next ? new Date(`${next}T00:00:00`) : null);
        }}
      />
    </div>
  );
}

export function FormField({
  children,
  description,
  error,
  label,
  id,
  required,
}: {
  children: ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    required?: boolean;
  }>;
  description?: string;
  error?: string;
  label: ReactNode;
  id?: string;
  required?: boolean;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const childDescription = children.props["aria-describedby"];
  const describedBy = [
    childDescription,
    description ? descriptionId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;
  const control = cloneElement(children, {
    id: fieldId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : children.props["aria-invalid"],
    required: required ?? children.props.required,
  });

  return (
    <div className="acl-field">
      <label htmlFor={fieldId} className="acl-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {control}
      {description && (
        <span id={descriptionId} className="acl-help">
          {description}
        </span>
      )}
      {error && (
        <span id={errorId} className="acl-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function VisuallyHidden({ children, className, ...props }: VisuallyHiddenProps) {
  return (
    <span className={classes("acl-visually-hidden", className)} {...props}>
      {children}
    </span>
  );
}
