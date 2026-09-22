/**
 * Fleet registry: every inspectable spacecraft in the terminal, its GLB asset,
 * how GLB material names map onto subsystems, camera approach directions and
 * simulated telemetry channels.
 *
 * Types + helpers live in ./types, one spacecraft per file in ./models.
 */
import type { ModelDef } from './types';
import { SDO } from './models/sdo';
import { HST } from './models/hst';
import { TDRS } from './models/tdrs';
import { GOES } from './models/goes';
import { SOHO } from './models/soho';
import { SSL1300 } from './models/ssl1300';

export * from './types';

/** Display order in the fleet dropdown. */
export const FLEET: ModelDef[] = [SDO, HST, TDRS, GOES, SOHO, SSL1300];

export const MODEL_BY_ID: Record<string, ModelDef> = Object.fromEntries(
    FLEET.map((m) => [m.id, m]),
);
