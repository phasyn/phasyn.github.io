import { useId, type CSSProperties } from 'react';
import { cn } from '../../../../lib/cn.ts';
import type { HomeCopy } from '../../copy.ts';

type DiagramCopy = HomeCopy['hood']['diagram'];

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ComponentBox extends Box {
  title: string;
  id: string;
  device: string;
  sub?: string;
}

interface Layout {
  viewBox: string;
  /** Gradient end point (the light runs cyan at the top-left to violet at the bottom-right of the diagram). */
  extent: [number, number];
  browser: Box;
  controller: Box;
  machines: { box: Box; chip: Box; label: string; labelX: number }[];
  components: ComponentBox[];
  browserLink: string;
  control: string[];
  flows: { d: string; duration: number; delay: number }[];
  fileRefLabel: { x: number; y: number; anchor: 'start' | 'middle' };
  controlLabel: { x: number; y: number };
  showControllerSub: boolean;
}

function wideLayout(c: DiagramCopy): Layout {
  return {
    viewBox: '0 0 1120 540',
    extent: [1120, 540],
    browser: { x: 16, y: 214, w: 150, h: 76 },
    controller: { x: 206, y: 196, w: 196, h: 112 },
    machines: [
      { box: { x: 448, y: 20, w: 656, h: 168 }, chip: { x: 472, y: 34, w: 128, h: 28 }, label: 'DGX Spark · GB10', labelX: 614 },
      { box: { x: 448, y: 214, w: 656, h: 306 }, chip: { x: 472, y: 228, w: 128, h: 28 }, label: 'PC · RTX 5080 + RTX 3060', labelX: 614 },
    ],
    components: [
      { x: 472, y: 80, w: 236, h: 88, title: c.textEncoder, id: 'te-gb10', device: 'GB10' },
      { x: 472, y: 280, w: 184, h: 104, title: 'DiT', id: 'dit-5080', device: 'RTX 5080', sub: c.ditSub },
      { x: 704, y: 266, w: 180, h: 84, title: c.videoVae, id: 'vae-5080', device: 'RTX 5080' },
      { x: 704, y: 404, w: 180, h: 84, title: c.audioVae, id: 'audio-3060', device: 'RTX 3060' },
      { x: 930, y: 334, w: 154, h: 84, title: c.mux, id: 'mux', device: 'CPU' },
    ],
    browserLink: 'M166 252 H206',
    control: ['M402 232 C430 232 438 48 472 48', 'M402 272 C430 272 438 242 472 242'],
    flows: [
      { d: 'M590 168 C590 214 564 236 564 280', duration: 2.6, delay: 0 },
      { d: 'M656 314 C680 314 680 308 704 308', duration: 1.6, delay: 0.9 },
      { d: 'M656 356 C684 356 676 446 704 446', duration: 2.2, delay: 1.1 },
      { d: 'M884 308 C910 308 904 364 930 364', duration: 2, delay: 1.9 },
      { d: 'M884 446 C910 446 904 390 930 390', duration: 2, delay: 2 },
    ],
    fileRefLabel: { x: 606, y: 206, anchor: 'start' },
    controlLabel: { x: 404, y: 150 },
    showControllerSub: true,
  };
}

function tallLayout(c: DiagramCopy): Layout {
  return {
    viewBox: '0 0 360 900',
    extent: [360, 900],
    browser: { x: 105, y: 12, w: 150, h: 56 },
    controller: { x: 90, y: 104, w: 180, h: 76 },
    machines: [
      { box: { x: 30, y: 212, w: 318, h: 176 }, chip: { x: 46, y: 230, w: 112, h: 28 }, label: 'DGX Spark · GB10', labelX: 168 },
      { box: { x: 30, y: 434, w: 318, h: 452 }, chip: { x: 46, y: 452, w: 112, h: 28 }, label: 'PC · RTX 5080 + RTX 3060', labelX: 168 },
    ],
    components: [
      { x: 46, y: 276, w: 286, h: 92, title: c.textEncoder, id: 'te-gb10', device: 'GB10' },
      { x: 46, y: 500, w: 286, h: 92, title: 'DiT', id: 'dit-5080', device: 'RTX 5080', sub: c.ditSub },
      { x: 46, y: 628, w: 136, h: 84, title: c.videoVae, id: 'vae-5080', device: 'RTX 5080' },
      { x: 196, y: 628, w: 136, h: 84, title: c.audioVae, id: 'audio-3060', device: 'RTX 3060' },
      { x: 46, y: 756, w: 286, h: 76, title: c.mux, id: 'mux', device: 'CPU' },
    ],
    browserLink: 'M180 68 V104',
    control: ['M90 142 H12 V466 H46', 'M12 244 H46'],
    flows: [
      { d: 'M189 368 V500', duration: 2.4, delay: 0 },
      { d: 'M114 592 V628', duration: 1.4, delay: 0.9 },
      { d: 'M264 592 V628', duration: 1.4, delay: 1 },
      { d: 'M114 712 C114 736 150 732 150 756', duration: 1.6, delay: 1.7 },
      { d: 'M264 712 C264 736 228 732 228 756', duration: 1.6, delay: 1.8 },
    ],
    fileRefLabel: { x: 200, y: 438, anchor: 'start' },
    controlLabel: { x: 18, y: 200 },
    showControllerSub: false,
  };
}

