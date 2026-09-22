import styled, { css, keyframes } from 'styled-components';
import { Html } from '@react-three/drei';
import type { FocusId } from '../lib/fleet';

const blink = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
`;

const Wrap = styled.div<{ $focused: boolean }>`
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(16px, -50%);
    display: flex;
    align-items: center;
    gap: 6px;
    pointer-events: none;
    white-space: nowrap;
    opacity: ${(p) => (p.$focused ? 1 : 0.5)};
    transition: opacity 0.35s ease;
`;

const Dot = styled.div<{ $focused: boolean }>`
    width: 7px;
    height: 7px;
    background: ${(p) => (p.$focused ? 'var(--fui-accent)' : 'rgba(var(--fui-accent-rgb), 0.5)')};
    transform: rotate(45deg);
    box-shadow: ${(p) => (p.$focused ? '0 0 8px var(--fui-accent)' : 'none')};
    animation: ${(p) => (p.$focused ? css`${blink} 1.2s infinite` : 'none')};
`;

const Line = styled.div`
    width: 22px;
    height: 1px;
    background: linear-gradient(90deg, var(--fui-accent), rgba(var(--fui-accent-rgb), 0.15));
`;

const Label = styled.div<{ $focused: boolean }>`
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 3px 9px;
    background: ${(p) => (p.$focused ? 'var(--panel-solid)' : 'var(--panel-soft)')};
    border: var(--panel-border-w) var(--panel-border-style)
        ${(p) => (p.$focused ? 'var(--panel-border-strong)' : 'var(--panel-border)')};
    border-left: 3px solid
        ${(p) => (p.$focused ? 'var(--fui-accent)' : 'rgba(var(--fui-accent-rgb), 0.45)')};
    border-radius: var(--panel-btn-radius);
    box-shadow: ${(p) =>
        p.$focused ? '0 0 14px rgba(var(--fui-accent-rgb), 0.25)' : 'none'};
`;

const Code = styled.span`
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    color: rgba(var(--fui-accent-rgb), 0.7);
`;

const Name = styled.span<{ $focused: boolean }>`
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 1.5px;
    color: ${(p) => (p.$focused ? 'var(--fui-text-hi)' : 'var(--fui-text-dim)')};
`;

interface PartMarkerProps {
    code: string;
    name: string;
    position: [number, number, number];
    focused: boolean;
    partId: FocusId;
}

export function PartMarker({ code, name, position, focused, partId }: PartMarkerProps) {
    return (
        <Html position={position} zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
            <Wrap $focused={focused} data-part={partId}>
                <Dot $focused={focused} />
                <Line />
                <Label $focused={focused}>
                    <Code>{code}</Code>
                    <Name $focused={focused}>{name}</Name>
                </Label>
            </Wrap>
        </Html>
    );
}
