import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Experience } from './scene/Experience';
import { TopBar } from './ui/TopBar';
import { FleetSelector } from './ui/FleetSelector';
import { SubsystemNav } from './ui/SubsystemNav';
import { TelemetryPanel } from './ui/TelemetryPanel';
import { BottomBar } from './ui/BottomBar';
import { BootScreen } from './ui/BootScreen';
import { FLEET, MODEL_BY_ID, OVERVIEW, type FocusId } from './lib/fleet';
import { useTelemetry } from './lib/telemetry';

const AppContainer = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #04060b;

    /* corner grid, subtle FUI texture */
    &::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
        background-image:
            linear-gradient(rgba(0, 247, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 247, 255, 0.035) 1px, transparent 1px);
        background-size: 64px 64px;
        mask-image: radial-gradient(ellipse at center, transparent 45%, black 100%);
    }
`;

function App() {
    const [modelId, setModelId] = useState(FLEET[0].id);
    const model = MODEL_BY_ID[modelId];
    const [focus, setFocus] = useState<FocusId>(OVERVIEW);
    const [autoRotate, setAutoRotate] = useState(true);
    const [wireframe, setWireframe] = useState(false);
    const values = useTelemetry(model);

    const shortcuts = useMemo<FocusId[]>(
        () => [OVERVIEW, ...model.parts.map((p) => p.id)],
        [model],
    );

    const handlePick = useCallback((id: FocusId) => {
        setFocus((prev) => (prev === id ? OVERVIEW : id));
    }, []);

    const handleModel = useCallback((id: string) => {
        setModelId(id);
        setFocus(OVERVIEW);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const n = Number(e.key);
            if (n >= 1 && n <= shortcuts.length) setFocus(shortcuts[n - 1]);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [shortcuts]);

    return (
        <AppContainer>
            <Experience
                model={model}
                focus={focus}
                wireframe={wireframe}
                autoRotate={autoRotate}
                onPick={handlePick}
            />
            <TopBar model={model} />
            <FleetSelector model={model} onSelect={handleModel} />
            <SubsystemNav model={model} focus={focus} onSelect={setFocus} />
            <TelemetryPanel model={model} focus={focus} values={values} />
            <BottomBar
                autoRotate={autoRotate}
                wireframe={wireframe}
                onToggleAutoRotate={() => setAutoRotate((v) => !v)}
                onToggleWireframe={() => setWireframe((v) => !v)}
            />
            <BootScreen key={model.id} model={model} />
        </AppContainer>
    );
}

export default App;
