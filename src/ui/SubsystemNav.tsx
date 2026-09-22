import styled from 'styled-components';
import { OVERVIEW, type FocusId, type ModelDef } from '../lib/fleet';

const Nav = styled.nav`
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: var(--panel-soft);
    border: var(--panel-border-w) var(--panel-border-style) var(--panel-border);
    border-radius: var(--panel-radius);
    backdrop-filter: var(--panel-blur);
    box-shadow: var(--panel-shadow);
    font-family: 'Consolas', 'Courier New', monospace;
`;

const Heading = styled.div`
    font-family: var(--font-display);
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--hud-label);
    margin-bottom: 4px;
    padding-bottom: 6px;
    border-bottom: 1px dashed rgba(var(--fui-accent-rgb), 0.25);
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
    background: ${(p) => (p.$active ? 'var(--item-active-bg)' : 'var(--item-bg)')};
    border: var(--panel-border-w) var(--panel-border-style)
        ${(p) => (p.$active ? 'var(--fui-accent)' : 'var(--panel-border)')};
    border-left: 3px solid
        ${(p) => (p.$active ? 'var(--fui-accent)' : 'rgba(var(--fui-accent-rgb), 0.35)')};
    border-radius: var(--panel-btn-radius);
    color: ${(p) => (p.$active ? 'var(--fui-text-hi)' : 'var(--fui-text-dim)')};
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: var(--panel-blur);

    &:hover {
        border-color: var(--panel-border-strong);
        color: var(--fui-accent-soft);
    }
`;

const Code = styled.span<{ $active: boolean }>`
    font-size: 10px;
    letter-spacing: 1px;
    color: ${(p) => (p.$active ? 'var(--fui-accent)' : 'rgba(var(--fui-accent-rgb), 0.5)')};
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
    color: rgba(var(--fui-muted-rgb), 0.55);
`;

const Dot = styled.span<{ $active: boolean }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-left: auto;
    background: ${(p) => (p.$active ? 'var(--fui-ok)' : 'rgba(var(--fui-ok-rgb), 0.35)')};
    box-shadow: ${(p) => (p.$active ? '0 0 8px var(--fui-ok)' : 'none')};
`;

interface SubsystemNavProps {
    model: ModelDef;
    focus: FocusId;
    onSelect: (id: FocusId) => void;
}

export function SubsystemNav({ model, focus, onSelect }: SubsystemNavProps) {
    return (
        <Nav data-bracket>
            <Heading>SUBSYSTEM MATRIX // {model.code} 部件矩阵</Heading>

            <Item
                $active={focus === OVERVIEW}
                data-nav="overview"
                data-bracket
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
                        data-bracket
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
