import { resolver, type ModelDef } from '../types';

export const HST: ModelDef = {
    id: 'hst',
    code: 'HST',
    name: 'HUBBLE SPACE TELESCOPE',
    nameZh: '哈勃太空望远镜',
    url: '/models/HST.glb',
    commonLabel: 'LEO ORBIT // 近地轨道',
    fallback: 'hull',
    common: [
        { key: 'hst_alt', label: 'ORBIT ALTITUDE', unit: 'km', base: 539.7, spread: 1.5, decimals: 1 },
        { key: 'hst_vel', label: 'ORBIT VELOCITY', unit: 'km/s', base: 7.613, spread: 0.005, decimals: 3 },
        { key: 'hst_batt', label: 'BATTERY SOC', unit: '%', base: 92.1, spread: 0.6, decimals: 1 },
        { key: 'hst_per', label: 'ORBIT PERIOD', unit: 'min', base: 95.42, spread: 0.02, decimals: 2 },
    ],
    resolve: resolver(
        [
            ['wfc', 'wfc'],
            ['hbltel_4', 'ota'],
        ],
        'hull',
    ),
    parts: [
        {
            id: 'hull',
            code: 'STR-01',
            name: 'STRUCTURE & ARRAYS',
            nameZh: '结构与太阳翼',
            blurb: '石墨环氧结构框架与双翼太阳能电池阵，为望远镜提供结构支撑与在轨功率。',
            dir: [0.9, 0.4, 0.75],
            metrics: [
                { key: 'str_out', label: 'SOLAR ARRAY OUTPUT', unit: 'W', base: 5100, spread: 110, decimals: 0 },
                { key: 'str_v', label: 'STRING VOLTAGE', unit: 'V', base: 141.2, spread: 1.4, decimals: 1 },
                { key: 'str_wheel', label: 'REACTION WHEEL', unit: 'rpm', base: 3180, spread: 90, decimals: 0 },
                { key: 'str_temp', label: 'DECK TEMP', unit: '°C', base: -3.5, spread: 1.5, decimals: 1 },
            ],
        },
        {
            id: 'ota',
            code: 'OPT-02',
            name: 'OPTICAL TUBE ASSEMBLY',
            nameZh: '光学镜筒',
            blurb: '2.4 米主镜与前向光阑遮光罩，构成哈勃的里奇-克雷蒂安光学系统。',
            dir: [0.25, 0.35, 1.0],
            metrics: [
                { key: 'ota_baf', label: 'APERTURE BAFFLE TEMP', unit: '°C', base: 21.6, spread: 0.5, decimals: 1 },
                { key: 'ota_prim', label: 'PRIMARY MIRROR TEMP', unit: '°C', base: 22.1, spread: 0.3, decimals: 1 },
                { key: 'ota_focus', label: 'FOCUS POSITION', unit: 'mm', base: 0.42, spread: 0.06, decimals: 2 },
                { key: 'ota_jit', label: 'POINTING JITTER', unit: 'arcsec', base: 0.007, spread: 0.002, decimals: 3 },
            ],
        },
        {
            id: 'wfc',
            code: 'PAY-03',
            name: 'WIDE FIELD CAMERA',
            nameZh: '广角相机',
            blurb: '第三代广角相机（WFC3），覆盖紫外到近红外观测波段，是哈勃的主力科学仪器。',
            dir: [0.4, -0.75, 0.55],
            metrics: [
                { key: 'wfc_ccd', label: 'CCD TEMPERATURE', unit: '°C', base: -88.2, spread: 1.2, decimals: 1 },
                { key: 'wfc_exp', label: 'EXPOSURE TIME', unit: 's', base: 420, spread: 30, decimals: 0 },
                { key: 'wfc_read', label: 'READ NOISE', unit: 'e-', base: 5.0, spread: 0.4, decimals: 1 },
                { key: 'wfc_rate', label: 'DOWNLINK RATE', unit: 'kbps', base: 1200, spread: 60, decimals: 0 },
            ],
        },
    ],
};
