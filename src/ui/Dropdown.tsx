import { useEffect, useRef, useState, type ReactNode } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
    position: relative;
    display: inline-flex;
`;

const Trigger = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    white-space: nowrap;
    background: var(--item-bg);
    border: var(--panel-border-w) var(--panel-border-style) var(--panel-border-strong);
    border-radius: var(--panel-btn-radius);
    color: var(--fui-text-hi);
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: var(--panel-blur);

    &:hover {
        border-color: var(--fui-accent);
        color: var(--fui-accent-soft);
    }

    .caret {
        font-size: 9px;
        color: var(--fui-accent);
    }
`;

interface MenuProps {
    $open: boolean;
    $up: boolean;
    $align: 'start' | 'end';
}

const Menu = styled.div<MenuProps>`
    position: absolute;
    ${(p) => (p.$align === 'start' ? 'left: 0;' : 'right: 0;')}
    ${(p) => (p.$up ? 'bottom: calc(100% + 8px);' : 'top: calc(100% + 8px);')}
    z-index: 70;
    min-width: 240px;
    display: ${(p) => (p.$open ? 'flex' : 'none')};
    flex-direction: column;
    padding: 6px;
    background: var(--panel-solid);
    border: var(--panel-border-w) var(--panel-border-style) var(--panel-border-strong);
    border-radius: var(--panel-radius);
    backdrop-filter: var(--panel-blur);
    box-shadow: var(--panel-shadow);
`;

const MenuHeader = styled.div`
    font-size: 9px;
    letter-spacing: 2.5px;
    color: var(--hud-label);
    padding: 6px 8px 8px;
    border-bottom: 1px solid rgba(var(--fui-accent-rgb), 0.18);
    margin-bottom: 4px;
`;

/** One selectable row inside a dropdown menu. */
export const Option = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    padding: 8px 10px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 1.5px;
    background: ${(p) => (p.$active ? 'var(--item-active-bg)' : 'transparent')};
    border: var(--panel-border-w) var(--panel-border-style)
        ${(p) => (p.$active ? 'var(--fui-accent)' : 'transparent')};
    border-radius: var(--panel-btn-radius);
    color: ${(p) => (p.$active ? 'var(--fui-text-hi)' : 'var(--fui-text-dim)')};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: var(--fui-text-hi);
        border-color: var(--panel-border-strong);
        background: var(--item-bg);
    }
`;

/** Secondary (zh) line inside an option. */
export const OptionSub = styled.span`
    margin-left: auto;
    font-size: 10px;
    letter-spacing: 1px;
    color: rgba(var(--fui-muted-rgb), 0.6);
`;

export interface DropdownProps {
    /** button face content */
    label: ReactNode;
    /** extra attributes for the trigger button (data-* hooks for tests) */
    triggerProps?: Record<string, string>;
    /** open upward (bottom bar) or downward (top bar) */
    up?: boolean;
    /** menu horizontal alignment relative to the trigger */
    align?: 'start' | 'end';
    /** section header inside the menu */
    header?: ReactNode;
    /** menu body; receives a close() callback for option clicks */
    children: (close: () => void) => ReactNode;
}

/**
 * Shared dropdown: click the trigger to toggle, click outside / Esc / pick an
 * option to close. Used by the top-bar fleet picker and the theme picker.
 */
export function Dropdown({
    label,
    triggerProps,
    up = false,
    align = 'start',
    header,
    children,
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    // Close on outside pointerdown / Esc; state flips inside event handlers,
    // never synchronously in the effect body (react-hooks lint).
    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('pointerdown', onDown, true);
        window.addEventListener('keydown', onEsc);
        return () => {
            window.removeEventListener('pointerdown', onDown, true);
            window.removeEventListener('keydown', onEsc);
        };
    }, [open]);

    const close = () => setOpen(false);

    return (
        <Wrap ref={wrapRef}>
            <Trigger
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                {...triggerProps}
            >
                {label}
                <span className="caret">▼</span>
            </Trigger>
            <Menu $open={open} $up={up} $align={align} role="listbox">
                {header ? <MenuHeader>{header}</MenuHeader> : null}
                {open ? children(close) : null}
            </Menu>
        </Wrap>
    );
}
