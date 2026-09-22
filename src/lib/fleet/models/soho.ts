import { resolver, type ModelDef } from '../types';

export const SOHO: ModelDef = {
    id: 'soho',
    code: 'SOHO',
    name: 'SOLAR & HELIOSPHERIC OBSERVATORY',
    nameZh: '太阳与日球观测台',
    url: '/models/SOHO.glb',
    commonLabel: 'SUN-EARTH L1 // 日地拉格朗日 L1 点',
    fallback: 'bus',
    common: [
        { key: 'soho_rng', label: 'EARTH RANGE', unit: 'km', base: 1496000, spread: 900, decimals: 0 },
        { key: 'soho_vel', label: 'PROBE VELOCITY', unit: 'km/s', base: 1.023, spread: 0.004, decimals: 3 },
        { key: 'soho_batt', label: 'BATTERY SOC', unit: '%', base: 97.2, spread: 0.3, decimals: 1 },
        { key: 'soho_delay', label: 'TELEMETRY DELAY', unit: 's', base: 4.99, spread: 0.02, decimals: 2 },
    ],
    resolve: resolver(
        [
            ['solarfaces', 'solar'],
            ['solarbacking', 'solar'],
            ['sa_', 'solar'],
            ['goldbumpblinn', 'payload'],
            ['goldblinn', 'payload'],
            ['midgreyblinn', 'payload'],
            ['darkgreyblinn', 'payload'],
        ],
        'bus',
    ),
    parts: [
        {
            id: 'solar',
            code: 'SAS-01',
            name: 'SOLAR ARRAY',
            nameZh: '太阳能电池阵',
            blurb: '四扇伸展式太阳能电池板，为日地 L1 轨道上的观测平台提供功率。',
            dir: [0.05, 1.0, 0.35],
            metrics: [
                { key: 'soho_av', label: 'ARRAY VOLTAGE', unit: 'V', base: 50.2, spread: 0.8, decimals: 1 },
                { key: 'soho_ai', label: 'ARRAY CURRENT', unit: 'A', base: 35.4, spread: 1.1, decimals: 1 },
                { key: 'soho_out', label: 'BUS OUTPUT', unit: 'W', base: 1750, spread: 40, decimals: 0 },
                { key: 'soho_trk', label: 'SUN TRACK ERROR', unit: 'deg', base: 0.1, spread: 0.04, decimals: 2 },
            ],
        },
        {
            id: 'payload',
            code: 'PAY-02',
            name: 'SOLAR INSTRUMENTS',
            nameZh: '太阳观测载荷',
            blurb: 'LASCO 日冕仪、EIT 极紫外成像仪等载荷，持续监测太阳活动与日冕物质抛射。',
            dir: [0.4, 0.85, 0.6],
            metrics: [
                { key: 'soho_cad', label: 'CORONAGRAPH CADENCE', unit: 's', base: 20, spread: 1.0, decimals: 1 },
                { key: 'soho_lya', label: 'LYMAN-ALPHA BAND', unit: 'nm', base: 121.6, spread: 0.3, decimals: 1 },
                { key: 'soho_data', label: 'SCIENCE DATA', unit: 'kbps', base: 900, spread: 45, decimals: 0 },
                { key: 'soho_opt', label: 'OPTICS TEMP', unit: '°C', base: 21.0, spread: 1.0, decimals: 1 },
            ],
        },
        {
            id: 'bus',
            code: 'BUS-03',
            name: 'CRAFT BUS',
            nameZh: '星体平台',
            blurb: '提供姿态控制、热控与数据管理的平台舱段，维持 L1 轨道上的长期运行。',
            dir: [0.8, 0.5, 1.0],
            metrics: [
                { key: 'soho_bv', label: 'BUS VOLTAGE', unit: 'V', base: 28.2, spread: 0.3, decimals: 1 },
                { key: 'soho_bt', label: 'AVIONICS TEMP', unit: '°C', base: 16.5, spread: 1.5, decimals: 1 },
                { key: 'soho_htr', label: 'HEATER POWER', unit: 'W', base: 145, spread: 12, decimals: 0 },
                { key: 'soho_cpu', label: 'CPU LOAD', unit: '%', base: 38, spread: 5, decimals: 0 },
            ],
        },
    ],
};
