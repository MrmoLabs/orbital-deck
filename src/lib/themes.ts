/**
 * Page themes: every entry is a full interface STYLE (panel shape, border
 * language, material, decorations) with its own built-in palette. The id
 * drives the CSS token blocks in index.css ([data-theme="<id>"]); accent/bg
 * also feed the WebGL scene colors that cannot live in CSS variables
 * (canvas clear color, rim light, emissive part highlight).
 * Keep accent/bg in sync with the matching block in index.css.
 */

/**
 * Scene backdrop kinds: the project showcases the MODEL and dynamic camera
 * moves, so the background is deliberately NOT hardwired to a starfield —
 * every theme picks its own backdrop (or none) from this list.
 */
export type BackdropKind = 'stars' | 'dust' | 'none' | 'aurora' | 'draft' | 'radar';

export interface ThemeDef {
    id: string;
    /** display label in the theme dropdown */
    name: string;
    /** short zh label for the dropdown */
    nameZh: string;
    /** accent: 3D rim light + emissive highlight + --fui-accent */
    accent: string;
    /** page + WebGL clear color + --fui-bg */
    bg: string;
    /** scene gradient bright stop (radial center / linear top) */
    sceneTop: string;
    /** scene gradient dark stop (radial edge / linear bottom) */
    sceneDeep: string;
    /** scene gradient shape */
    sceneGrad: 'radial' | 'linear';
    /** WebGL backdrop behind the model (see Backdrop.tsx) */
    backdrop: BackdropKind;
}

export const THEMES: ThemeDef[] = [
    { id: 'fui', name: 'FUI CLASSIC', nameZh: '经典终端', accent: '#00f7ff', bg: '#04060b', sceneTop: '#0c1f36', sceneDeep: '#030509', sceneGrad: 'radial', backdrop: 'stars' },
    { id: 'yorha', name: 'YORHA', nameZh: '工业沙盘', accent: '#d9a441', bg: '#17140f', sceneTop: '#322617', sceneDeep: '#100e0a', sceneGrad: 'radial', backdrop: 'dust' },
    { id: 'crt', name: 'CRT PHOSPHOR', nameZh: '荧光屏幕', accent: '#3dff7a', bg: '#020604', sceneTop: '#0a4a22', sceneDeep: '#010402', sceneGrad: 'radial', backdrop: 'none' },
    { id: 'glass', name: 'GLASS', nameZh: '流光玻璃', accent: '#8ab4ff', bg: '#0b1020', sceneTop: '#1d2e58', sceneDeep: '#070c1a', sceneGrad: 'linear', backdrop: 'aurora' },
    { id: 'blueprint', name: 'BLUEPRINT', nameZh: '工程蓝图', accent: '#1565d8', bg: '#0a1a2e', sceneTop: '#17416e', sceneDeep: '#051322', sceneGrad: 'radial', backdrop: 'draft' },
    { id: 'milspec', name: 'MIL-SPEC', nameZh: '军规雷达', accent: '#7dff5c', bg: '#0a0e07', sceneTop: '#123013', sceneDeep: '#040703', sceneGrad: 'radial', backdrop: 'radar' },
];

export const THEME_BY_ID: Record<string, ThemeDef> = Object.fromEntries(
    THEMES.map((t) => [t.id, t]),
);

export const THEME_STORAGE_KEY = 'rs-theme';

/** Next theme in the cycle order (used by the button and the T shortcut). */
export function nextTheme(id: string): ThemeDef {
    const i = THEMES.findIndex((t) => t.id === id);
    return THEMES[(i + 1) % THEMES.length];
}

/** Restore the persisted theme, falling back to the default palette. */
export function loadThemeId(): string {
    try {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (saved && THEME_BY_ID[saved]) return saved;
    } catch {
        /* storage unavailable — keep default */
    }
    return THEMES[0].id;
}
