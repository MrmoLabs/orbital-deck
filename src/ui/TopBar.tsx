import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { ModelDef } from '../lib/fleet';

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
`;

const Bar = styled.header`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 54px;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 22px;
    background: linear-gradient(180deg, rgba(4, 8, 14, 0.95), rgba(4, 8, 14, 0.45));
    border-bottom: 1px solid rgba(0, 247, 255, 0.18);
    backdrop-filter: blur(6px);
    font-family: 'Consolas', 'Courier New', monospace;
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const Logo = styled.div`
    font-size: 17px;
    letter-spacing: 5px;
    color: #e8feff;
    text-shadow: 0 0 12px rgba(0, 247, 255, 0.55);

    span {
        color: #00f7ff;
    }
`;

const Divider = styled.div`
    width: 1px;
    height: 22px;
    background: rgba(0, 247, 255, 0.35);
`;

const SubTitle = styled.div`
    font-size: 11px;
    letter-spacing: 2.5px;
    color: rgba(0, 247, 255, 0.6);
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: 18px;
    font-size: 11px;
    letter-spacing: 1.5px;
`;

const Clock = styled.div`
    color: #b9e9f2;
    font-variant-numeric: tabular-nums;

    small {
        color: rgba(0, 247, 255, 0.55);
        margin-left: 6px;
    }
`;

const Badge = styled.div<{ $tone: 'ok' | 'warn' }>`
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 4px 10px;
    border: 1px solid
        ${(p) => (p.$tone === 'ok' ? 'rgba(0, 247, 255, 0.45)' : 'rgba(255, 179, 0, 0.55)')};
    color: ${(p) => (p.$tone === 'ok' ? '#7ef7ff' : '#ffb300')};
`;

const Led = styled.div<{ $tone: 'ok' | 'warn' }>`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${(p) => (p.$tone === 'ok' ? '#39ff9e' : '#ffb300')};
    box-shadow: 0 0 8px ${(p) => (p.$tone === 'ok' ? '#39ff9e' : '#ffb300')};
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

export function TopBar({ model }: { model: ModelDef }) {
    const utc = useUtcClock();
    return (
        <Bar>
            <Left>
                <Logo>
                    ROGUE<span>STATION</span>
                </Logo>
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
