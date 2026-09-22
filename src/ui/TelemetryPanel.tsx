import styled from 'styled-components';
import { OVERVIEW, partById, type FocusId, type MetricDef, type ModelDef } from '../lib/fleet';
import { metricPercent, type TelemetryValues } from '../lib/telemetry';

const Panel = styled.aside`
    position: absolute;
    right: 22px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 30;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    background: var(--panel-solid);
    border: var(--panel-border-w) var(--panel-border-style) var(--panel-border);
    border-top: 3px solid var(--fui-accent);
    border-radius: var(--panel-radius);
    backdrop-filter: var(--panel-blur);
    font-family: 'Consolas', 'Courier New', monospace;
    box-shadow: var(--panel-shadow);
`;

const Head = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
`;

const Code = styled.span`
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--fui-accent);
`;

const State = styled.span`
    font-size: 10px;
    letter-spacing: 1.5px;
    color: var(--fui-ok);
`;

const Name = styled.div`
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 2.5px;
    color: var(--fui-text-hi);
`;

const NameZh = styled.div`
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(var(--fui-muted-rgb), 0.65);
    margin-top: 3px;
`;

const Blurb = styled.p`
    margin: 0;
    font-size: 11px;
    line-height: 1.7;
    color: rgba(var(--fui-muted-rgb), 0.75);
`;

const SectionTitle = styled.div`
    font-size: 10px;
    letter-spacing: 2.5px;
    color: rgba(var(--fui-accent-rgb), 0.5);
    border-bottom: 1px dashed rgba(var(--fui-accent-rgb), 0.2);
    padding-bottom: 5px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 9px;
`;

const RowHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
`;

const Label = styled.span`
    font-size: 10px;
    letter-spacing: 1.4px;
    color: rgba(var(--fui-muted-rgb), 0.7);
`;

const Value = styled.span`
    font-size: 13px;
    letter-spacing: 1px;
    color: var(--fui-text-mid);
    font-variant-numeric: tabular-nums;

    small {
        font-size: 9px;
        color: rgba(var(--fui-accent-rgb), 0.55);
        margin-left: 4px;
    }
`;

const Track = styled.div`
    height: 3px;
    background: rgba(var(--fui-accent-rgb), 0.12);
`;

const Fill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${(p) => p.$pct}%;
    background: linear-gradient(90deg, rgba(var(--fui-accent-rgb), 0.55), var(--fui-accent));
    box-shadow: 0 0 6px rgba(var(--fui-accent-rgb), 0.7);
    transition: width 0.5s ease;
`;

const Hint = styled.div`
    font-size: 10px;
    line-height: 1.7;
    letter-spacing: 1px;
    color: rgba(var(--fui-warn-rgb), 0.75);
    border: 1px dashed rgba(var(--fui-warn-rgb), 0.4);
    padding: 8px 10px;
`;

function MetricRow({ def, values }: { def: MetricDef; values: TelemetryValues }) {
    const v = values[def.key] ?? def.base;
    return (
        <Row>
            <RowHead>
                <Label>{def.label}</Label>
                <Value>
                    {v.toFixed(def.decimals)}
                    <small>{def.unit}</small>
                </Value>
            </RowHead>
            <Track>
                <Fill $pct={metricPercent(def, v)} />
            </Track>
        </Row>
    );
}

interface TelemetryPanelProps {
    model: ModelDef;
    focus: FocusId;
    values: TelemetryValues;
}

export function TelemetryPanel({ model, focus, values }: TelemetryPanelProps) {
    const part = focus === OVERVIEW ? null : partById(model, focus);

    return (
        <Panel data-bracket>
            <Head>
                <Code>{part ? part.code : 'CMD-00'}</Code>
                <State>{part ? 'FOCUSED' : 'ALL SYSTEMS NOMINAL'}</State>
            </Head>
            <div>
                <Name data-testid="panel-title">
                    {part ? part.name : 'SYSTEM OVERVIEW'}
                </Name>
                <NameZh>{part ? part.nameZh : '整星总览'}</NameZh>
            </div>
            <Blurb>
                {part
                    ? part.blurb
                    : `${model.nameZh}在轨巡检。点击左侧子系统矩阵或直接点击 3D 模型部件，终端将飞向对应舱段并展开遥测。`}
            </Blurb>

            <SectionTitle>{model.commonLabel}</SectionTitle>
            <div>
                {model.common.map((m) => (
                    <MetricRow key={m.key} def={m} values={values} />
                ))}
            </div>

            {part ? (
                <>
                    <SectionTitle>
                        {part.code} // {part.nameZh}
                    </SectionTitle>
                    <div>
                        {part.metrics.map((m) => (
                            <MetricRow key={m.key} def={m} values={values} />
                        ))}
                    </div>
                </>
            ) : (
                <Hint>
                    ▸ 等待子系统选择 / AWAITING SUBSYSTEM SELECTION
                    <br />
                    ▸ 快捷键 1-{model.parts.length + 1} 可直接切换视角
                </Hint>
            )}
        </Panel>
    );
}
