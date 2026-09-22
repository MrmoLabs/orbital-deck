import styled, { css, keyframes } from 'styled-components';
import { Html } from '@react-three/drei';
import { FUI_CYAN, type FocusId } from '../lib/fleet';

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
    background: ${(p) => (p.$focused ? FUI_CYAN : 'rgba(0,247,255,0.5)')};
    transform: rotate(45deg);
    box-shadow: ${(p) => (p.$focused ? `0 0 8px ${FUI_CYAN}` : 'none')};
    animation: ${(p) => (p.$focused ? css`${blink} 1.2s infinite` : 'none')};
`;

const Line = styled.div`
    width: 22px;
    height: 1px;
    background: linear-gradient(90deg, ${FUI_CYAN}, rgba(0, 247, 255, 0.15));
`;

const Label = styled.div<{ $focused: boolean }>`
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 3px 9px;
    background: rgba(4, 8, 14, ${(p) => (p.$focused ? 0.9 : 0.65)});
    border: 1px solid rgba(0, 247, 255, ${(p) => (p.$focused ? 0.8 : 0.25)});
    border-left: 3px solid rgba(0, 247, 255, ${(p) => (p.$focused ? 1 : 0.45)});
    box-shadow: ${(p) => (p.$focused ? '0 0 14px rgba(0,247,255,0.25)' : 'none')};
`;

const Code = styled.span`
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    color: rgba(0, 247, 255, 0.7);
`;

const Name = styled.span<{ $focused: boolean }>`
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 1.5px;
    color: ${(p) => (p.$focused ? '#e8feff' : '#7fa8b5')};
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
