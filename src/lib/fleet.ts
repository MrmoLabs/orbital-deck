/**
 * Fleet registry: every inspectable spacecraft in the terminal, its GLB asset,
 * how GLB material names map onto subsystems, camera approach directions and
 * simulated telemetry channels.
 */

export type FocusId = string; // 'overview' | a PartDef id
export const OVERVIEW: FocusId = 'overview';

/** A single simulated telemetry channel. */
export interface MetricDef {
    key: string;
    label: string;
    unit: string;
    base: number;
    /** random-walk amplitude per tick */
    spread: number;
    decimals: number;
}

/** A physical subsystem of a spacecraft, mapped from GLB material names. */
export interface PartDef {
    id: string;
    code: string;
    name: string;
    nameZh: string;
    blurb: string;
    /** camera approach direction in model space */
    dir: [number, number, number];
    metrics: MetricDef[];
}

export interface ModelDef {
    id: string;
    /** short code used in the fleet selector */
    code: string;
    name: string;
    nameZh: string;
    url: string;
    /** heading for the always-visible orbit/telemetry block */
    commonLabel: string;
    parts: PartDef[];
    common: MetricDef[];
    /** map a GLB material name onto a part id (fallback: last rule miss) */
    resolve: (materialName: string) => string;
    /** part id used when nothing matches */
    fallback: string;
}

/** Build a material-name → part resolver from ordered substring rules. */
const resolver =
    (rules: Array<[string, string]>, fallback: string) =>
    (materialName: string): string => {
        const n = (materialName ?? '').toLowerCase();
        for (const [sub, id] of rules) {
            if (n.includes(sub)) return id;
        }
        return fallback;
    };

export const FLEET: ModelDef[] = [
    /* ---------------------------------------------------------------- SDO */
    {
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
    },
    /* ---------------------------------------------------------------- HST */
    {
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
    },
    /* --------------------------------------------------------------- TDRS */
    {
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
    },
    /* --------------------------------------------------------------- GOES */
    {
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
    },
    /* --------------------------------------------------------------- SOHO */
    {
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
    },
    /* ------------------------------------------------------------- SSL1300 */
    {
        id: 'ssl1300',
        code: 'SSL-1300',
        name: 'COMMUNICATIONS SATELLITE BUS',
        nameZh: '通信卫星平台',
        url: '/models/SSL1300.glb',
        commonLabel: 'GEO PLATFORM // 地球静止轨道平台',
        fallback: 'bus',
        common: [
            { key: 'ssl_alt', label: 'ORBIT ALTITUDE', unit: 'km', base: 35786, spread: 1.0, decimals: 0 },
            { key: 'ssl_vel', label: 'ORBIT VELOCITY', unit: 'km/s', base: 3.074, spread: 0.005, decimals: 3 },
            { key: 'ssl_batt', label: 'BATTERY SOC', unit: '%', base: 91.5, spread: 0.6, decimals: 1 },
            { key: 'ssl_per', label: 'ORBIT PERIOD', unit: 'min', base: 1436.1, spread: 0.1, decimals: 1 },
        ],
        resolve: resolver(
            [
                ['ngtdrss-solarpanel', 'solar'],
                ['lcrd-solarpanel', 'solar'],
                ['lasercom-dkgrey', 'solar'],
                ['main_dish', 'antenna'],
                ['stereo-detail', 'antenna'],
                ['lasercom', 'payload'],
            ],
            'bus',
        ),
        parts: [
            {
                id: 'solar',
                code: 'SAS-01',
                name: 'SOLAR WINGS',
                nameZh: '太阳能翼',
                blurb: '双翼展开式砷化镓电池阵，为 1300 平台提供高于 5 kW 的在轨功率。',
                dir: [0.05, 1.0, 0.35],
                metrics: [
                    { key: 'ssl_av', label: 'ARRAY VOLTAGE', unit: 'V', base: 120.4, spread: 1.6, decimals: 1 },
                    { key: 'ssl_ai', label: 'ARRAY CURRENT', unit: 'A', base: 30.2, spread: 1.0, decimals: 1 },
                    { key: 'ssl_out', label: 'BUS OUTPUT', unit: 'W', base: 3620, spread: 55, decimals: 0 },
                    { key: 'ssl_trk', label: 'SUN TRACK ERROR', unit: 'deg', base: 0.09, spread: 0.04, decimals: 2 },
                ],
            },
            {
                id: 'antenna',
                code: 'ANT-02',
                name: 'COMM DISH',
                nameZh: '通信碟形天线',
                blurb: 'Ku/Ka 波段机动通信天线，支持广播与宽带转发业务。',
                dir: [0.55, 0.45, -0.7],
                metrics: [
                    { key: 'ssl_snr', label: 'LINK SNR', unit: 'dB', base: 16.2, spread: 0.8, decimals: 1 },
                    { key: 'ssl_ptl', label: 'POINTING ERR', unit: 'deg', base: 0.02, spread: 0.01, decimals: 2 },
                    { key: 'ssl_eirp', label: 'EIRP', unit: 'dBW', base: 64.8, spread: 0.7, decimals: 1 },
                    { key: 'ssl_twt', label: 'TWTA POWER', unit: 'W', base: 85, spread: 4, decimals: 0 },
                ],
            },
            {
                id: 'payload',
                code: 'PAY-03',
                name: 'LASER COMM TERMINAL',
                nameZh: '激光通信终端',
                blurb: 'LCRD 激光通信中继终端，以近红外光束实现高速保密数据传输。',
                dir: [0.1, 0.0, -1.0],
                metrics: [
                    { key: 'lct_pw', label: 'BEAM POWER', unit: 'mW', base: 1200, spread: 45, decimals: 0 },
                    { key: 'lct_err', label: 'POINTING ERR', unit: 'nrad', base: 45, spread: 8, decimals: 0 },
                    { key: 'lct_rate', label: 'DATA RATE', unit: 'Gbps', base: 2.4, spread: 0.06, decimals: 2 },
                    { key: 'lct_temp', label: 'TERMINAL TEMP', unit: '°C', base: 8.5, spread: 1.2, decimals: 1 },
                ],
            },
            {
                id: 'bus',
                code: 'BUS-04',
                name: 'SATELLITE BUS',
                nameZh: '卫星平台',
                blurb: 'SSL-1300 通用卫星平台，集成电源、姿控、热控与推进分系统。',
                dir: [0.85, 0.45, 1.0],
                metrics: [
                    { key: 'ssl_bv', label: 'BUS VOLTAGE', unit: 'V', base: 42.3, spread: 0.4, decimals: 1 },
                    { key: 'ssl_bt', label: 'AVIONICS TEMP', unit: '°C', base: 13.6, spread: 1.4, decimals: 1 },
                    { key: 'ssl_att', label: 'ATTITUDE ERR', unit: 'arcsec', base: 0.08, spread: 0.03, decimals: 3 },
                    { key: 'ssl_cpu', label: 'CPU LOAD', unit: '%', base: 49, spread: 5, decimals: 0 },
                ],
            },
        ],
    },
];

export const MODEL_BY_ID: Record<string, ModelDef> = Object.fromEntries(
    FLEET.map((m) => [m.id, m]),
);

export function partById(model: ModelDef, id: FocusId): PartDef | undefined {
    return model.parts.find((p) => p.id === id);
}

/** All telemetry channels of a model, in display order. */
export function metricsOf(model: ModelDef): MetricDef[] {
    return [...model.common, ...model.parts.flatMap((p) => p.metrics)];
}
