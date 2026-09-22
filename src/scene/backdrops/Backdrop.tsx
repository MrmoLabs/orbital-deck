import { Stars } from '@react-three/drei';
import type { BackdropKind } from '../../lib/themes';
import { Dust, Aurora } from './Particles';
import { Draft, Radar } from './Geometry';

/**
 * Per-theme scene backdrops. The terminal showcases the model + camera work,
 * so the background is not hardwired to a starfield: every theme gets a
 * gradient sky (SceneBackground in ./Sky) plus one backdrop layer selected
 * here (starfield / floating dust / bare phosphor dark / aurora bokeh /
 * drafting grid / radar scope).
 */
export function Backdrop({ kind, accent }: { kind: BackdropKind; accent: string }) {
    switch (kind) {
        case 'stars':
            return (
                <Stars
                    radius={600}
                    depth={80}
                    count={4500}
                    factor={6}
                    saturation={0}
                    fade
                    speed={0.6}
                />
            );
        case 'dust':
            return <Dust accent={accent} />;
        case 'aurora':
            return <Aurora accent={accent} />;
        case 'draft':
            return <Draft accent={accent} />;
        case 'radar':
            return <Radar accent={accent} />;
        case 'none':
        default:
            return null;
    }
}
