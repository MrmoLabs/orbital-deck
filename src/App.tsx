import { useState } from 'react';
import styled from 'styled-components';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
`;

type FocusState = 'overview' | 'solarArrays' | 'commDish';

function App() {
  const [focusState, setFocusState] = useState<FocusState>('overview');

  return (
    <AppContainer>
      <Experience focusState={focusState} />
      <UIOverlay currentFocus={focusState} onFocusChange={setFocusState} />
    </AppContainer>
  );
}

export default App;