function Diagram({ layout, copy, className, titleId }: { layout: Layout; copy: DiagramCopy; className?: string; titleId: string }) {
  const gradientId = `${titleId}-flow`;
  const glowId = `${titleId}-glow`;
  const centerX = (box: Box) => box.x + box.w / 2;
  return (
    <svg viewBox={layout.viewBox} role="img" aria-labelledby={titleId} className={cn('block h-auto w-full overflow-visible', className)}>
      <title id={titleId}>{copy.label}</title>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2={layout.extent[0]} y2={layout.extent[1]} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-brand-cyan)" />
          <stop offset="0.36" stopColor="var(--color-brand-blue)" />
          <stop offset="0.68" stopColor="var(--color-brand-iris)" />
          <stop offset="1" stopColor="var(--color-brand-violet)" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Browser and Controller */}
      <path d={layout.browserLink} className="fill-none stroke-line-control" strokeWidth="1.5" />
      {[
        { box: layout.browser, title: copy.browser, sub: 'Phasyn Studio UI' },
        { box: layout.controller, title: copy.controller, sub: layout.showControllerSub ? copy.controllerSub : undefined },
      ].map(({ box, title, sub }) => (
        <g key={title}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="14" className="fill-surface stroke-line-strong" strokeWidth="1" />
          <text x={centerX(box)} y={box.y + (sub ? box.h / 2 - 4 : box.h / 2 + 5)} textAnchor="middle" className="fill-fg text-[15px] font-semibold">
            {title}
          </text>
          {sub ? (
            <text x={centerX(box)} y={box.y + box.h / 2 + 18} textAnchor="middle" className="fill-fg-tertiary text-[12px]">
              {sub}
            </text>
          ) : null}
        </g>
      ))}

      {/* Control plane (dashed): the Controller only talks to each machine's NodeGateway. */}
      {layout.control.map((d) => (
        <path key={d} d={d} className="fill-none stroke-line-control" strokeWidth="1.25" strokeDasharray="4 5" />
      ))}
      <text x={layout.controlLabel.x} y={layout.controlLabel.y} textAnchor={layout.extent[0] > 400 ? 'end' : 'start'} className="fill-fg-tertiary text-[11px]">
        {copy.control}
      </text>

      {/* Machines */}
      {layout.machines.map((machine) => (
        <g key={machine.label}>
          <rect x={machine.box.x} y={machine.box.y} width={machine.box.w} height={machine.box.h} rx="18" className="fill-canvas stroke-line" strokeWidth="1" />
          <rect x={machine.chip.x} y={machine.chip.y} width={machine.chip.w} height={machine.chip.h} rx="14" className="fill-brand-soft stroke-action/40" strokeWidth="1" />
          <text x={machine.chip.x + machine.chip.w / 2} y={machine.chip.y + 18.5} textAnchor="middle" className="fill-action-fg font-mono text-[11.5px]">
            NodeGateway
          </text>
          <text x={machine.labelX} y={machine.chip.y + 19} className="fill-fg-secondary text-[13px] font-semibold">
            {machine.label}
          </text>
        </g>
      ))}

      {/* Data plane: static tracks, then travelling packets (FileRefs move node to node). */}
      {layout.flows.map((flow) => (
        <path key={`track-${flow.d}`} d={flow.d} fill="none" stroke={`url(#${gradientId})`} strokeOpacity="0.32" strokeWidth="2" />
      ))}
      <g filter={`url(#${glowId})`}>
        {layout.flows.map((flow) => (
          <path
            key={`packet-${flow.d}`}
            d={flow.d}
            pathLength={100}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            className="home-flow"
            style={{ '--home-flow-duration': `${flow.duration}s`, '--home-flow-delay': `${flow.delay}s` } as CSSProperties}
          />
        ))}
      </g>
      <text x={layout.fileRefLabel.x} y={layout.fileRefLabel.y} textAnchor={layout.fileRefLabel.anchor} className="fill-brand-cyan font-mono text-[11.5px]">
        FileRef
      </text>

      {/* One process per component instance */}
      {layout.components.map((component) => (
        <g key={component.id}>
          <rect x={component.x} y={component.y} width={component.w} height={component.h} rx="12" className="fill-raised stroke-line-strong" strokeWidth="1" />
          <text x={component.x + 16} y={component.y + 28} className="fill-fg text-[14.5px] font-semibold">
            {component.title}
          </text>
          <text x={component.x + 16} y={component.y + 49} className="fill-action-fg font-mono text-[12px]">
            {component.id}
          </text>
          <text x={component.x + 16} y={component.y + 68} className="fill-fg-tertiary text-[11.5px]">
            {component.sub ? `${component.device} · ${component.sub}` : component.device}
          </text>
        </g>
      ))}
    </svg>
  );
}

/**
 * Browser → Controller → a NodeGateway per machine → one process per component, with data packets moving node to node
 * (never through the Controller). Two hand-tuned layouts (wide, tall) instead of scaling one until its text is unreadable;
 * the hidden one is display:none, so assistive tech reads exactly one; the figure's caption describes the flow in words. Packets are CSS stroke animations: paused off screen or
 * by the user, solid paths under reduced motion.
 */
export function ArchitectureDiagram({ copy, paused }: { copy: DiagramCopy; paused: boolean }) {
  const uid = useId().replace(/:/g, '');
  return (
    <div className={cn(paused && 'home-flow-paused')}>
      <Diagram layout={wideLayout(copy)} copy={copy} titleId={`arch-w-${uid}`} className="hidden lg:block" />
      <Diagram layout={tallLayout(copy)} copy={copy} titleId={`arch-t-${uid}`} className="mx-auto max-w-[30rem] lg:hidden" />
    </div>
  );
}
