import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FLEET, type ModelDef } from '../lib/fleet';
import { Dropdown, Option, OptionSub } from './Dropdown';

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
`;

const Bar = styled.header`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 0 22px;
    background: var(--bar-bg);
    border-bottom: var(--panel-border-w) var(--panel-border-style) var(--panel-border);
    backdrop-filter: var(--panel-blur);
    font-family: 'Consolas', 'Courier New', monospace;
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
`;

const Logo = styled.div`
    font-family: var(--font-display);
    font-size: 17px;
    letter-spacing: 5px;
    white-space: nowrap;
    color: var(--fui-text-hi);
    text-shadow: 0 0 12px rgba(var(--fui-accent-rgb), 0.55);

    span {
        color: var(--fui-accent);
    }
`;

const Divider = styled.div`
    width: 1px;
    height: 22px;
    flex-shrink: 0;
    background: rgba(var(--fui-accent-rgb), 0.35);
`;

const SubTitle = styled.div`
    font-size: 11px;
    letter-spacing: 2.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(var(--fui-accent-rgb), 0.6);
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: 18px;
    font-size: 11px;
    letter-spacing: 1.5px;
    flex-shrink: 0;
`;

const Clock = styled.div`
    color: var(--fui-text-mid);
    font-variant-numeric: tabular-nums;

    small {
        color: rgba(var(--fui-accent-rgb), 0.55);
        margin-left: 6px;
    }
`;

const Badge = styled.div<{ $tone: 'ok' | 'warn' }>`
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 4px 10px;
    border: 1px solid
        ${(p) => (p.$tone === 'ok' ? 'rgba(var(--fui-accent-rgb), 0.45)' : 'rgba(var(--fui-warn-rgb), 0.55)')};
    color: ${(p) => (p.$tone === 'ok' ? 'var(--fui-accent-soft)' : 'var(--fui-warn)')};
`;

const Led = styled.div<{ $tone: 'ok' | 'warn' }>`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${(p) => (p.$tone === 'ok' ? 'var(--fui-ok)' : 'var(--fui-warn)')};
    box-shadow: 0 0 8px ${(p) => (p.$tone === 'ok' ? 'var(--fui-ok)' : 'var(--fui-warn)')};
    animation: ${pulse} 1.6s infinite;
`;

function useUtcClock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);
    return now.toISOString().slice(11, 19);
}

interface TopBarProps {
    model: ModelDef;
    onSelectModel: (id: string) => void;
}

export function TopBar({ model, onSelectModel }: TopBarProps) {
    const utc = useUtcClock();
    return (
        <Bar>
            <Left>
                <Logo>
                    ORBITAL<span>DECK</span>
                </Logo>
                <Divider />
                {/* fleet picker lives in the top bar as a dropdown */}
                <Dropdown
                    label={
                        <>
                            FLEET // <strong>{model.code}</strong>
                        </>
                    }
                    triggerProps={{ 'data-fleet-btn': '' }}
                    header="ASSET BAY // 在轨资产"
                >
                    {(close) =>
                        FLEET.map((m) => (
                            <Option
                                key={m.id}
                                $active={m.id === model.id}
                                data-fleet={m.id}
                                title={m.name}
                                onClick={() => {
                                    onSelectModel(m.id);
                                    close();
                                }}
                            >
                                {m.code}
                                <OptionSub>{m.nameZh}</OptionSub>
                            </Option>
                        ))
                    }
                </Dropdown>
                <Divider />
                <SubTitle>
                    {model.code} ORBITAL INSPECTION TERMINAL // REV 2.0
                </SubTitle>
            </Left>
            <Right>
                <Clock>
                    {utc}
                    <small>UTC</small>
                </Clock>
                <Badge $tone="ok">
                    <Led $tone="ok" />
                    SIM LINK ONLINE
                </Badge>
                <Badge $tone="warn">
                    <Led $tone="warn" />
                    SIMULATED TELEMETRY
                </Badge>
            </Right>
        </Bar>
    );
}
