import styled from 'styled-components';
import { FLEET, type ModelDef } from '../lib/fleet';

const Bar = styled.div`
    position: absolute;
    top: 64px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Consolas', 'Courier New', monospace;
`;

const Label = styled.div`
    font-size: 9px;
    letter-spacing: 2.5px;
    color: rgba(0, 247, 255, 0.5);
    margin-right: 4px;
`;

const Chip = styled.button<{ $active: boolean }>`
    padding: 5px 13px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 10px;
    letter-spacing: 1.5px;
    background: ${(p) => (p.$active ? 'rgba(0, 60, 80, 0.6)' : 'rgba(4, 8, 14, 0.75)')};
    border: 1px solid ${(p) => (p.$active ? '#00f7ff' : 'rgba(0, 247, 255, 0.2)')};
    color: ${(p) => (p.$active ? '#e8feff' : '#7fa8b5')};
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: blur(4px);

    &:hover {
        border-color: rgba(0, 247, 255, 0.75);
        color: #d6f9ff;
    }
`;

interface FleetSelectorProps {
    model: ModelDef;
    onSelect: (id: string) => void;
}

/** Switchable asset bay: pick which spacecraft the terminal inspects. */
export function FleetSelector({ model, onSelect }: FleetSelectorProps) {
    return (
        <Bar>
            <Label>FLEET // 在轨资产</Label>
            {FLEET.map((m) => (
                <Chip
                    key={m.id}
                    $active={m.id === model.id}
                    data-fleet={m.id}
                    onClick={() => onSelect(m.id)}
                >
                    {m.code}
                </Chip>
            ))}
        </Bar>
    );
}
