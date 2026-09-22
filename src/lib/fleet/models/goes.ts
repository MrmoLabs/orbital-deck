import { resolver, type ModelDef } from '../types';

export const GOES: ModelDef = {
    id: 'goes',
    code: 'GOES',
    name: 'GEOSTATIONARY WEATHER SAT',
    nameZh: '地球静止气象卫星',
    url: '/models/GOES.glb',
    commonLabel: 'GEO WEATHER // 地球静止气象轨道',
    fallback: 'bus',
    common: [
        { key: 'goes_alt', label: 'ORBIT ALTITUDE', unit: 'km', base: 35785.4, spread: 0.8, decimals: 1 },
        { key: 'goes_vel', label: 'ORBIT VELOCITY', unit: 'km/s', base: 3.075, spread: 0.004, decimals: 3 },
        { key: 'goes_batt', label: 'BATTERY SOC', unit: '%', base: 94.2, spread: 0.5, decimals: 1 },
        { key: 'goes_per', label: 'ORBIT PERIOD', unit: 'min', base: 1436.1, spread: 0.1, decimals: 1 },
    ],
    resolve: resolver(
        [
            ['solarpanel', 'solar'],
            ['parasol-solar', 'solar'],
            ['magboom', 'boom'],
        ],
        'bus',
    ),
    parts: [
        {
            id: 'solar',
            code: 'SAS-01',
            name: 'SOLAR ARRAY',
            nameZh: '太阳能电池阵',
            blurb: '单翼伸展式太阳能电池阵，为地球静止轨道气象平台提供持续功率。',
            dir: [0.1, 0.75, 1.0],
            metrics: [
                { key: 'goes_av', label: 'ARRAY VOLTAGE', unit: 'V', base: 102.8, spread: 1.4, decimals: 1 },
                { key: 'goes_ai', label: 'ARRAY CURRENT', unit: 'A', base: 24.3, spread: 0.8, decimals: 1 },
                { key: 'goes_out', label: 'BUS OUTPUT', unit: 'W', base: 2410, spread: 40, decimals: 0 },
                { key: 'goes_trk', label: 'SUN TRACK ERROR', unit: 'deg', base: 0.16, spread: 0.06, decimals: 2 },
            ],
        },
        {
            id: 'boom',
            code: 'MAG-02',
            name: 'MAGNETOMETER BOOM',
            nameZh: '磁强计吊杆',
            blurb: '伸展式磁强计吊杆，将传感器探头送离星体磁干扰区，测量空间磁场。',
            dir: [-0.7, 0.35, 0.8],
            metrics: [
                { key: 'mag_field', label: 'LOCAL MAG FIELD', unit: 'nT', base: 42.5, spread: 2.0, decimals: 1 },
                { key: 'mag_temp', label: 'SENSOR TEMP', unit: '°C', base: -18, spread: 2, decimals: 1 },
                { key: 'mag_rate', label: 'SAMPLE RATE', unit: 'Hz', base: 20, spread: 1.5, decimals: 0 },
                { key: 'mag_drift', label: 'CAL DRIFT', unit: 'nT', base: 0.02, spread: 0.01, decimals: 3 },
            ],
        },
        {
            id: 'bus',
            code: 'BUS-03',
            name: 'AVIONICS BUS',
            nameZh: '星务总线舱',
            blurb: '承载 ABI 成像仪、姿态控制与电源分系统的静止轨道平台，输出全盘气象数据。',
            dir: [0.8, 0.45, 1.0],
            metrics: [
                { key: 'goes_bv', label: 'BUS VOLTAGE', unit: 'V', base: 28.6, spread: 0.3, decimals: 1 },
                { key: 'goes_bt', label: 'AVIONICS TEMP', unit: '°C', base: 14.2, spread: 1.4, decimals: 1 },
                { key: 'goes_att', label: 'ATTITUDE ERR', unit: 'arcsec', base: 5.2, spread: 1.2, decimals: 1 },
                { key: 'goes_cpu', label: 'CPU LOAD', unit: '%', base: 52, spread: 6, decimals: 0 },
            ],
        },
    ],
};
