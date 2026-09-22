import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ThemeDef } from '../../lib/themes';

/** Paint the theme's gradient sky into a texture (fullscreen background). */
function makeSkyTexture(theme: ThemeDef): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');
    if (ctx) {
        if (theme.sceneGrad === 'linear') {
            const g = ctx.createLinearGradient(0, 0, 0, c.height);
            g.addColorStop(0, theme.sceneTop);
            g.addColorStop(1, theme.sceneDeep);
            ctx.fillStyle = g;
        } else {
            const g = ctx.createRadialGradient(
                c.width * 0.5,
                c.height * 0.42,
                40,
                c.width * 0.5,
                c.height * 0.5,
                c.width * 0.62,
            );
            g.addColorStop(0, theme.sceneTop);
            g.addColorStop(1, theme.sceneDeep);
            ctx.fillStyle = g;
        }
        ctx.fillRect(0, 0, c.width, c.height);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

/** Applies the theme gradient as the WebGL scene background (replaces flat black). */
export function SceneBackground({ theme }: { theme: ThemeDef }) {
    const texture = useMemo(() => makeSkyTexture(theme), [theme]);

    // free the canvas texture when the theme swaps it out
    useEffect(() => {
        return () => {
            texture.dispose();
        };
    }, [texture]);

    // same attach mechanism as <color attach="background">, but with a texture
    return <primitive object={texture} attach="background" />;
}
