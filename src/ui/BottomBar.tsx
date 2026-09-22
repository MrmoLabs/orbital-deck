import styled from 'styled-components';
import { THEMES, type ThemeDef } from '../lib/themes';
import { Dropdown, Option, OptionSub } from './Dropdown';

const Bar = styled.footer`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 56px;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 0 22px;
    background: var(--bar-bg);
    border-top: var(--panel-border-w) var(--panel-border-style) var(--panel-border);
    backdrop-filter: var(--panel-blur);
    font-family: 'Consolas', 'Courier New', monospace;
`;

const Group = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
`;

const Hint = styled.div`
    flex: 1;
    min-width: 0;
    font-size: 10px;
    letter-spacing: 1.5px;
    color: var(--hud-hint);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Toggle = styled.button<{ $active: boolean }>`
    padding: 7px 18px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: ${(p) => (p.$active ? 'var(--item-active-bg)' : 'var(--item-bg)')};
    border: var(--panel-border-w) var(--panel-border-style)
        ${(p) => (p.$active ? 'var(--fui-accent)' : 'var(--panel-border)')};
    border-radius: var(--panel-btn-radius);
    color: ${(p) => (p.$active ? 'var(--fui-text-hi)' : 'var(--fui-text-dim)')};
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: var(--panel-blur);

    &:hover {
        border-color: var(--fui-accent);
        color: var(--fui-text-hi);
    }
`;

const Swatch = styled.span<{ $bg: string; $accent: string }>`
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    background: ${(p) => p.$bg};
    border: 1px solid ${(p) => p.$accent};
`;

interface BottomBarProps {
    theme: ThemeDef;
    autoRotate: boolean;
    wireframe: boolean;
    onToggleAutoRotate: () => void;
    onToggleWireframe: () => void;
    onSelectTheme: (id: string) => void;
}

export function BottomBar({
    theme,
    autoRotate,
    wireframe,
    onToggleAutoRotate,
    onToggleWireframe,
    onSelectTheme,
}: BottomBarProps) {
    return (
        <Bar>
            <Group>
                <Toggle $active={autoRotate} onClick={onToggleAutoRotate}>
                    Auto Rotate
                </Toggle>
                <Toggle $active={wireframe} onClick={onToggleWireframe}>
                    Blueprint Mesh
                </Toggle>
            </Group>
            <Hint>
                点击 3D 部件聚焦 · 拖拽旋转 · 滚轮缩放 · 点击空白处返回总览 · 数字键切换视角 · T
                循环主题
            </Hint>
            <Group>
                {/* theme picker: dropdown instead of a single cycle button */}
                <Dropdown
                    up
                    align="end"
                    label={
                        <>
                            STYLE · <strong>{theme.name}</strong>
                        </>
                    }
                    triggerProps={{ 'data-theme-btn': '' }}
                    header="INTERFACE STYLE // 界面风格"
                >
                    {(close) =>
                        THEMES.map((t) => (
                            <Option
                                key={t.id}
                                $active={t.id === theme.id}
                                data-theme-option={t.id}
                                onClick={() => {
                                    onSelectTheme(t.id);
                                    close();
                                }}
                            >
                                <Swatch $bg={t.bg} $accent={t.accent} />
                                {t.name}
                                <OptionSub>{t.nameZh}</OptionSub>
                            </Option>
                        ))
                    }
                </Dropdown>
            </Group>
        </Bar>
    );
}
