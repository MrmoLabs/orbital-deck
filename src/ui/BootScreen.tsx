import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useProgress } from '@react-three/drei';
import type { ModelDef } from '../lib/fleet';

const caret = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
`;

type ScreenState = 'loading' | 'fading' | 'gone';

const Screen = styled.div<{ $hidden: boolean }>`
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    background: var(--boot-bg);
    opacity: ${(p) => (p.$hidden ? 0 : 1)};
    transition: opacity 0.8s ease;
    pointer-events: none;
`;

const Title = styled.div`
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 34px;
    letter-spacing: 12px;
    color: var(--fui-text-hi);
    text-shadow: 0 0 18px rgba(var(--fui-accent-rgb), 0.6);
`;

const Sub = styled.div`
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    letter-spacing: 4px;
    color: rgba(var(--fui-accent-rgb), 0.65);
`;

const BarOuter = styled.div`
    width: min(440px, 70vw);
    height: 6px;
    border: 1px solid rgba(var(--fui-accent-rgb), 0.4);
    padding: 1px;
`;

const BarFill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${(p) => p.$pct}%;
    background: var(--fui-accent);
    box-shadow: 0 0 10px var(--fui-accent);
    transition: width 0.25s ease;
`;

const Status = styled.div`
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(var(--fui-accent-rgb), 0.75);

    &::after {
        content: '▌';
        animation: ${caret} 0.8s infinite;
    }
`;

/**
 * Boot/loading overlay. The parent remounts it per fleet asset (key={model.id}),
 * so every model switch starts from a fresh 'loading' state and re-arms the
 * safety timer — it can never leave a stale veil over the terminal.
 */
export function BootScreen({ model }: { model: ModelDef }) {
    const { progress, active } = useProgress();
    const [state, setState] = useState<ScreenState>('loading');

    // Load finished: fade out, then unmount content.
    useEffect(() => {
        if (progress >= 100 && !active) {
            const t1 = window.setTimeout(
                () => setState((s) => (s === 'loading' ? 'fading' : s)),
                300,
            );
            const t2 = window.setTimeout(() => setState('gone'), 1300);
            return () => {
                window.clearTimeout(t1);
                window.clearTimeout(t2);
            };
        }
    }, [progress, active]);

    // Safety: never trap the user behind the boot screen.
    useEffect(() => {
        const t = window.setTimeout(() => setState('gone'), 9000);
        return () => window.clearTimeout(t);
    }, []);

    if (state === 'gone') return null;

    const pct = Math.min(100, Math.round(progress));

    return (
        <Screen $hidden={state === 'fading'}>
            <Title>ORBITAL DECK</Title>
            <Sub>ORBITAL INSPECTION TERMINAL // {model.code}</Sub>
            <BarOuter>
                <BarFill $pct={pct} />
            </BarOuter>
            <Status>
                {pct < 100
                    ? `LOADING ${model.code}.GLB // DRACO DECODE // ${pct}%`
                    : 'LINK ESTABLISHED // TELEMETRY ONLINE'}
            </Status>
        </Screen>
    );
}
