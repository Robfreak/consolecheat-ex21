import type { Config } from "./config.ts";
import { BASE_HEIGHT, BASE_WIDTH, overlaySize } from "./config.ts";
import { applyDeadzone, emptyState, type PadState } from "./pad.ts";
import { SKIN_DEFS, buttonLabel } from "./skins.ts";

// The controller drawing. Pure SVG, no background: everything outside the shapes is transparent.

const STICK_R = 36;
const DOT_R = 10;

type Ctx = { config: Config; s: PadState };

function Button({ c, i, x, y, w, h, r, labelColor }: { c: Ctx; i: number; x: number; y: number; w: number; h: number; r: number; labelColor?: string | null }) {
  const { config, s } = c;
  const on = Boolean(s.pressed[i]);
  return (
    <g data-button={i} data-pressed={on ? "1" : "0"}>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={on ? config.pressed : config.base} stroke={config.accent} strokeWidth={2} />
      <text
        x={x + w / 2}
        y={y + h / 2}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={Math.min(13, h * 0.6)}
        fontWeight={600}
        fill={labelColor ?? config.accent}
      >
        {buttonLabel(config.skin, i)}
      </text>
    </g>
  );
}

function Trigger({ c, i, x }: { c: Ctx; i: number; x: number }) {
  const { config, s } = c;
  const v = Math.max(0, Math.min(1, s.values[i] ?? 0));
  return (
    <g data-trigger={i} data-value={v.toFixed(2)}>
      <rect x={x} y={10} width={120} height={16} rx={4} fill={config.base} stroke={config.accent} strokeWidth={2} />
      <rect x={x + 2} y={12} width={116 * v} height={12} rx={3} fill={config.pressed} />
      <text x={x + 60} y={18} dominantBaseline="central" textAnchor="middle" fontSize={11} fontWeight={600} fill={config.accent}>
        {buttonLabel(config.skin, i)}
      </text>
    </g>
  );
}

function Stick({ c, cx, ax, ay, click }: { c: Ctx; cx: number; ax: number; ay: number; click: number }) {
  const { config, s } = c;
  const pressed = Boolean(s.pressed[click]);
  const [dx, dy] = applyDeadzone(s.axes[ax] ?? 0, s.axes[ay] ?? 0, config.deadzone);
  const travel = STICK_R - DOT_R;
  return (
    <g data-stick={click} data-x={dx.toFixed(2)} data-y={dy.toFixed(2)}>
      <circle cx={cx} cy={222} r={STICK_R} fill={pressed ? config.pressed : config.base} stroke={config.accent} strokeWidth={2} />
      <circle cx={cx + dx * travel} cy={222 + dy * travel} r={DOT_R} fill={config.accent} fillOpacity={0.85} />
      {config.deadzone > 0 ? (
        <circle data-deadzone="" cx={cx} cy={222} r={STICK_R * config.deadzone} fill="none" stroke={config.pressed} strokeWidth={1.5} strokeDasharray="3 2" />
      ) : null}
      <text x={cx} y={222 - STICK_R - 9} dominantBaseline="central" textAnchor="middle" fontSize={11} fontWeight={600} fill={config.accent}>
        {buttonLabel(config.skin, click)}
      </text>
    </g>
  );
}

type Props = { config: Config; state: PadState | null; hint: string | null; label: string };

export function Overlay({ config, state, hint, label }: Props) {
  const s = state ?? emptyState();
  const skin = SKIN_DEFS[config.skin];
  const { width, height } = overlaySize(config);
  const font = config.skin === "retro" ? "ui-monospace, monospace" : "Outfit, 'Source Sans 3', sans-serif";
  const c: Ctx = { config, s };
  const rx = (size: number) => size * skin.round;

  return (
    <svg
      viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      data-testid="overlay-svg"
      style={{ opacity: config.opacity, fontFamily: font, maxWidth: "100%", height: "auto", display: "block" }}
    >
      <rect x={20} y={64} width={440} height={206} rx={44} fill={config.base} fillOpacity={0.55} stroke={config.accent} strokeOpacity={0.5} strokeWidth={2} />
      {config.triggers ? (
        <>
          <Trigger c={c} i={6} x={40} />
          <Trigger c={c} i={7} x={320} />
        </>
      ) : null}
      <Button c={c} i={4} x={40} y={32} w={120} h={24} r={8} />
      <Button c={c} i={5} x={320} y={32} w={120} h={24} r={8} />
      {/* D-pad */}
      <Button c={c} i={12} x={85} y={92} w={30} h={30} r={5} />
      <Button c={c} i={13} x={85} y={152} w={30} h={30} r={5} />
      <Button c={c} i={14} x={55} y={122} w={30} h={30} r={5} />
      <Button c={c} i={15} x={115} y={122} w={30} h={30} r={5} />
      {/* Face buttons */}
      <Button c={c} i={3} x={363} y={88} w={34} h={34} r={rx(17)} labelColor={skin.faceColors[3]} />
      <Button c={c} i={1} x={398} y={122} w={34} h={34} r={rx(17)} labelColor={skin.faceColors[1]} />
      <Button c={c} i={0} x={363} y={156} w={34} h={34} r={rx(17)} labelColor={skin.faceColors[0]} />
      <Button c={c} i={2} x={328} y={122} w={34} h={34} r={rx(17)} labelColor={skin.faceColors[2]} />
      {/* Centre */}
      <Button c={c} i={8} x={152} y={84} w={44} h={18} r={9} />
      <Button c={c} i={9} x={284} y={84} w={44} h={18} r={9} />
      {skin.touchpad && s.hasTouchpad ? <Button c={c} i={17} x={202} y={76} w={76} h={44} r={8} /> : null}
      <Button c={c} i={16} x={222} y={140} w={36} h={24} r={12} />
      {config.sticks ? (
        <>
          <Stick c={c} cx={170} ax={0} ay={1} click={10} />
          <Stick c={c} cx={310} ax={2} ay={3} click={11} />
        </>
      ) : (
        <>
          <Button c={c} i={10} x={150} y={208} w={40} h={24} r={12} />
          <Button c={c} i={11} x={290} y={208} w={40} h={24} r={12} />
        </>
      )}
      {hint ? (
        <text
          x={240}
          y={288}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={600}
          fill={config.accent}
          stroke={config.base}
          strokeWidth={3}
          paintOrder="stroke"
          data-testid="overlay-hint"
        >
          {hint}
        </text>
      ) : null}
    </svg>
  );
}
