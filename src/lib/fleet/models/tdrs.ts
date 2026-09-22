import { resolver, type ModelDef } from '../types';

export const TDRS: ModelDef = {
    id: 'tdrs',
    code: 'TDRS',
    name: 'DATA RELAY SATELLITE',
    nameZh: '跟踪与数据中继卫星',
    url: '/models/TDRS.glb',
    commonLabel: 'GEO RELAY // 地球静止中继轨道',
    fallback: 'bus',
    common: [
        { key: 'tdr_alt', label: 'ORBIT ALTITUDE', unit: 'km', base: 35786, spread: 1.2, decimals: 0 },
        { key: 'tdr_vel', label: 'ORBIT VELOCITY', unit: 'km/s', base: 3.074, spread: 0.005, decimals: 3 },
        { key: 'tdr_batt', label: 'BATTERY SOC', unit: '%', base: 88.6, spread: 0.7, decimals: 1 },
        { key: 'tdr_per', label: 'ORBIT PERIOD', unit: 'min', base: 1436.1, spread: 0.1, decimals: 1 },
    ],
    resolve: resolver(
        [
            ['innerdish', 'antenna'],
            ['underdish', 'antenna'],
            ['dishmiddle', 'antenna'],
            ['antennagold', 'antenna'],
            ['wing', 'solar'],
            ['transparency', 'solar'],
        ],
        'bus',
    ),
    parts: [
        {
            id: 'antenna',
            code: 'ANT-01',
            name: 'HIGH-GAIN DISH',
            nameZh: '高增益碟形天线',
            blurb: 'S/Ku 波段抛物面天线组，为低轨航天器与载人飞行器提供跟踪和数据中继服务。',
            dir: [0.35, 0.5, 1.0],
            metrics: [
                { key: 'tdr_snr', label: 'LINK SNR', unit: 'dB', base: 14.6, spread: 0.7, decimals: 1 },
                { key: 'tdr_ptl', label: 'POINTING ERR', unit: 'deg', base: 0.03, spread: 0.01, decimals: 2 },
                { key: 'tdr_eirp', label: 'EIRP', unit: 'dBW', base: 62.4, spread: 0.6, decimals: 1 },
                { key: 'tdr_dtemp', label: 'DISH TEMP', unit: '°C', base: 12.5, spread: 1.2, decimals: 1 },
            ],
        },
        {
            id: 'solar',
            code: 'SAS-02',
            name: 'SOLAR ARRAY',
            nameZh: '太阳能电池阵',
            blurb: '单翼砷化镓电池阵，对日定向为中继转发载荷与平台提供功率。',
            dir: [0.05, 1.0, 0.3],
            metrics: [
                { key: 'tdr_av', label: 'ARRAY VOLTAGE', unit: 'V', base: 104.5, spread: 1.5, decimals: 1 },
                { key: 'tdr_ai', label: 'ARRAY CURRENT', unit: 'A', base: 27.2, spread: 0.9, decimals: 1 },
                { key: 'tdr_out', label: 'BUS OUTPUT', unit: 'W', base: 2760, spread: 45, decimals: 0 },
                { key: 'tdr_trk', label: 'SUN TRACK ERROR', unit: 'deg', base: 0.12, spread: 0.05, decimals: 2 },
            ],
        },
        {
            id: 'bus',
            code: 'BUS-03',
            name: 'RELAY BUS',
            nameZh: '中继平台',
            blurb: '集成转发器、姿控与电源管理的中继平台，支持多址接入与轨道机动。',
            dir: [0.85, 0.35, 0.9],
            metrics: [
                { key: 'tdr_bv', label: 'BUS VOLTAGE', unit: 'V', base: 42.1, spread: 0.4, decimals: 1 },
                { key: 'tdr_bt', label: 'AVIONICS TEMP', unit: '°C', base: 11.4, spread: 1.3, decimals: 1 },
                { key: 'tdr_cpu', label: 'CPU LOAD', unit: '%', base: 46, spread: 5, decimals: 0 },
                { key: 'tdr_link', label: 'INTER-SAT LINK', unit: 'Mbps', base: 300, spread: 12, decimals: 0 },
            ],
        },
    ],
};
