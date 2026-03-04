import styled from 'styled-components';

interface UIOverlayProps {
    currentFocus: string;
    onFocusChange: (focus: 'overview' | 'solarArrays' | 'commDish') => void;
}

const OverlayContainer = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 10;
  pointer-events: auto;
`;

// "Cyber" Button Style
const CyberButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(0, 247, 255, 0.2)' : 'rgba(0, 0, 0, 0.6)'};
  border: 1px solid ${props => props.$active ? '#00f7ff' : '#444'};
  color: ${props => props.$active ? '#00f7ff' : '#aaa'};
  padding: 10px 24px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #00f7ff;
    color: #fff;
    box-shadow: 0 0 10px rgba(0, 247, 255, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: #00f7ff;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.3s;
  }
`;

export function UIOverlay({ currentFocus, onFocusChange }: UIOverlayProps) {
    return (
        <OverlayContainer>
            <CyberButton
                $active={currentFocus === 'overview'}
                onClick={() => onFocusChange('overview')}
            >
                System Overview
            </CyberButton>

            <CyberButton
                $active={currentFocus === 'solarArrays'}
                onClick={() => onFocusChange('solarArrays')}
            >
                Solar Arrays
            </CyberButton>

            <CyberButton
                $active={currentFocus === 'commDish'}
                onClick={() => onFocusChange('commDish')}
            >
                Comm Dish
            </CyberButton>
        </OverlayContainer>
    );
}
