import { resolver, type ModelDef } from '../types';

export const SDO: ModelDef = {
    id: 'sdo',
    code: 'SDO',
    name: 'SOLAR DYNAMICS OBSERVATORY',
    nameZh: '太阳动力学天文台',
    url: '/models/SDO.glb',
    commonLabel: 'GEO ORBIT // 地球静止轨道',
    fallback: 'bus',
    common: [
        { key: 'orb_alt', label: 'ORBIT ALTITUDE', unit: 'km', base: 35785.6, spread: 0.9, decimals: 1 },
        { key: 'orb_vel', label: 'ORBIT VELOCITY', unit: 'km/s', base: 3.075, spread: 0.006, decimals: 3 },
        { key: 'eps_batt', label: 'BATTERY SOC', unit: '%', base: 96.4, spread: 0.5, decimals: 1 },
        { key: 'ttc_rng', label: 'TT&C RANGE', unit: 'km', base: 41180, spread: 45, decimals: 0 },
    ],
    resolve: resolver(
        [
            ['calipso-solar', 'solar'],
            ['solarback', 'solar'],
            ['instr-img', 'payload'],
            ['dish', 'antenna'],
        ],
        'bus',
    ),
    parts: [
        {
            id: 'solar',
            code: 'SAS-01',
            name: 'SOLAR ARRAY',
            nameZh: '太阳能电池阵',
            blurb: '双翼砷化镓电池阵列，对日定向连续跟踪，为整星母线提供功率并为蓄电池充电。',
            dir: [0.1, 0.6, 1.0],
            metrics: [
                { key: 'sas_v', label: 'ARRAY VOLTAGE', unit: 'V', base: 104.2, spread: 1.6, decimals: 1 },
                { key: 'sas_i', label: 'ARRAY CURRENT', unit: 'A', base: 27.6, spread: 0.9, decimals: 1 },
                { key: 'sas_out', label: 'BUS OUTPUT', unit: 'W', base: 2872, spread: 38, decimals: 0 },
                { key: 'sas_err', label: 'SUN TRACK ERROR', unit: 'deg', base: 0.14, spread: 0.06, decimals: 2 },
            ],
        },
        {
            id: 'payload',
            code: 'PAY-02',
            name: 'PAYLOAD DECK',
            nameZh: '载荷仪器舱',
            blurb: 'AIA 多波段成像仪与 HMI 矢量磁像仪载荷甲板，持续观测太阳光球与日冕。',
            dir: [0.55, 0.7, 0.9],
            metrics: [
                { key: 'pay_cadence', label: 'IMAGE CADENCE', unit: 's', base: 12.0, spread: 0.4, decimals: 1 },
                { key: 'pay_chan', label: 'ACTIVE CHANNEL', unit: 'ch', base: 7, spread: 0.5, decimals: 0 },
                { key: 'pay_vol', label: 'SCIENCE DATA', unit: 'TB/d', base: 1.48, spread: 0.06, decimals: 2 },
                { key: 'pay_temp', label: 'OPTICS TEMP', unit: '°C', base: -6.5, spread: 1.2, decimals: 1 },
            ],
        },
        {
            id: 'antenna',
            code: 'ANT-03',
            name: 'HIGH-GAIN ANTENNA',
            nameZh: '高增益天线',
            blurb: 'S 波段高增益天线，通过中继卫星链路下传科学数据与接收遥控指令。',
            dir: [0.55, 0.4, 1.0],
            metrics: [
                { key: 'ant_snr', label: 'LINK SNR', unit: 'dB', base: 14.2, spread: 0.7, decimals: 1 },
                { key: 'ant_rate', label: 'DOWNLINK RATE', unit: 'Mbps', base: 6.128, spread: 0.15, decimals: 3 },
                { key: 'ant_err', label: 'POINTING ERR', unit: 'deg', base: 0.05, spread: 0.03, decimals: 2 },
                { key: 'ant_power', label: 'TX POWER', unit: 'W', base: 20.0, spread: 0.6, decimals: 1 },
            ],
        },
        {
            id: 'bus',
            code: 'BUS-04',
            name: 'AVIONICS BUS',
            nameZh: '星务总线舱',
            blurb: '集成电源管理、姿态控制、热控与星载计算机的总线舱段，维持整星在轨运行。',
            dir: [0.8, 0.5, 1.0],
            metrics: [
                { key: 'bus_v', label: 'BUS VOLTAGE', unit: 'V', base: 28.4, spread: 0.3, decimals: 1 },
                { key: 'bus_temp', label: 'AVIONICS TEMP', unit: '°C', base: 12.8, spread: 1.4, decimals: 1 },
                { key: 'bus_att', label: 'ATTITUDE ERR', unit: 'arcsec', base: 0.62, spread: 0.2, decimals: 2 },
                { key: 'bus_load', label: 'CPU LOAD', unit: '%', base: 43, spread: 5, decimals: 0 },
            ],
        },
    ],
};
