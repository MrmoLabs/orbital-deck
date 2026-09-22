import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Experience } from './scene/Experience';
import { TopBar } from './ui/TopBar';
import { SubsystemNav } from './ui/SubsystemNav';
import { TelemetryPanel } from './ui/TelemetryPanel';
import { BottomBar } from './ui/BottomBar';
import { BootScreen } from './ui/BootScreen';
import { FLEET, MODEL_BY_ID, OVERVIEW, type FocusId } from './lib/fleet';
import { useTelemetry } from './lib/telemetry';
import { THEME_BY_ID, THEMES, loadThemeId, nextTheme } from './lib/themes';

const AppContainer = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: var(--fui-bg);
    transition: background 0.4s ease;

    /* cockpit viewport frame: subtle inset line + corner ticks
       (color per theme via --frame-c) */
    &::before {
        content: '';
        position: absolute;
        inset: 68px 16px 68px 16px;
        pointer-events: none;
        z-index: 6;
        border: 1px solid rgba(var(--fui-accent-rgb), 0.1);
        background:
            linear-gradient(var(--frame-c), var(--frame-c)) left top / 30px 2px no-repeat,
            linear-gradient(var(--frame-c), var(--frame-c)) left top / 2px 30px no-repeat,
            linear-gradient(var(--frame-c), var(--frame-c)) right top / 30px 2px no-repeat,
            linear-gradient(var(--frame-c), var(--frame-c)) right top / 2px 30px no-repeat,
            linear-gradient(var(--frame-c), var(--frame-c)) left bottom / 30px 2px no-repeat,
            linear-gradient(var(--frame-c), var(--frame-c)) left bottom / 2px 30px no-repeat,
            linear-gradient(var(--frame-c), var(--frame-c)) right bottom / 30px 2px no-repeat,
            linear-gradient(var(--frame-c), var(--frame-c)) right bottom / 2px 30px no-repeat;
    }

    /* corner grid, subtle FUI texture (density per theme via --grid-op) */
    &::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
        background-image:
            linear-gradient(rgba(var(--fui-accent-rgb), var(--grid-op, 0.035)) 1px, transparent 1px),
            linear-gradient(
                90deg,
                rgba(var(--fui-accent-rgb), var(--grid-op, 0.035)) 1px,
                transparent 1px
            );
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
    const [themeId, setThemeId] = useState(loadThemeId);
    const theme = THEME_BY_ID[themeId] ?? THEMES[0];
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

    const cycleTheme = useCallback(() => {
        setThemeId((prev) => nextTheme(prev).id);
    }, []);

    const selectTheme = useCallback((id: string) => {
        setThemeId(id);
    }, []);

    // Reflect the theme onto <html> so CSS variables apply, and persist it.
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme.id);
        try {
            window.localStorage.setItem('rs-theme', theme.id);
        } catch {
            /* storage unavailable — theme still applies for this session */
        }
    }, [theme.id]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 't' || e.key === 'T') {
                cycleTheme();
                return;
            }
            const n = Number(e.key);
            if (n >= 1 && n <= shortcuts.length) setFocus(shortcuts[n - 1]);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [shortcuts, cycleTheme]);

    return (
        <AppContainer>
            <Experience
                theme={theme}
                model={model}
                focus={focus}
                wireframe={wireframe}
                autoRotate={autoRotate}
                onPick={handlePick}
            />
            <TopBar model={model} onSelectModel={handleModel} />
            <SubsystemNav model={model} focus={focus} onSelect={setFocus} />
            <TelemetryPanel model={model} focus={focus} values={values} />
            <BottomBar
                theme={theme}
                autoRotate={autoRotate}
                wireframe={wireframe}
                onToggleAutoRotate={() => setAutoRotate((v) => !v)}
                onToggleWireframe={() => setWireframe((v) => !v)}
                onSelectTheme={selectTheme}
            />
            <BootScreen key={model.id} model={model} />
        </AppContainer>
    );
}

export default App;
