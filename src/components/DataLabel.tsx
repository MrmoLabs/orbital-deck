import { Html } from '@react-three/drei';
import styled from 'styled-components';
import { Vector3 } from 'three';

interface DataLabelProps {
    text: string;
    position: [number, number, number] | Vector3;
    visible: boolean;
    side?: 'left' | 'right';
}

const LabelContainer = styled.div<{ $visible: boolean; $side: 'left' | 'right' }>`
  background: rgba(10, 10, 18, 0.85);
  border: 1px solid #00f7ff;
  border-left: ${props => props.$side === 'right' ? '1px solid #00f7ff' : '4px solid #00f7ff'};
  border-right: ${props => props.$side === 'left' ? '1px solid #00f7ff' : '4px solid #00f7ff'};
  color: #00f7ff;
  padding: 12px 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  width: 200px;
  pointer-events: none;
  backdrop-filter: blur(4px);
  
  /* Animation */
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'translateY(0)' : 'translateY(10px)')};
  transition: opacity 0.5s ease, transform 0.5s ease;
  
  white-space: pre-wrap;
  line-height: 1.4;
  box-shadow: 0 0 15px rgba(0, 247, 255, 0.2);

  /* Connector Line Mockup */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    ${props => props.$side === 'left' ? 'right: -20px;' : 'left: -20px;'}
    width: 20px;
    height: 1px;
    background: #00f7ff;
    opacity: 0.5;
  }
`;

export function DataLabel({ text, position, visible, side = 'left' }: DataLabelProps) {
    return (
        <Html position={position} center distanceFactor={10} style={{
            pointerEvents: 'none',
            // Shift label based on side
            transform: side === 'left' ? 'translate(-110%, 0)' : 'translate(10%, 0)'
        }}>
            <LabelContainer $visible={visible} $side={side}>
                {text}
            </LabelContainer>
        </Html>
    );
}
