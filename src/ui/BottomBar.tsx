import styled from 'styled-components';

const Wrap = styled.footer`
    position: absolute;
    left: 50%;
    bottom: 26px;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    font-family: 'Consolas', 'Courier New', monospace;
`;

const Buttons = styled.div`
    display: flex;
    gap: 12px;
`;

const Toggle = styled.button<{ $active: boolean }>`
    padding: 8px 20px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: ${(p) => (p.$active ? 'rgba(0, 247, 255, 0.18)' : 'rgba(4, 8, 14, 0.75)')};
    border: 1px solid ${(p) => (p.$active ? '#00f7ff' : 'rgba(0, 247, 255, 0.25)')};
    color: ${(p) => (p.$active ? '#e8feff' : '#7fa8b5')};
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: blur(4px);

    &:hover {
        border-color: #00f7ff;
        color: #e8feff;
    }
`;

const Hint = styled.div`
    font-size: 10px;
    letter-spacing: 1.5px;
    color: rgba(127, 168, 181, 0.7);
    text-align: center;
`;

interface BottomBarProps {
    autoRotate: boolean;
    wireframe: boolean;
    onToggleAutoRotate: () => void;
    onToggleWireframe: () => void;
}

export function BottomBar({
    autoRotate,
    wireframe,
    onToggleAutoRotate,
    onToggleWireframe,
}: BottomBarProps) {
    return (
        <Wrap>
            <Buttons>
                <Toggle $active={autoRotate} onClick={onToggleAutoRotate}>
                    Auto Rotate
                </Toggle>
                <Toggle $active={wireframe} onClick={onToggleWireframe}>
                    Blueprint Mesh
                </Toggle>
            </Buttons>
            <Hint>
                点击 3D 部件聚焦 · 拖拽旋转 · 滚轮缩放 · 点击空白处返回总览 · 数字键切换视角
            </Hint>
        </Wrap>
    );
}
