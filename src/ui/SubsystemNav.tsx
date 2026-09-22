import styled from 'styled-components';
import { OVERVIEW, type FocusId, type ModelDef } from '../lib/fleet';

const Nav = styled.nav`
    position: absolute;
    left: 22px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: 9px;
`;

const Heading = styled.div`
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    color: rgba(0, 247, 255, 0.5);
    margin-bottom: 4px;
`;

const Item = styled.button<{ $active: boolean }>`
    position: relative;
    width: 246px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    text-align: left;
    font-family: 'Consolas', 'Courier New', monospace;
    background: ${(p) => (p.$active ? 'rgba(0, 60, 80, 0.55)' : 'rgba(4, 8, 14, 0.72)')};
    border: 1px solid ${(p) => (p.$active ? '#00f7ff' : 'rgba(0, 247, 255, 0.18)')};
    border-left: 3px solid ${(p) => (p.$active ? '#00f7ff' : 'rgba(0, 247, 255, 0.35)')};
    color: ${(p) => (p.$active ? '#e8feff' : '#7fa8b5')};
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: blur(4px);

    &:hover {
        border-color: rgba(0, 247, 255, 0.7);
        color: #d6f9ff;
    }
`;

const Code = styled.span<{ $active: boolean }>`
    font-size: 10px;
    letter-spacing: 1px;
    color: ${(p) => (p.$active ? '#00f7ff' : 'rgba(0, 247, 255, 0.5)')};
    min-width: 50px;
`;

const Names = styled.span`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const En = styled.span`
    font-size: 12px;
    letter-spacing: 1.8px;
`;

const Zh = styled.span`
    font-size: 10px;
    letter-spacing: 1px;
    color: rgba(160, 200, 210, 0.55);
`;

const Dot = styled.span<{ $active: boolean }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-left: auto;
    background: ${(p) => (p.$active ? '#39ff9e' : 'rgba(57, 255, 158, 0.35)')};
    box-shadow: ${(p) => (p.$active ? '0 0 8px #39ff9e' : 'none')};
`;

interface SubsystemNavProps {
    model: ModelDef;
    focus: FocusId;
    onSelect: (id: FocusId) => void;
}

export function SubsystemNav({ model, focus, onSelect }: SubsystemNavProps) {
    return (
        <Nav>
            <Heading>SUBSYSTEM MATRIX // {model.code} 部件矩阵</Heading>

            <Item
                $active={focus === OVERVIEW}
                data-nav="overview"
                onClick={() => onSelect(OVERVIEW)}
            >
                <Code $active={focus === OVERVIEW}>CMD-00</Code>
                <Names>
                    <En>SYSTEM OVERVIEW</En>
                    <Zh>整星总览</Zh>
                </Names>
                <Dot $active={focus === OVERVIEW} />
            </Item>

            {model.parts.map((p) => {
                const active = focus === p.id;
                return (
                    <Item
                        key={p.id}
                        $active={active}
                        data-nav={p.id}
                        onClick={() => onSelect(p.id)}
                    >
                        <Code $active={active}>{p.code}</Code>
                        <Names>
                            <En>{p.name}</En>
                            <Zh>{p.nameZh}</Zh>
                        </Names>
                        <Dot $active={active} />
                    </Item>
                );
            })}
        </Nav>
    );
}
