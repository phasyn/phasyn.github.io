import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { HudFrame } from '../../../components/fx/index.ts';
import { FilmPlayer } from '../../../components/media/FilmPlayer.tsx';
import { cn } from '../../../lib/cn.ts';
import { useLocale } from '../../../i18n/locale.tsx';
import { useBenchCopy } from '../copy.ts';
import { GRIDS, TILE_ORIGIN, img, video, type Grid, type GridTile } from '../data/media.ts';
import { variant } from '../data/select.ts';
import { fmtSeconds } from '../lib/format.ts';

/*
 * Label-free 2×2 comparison videos (synchronised in the file; sound = top-left tile) with the tile labels drawn by the page
 * in the reader's language. Tabs (APG pattern, automatic activation) switch the grid; one player at a time, poster first,
 * no autoplay. The tile list under the player repeats every label and DiT time as text.
 */
export function GridPlayer() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const grid = GRIDS[selected] as Grid;

  const tileText = (tile: GridTile) => {
    const v = variant(grid.scenario, tile.component);
    const name = `${tile.precision} · ${copy.schedules[tile.schedule]}${tile.exact ? ` · ${copy.dit.media.officialPrecision}` : ''}`;
    return { name, time: v?.dit != null ? fmtSeconds(locale, v.dit) : null };
  };

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = GRIDS.length - 1;
    let next = selected;
    if (event.key === 'ArrowRight') next = selected === last ? 0 : selected + 1;
    else if (event.key === 'ArrowLeft') next = selected === 0 ? last : selected - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="grid min-w-0 gap-5">
      <div role="tablist" aria-label={copy.dit.media.title} className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
        {GRIDS.map((g, index) => (
          <button
            key={g.key}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`${baseId}-tab-${g.key}`}
            type="button"
            role="tab"
            aria-selected={index === selected}
            aria-controls={`${baseId}-panel`}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={onKey}
            className={cn(
              'pressable shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-caption whitespace-nowrap',
              index === selected ? 'border-transparent bg-brand-gradient-soft text-fg border-brand-gradient' : 'border-line-subtle bg-canvas text-fg-secondary hover:border-line-strong hover:bg-raised/60',
            )}
          >
            {copy.dit.media.tabs[g.key]}
          </button>
        ))}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${grid.key}`} className="grid min-w-0 gap-4">
        <HudFrame label={grid.hud}>
          <div className="relative">
            <FilmPlayer key={grid.key} src={video(`${grid.file}.mp4`)} poster={img(`${grid.file}.webp`)} title={copy.dit.media.tabs[grid.key]} aspect="1540 / 900" className="rounded-xl shadow-none" />
            <ol aria-hidden className="pointer-events-none absolute inset-0 z-10">
              {grid.tiles.map((tile, index) => {
                const [left, top] = TILE_ORIGIN[index] ?? [0, 0];
                const text = tileText(tile);
                return (
                  <li key={tile.component + index} className="absolute p-1.5 sm:p-2.5" style={{ left: `${left * 100}%`, top: `${top * 100}%` }}>
                    <span className="material-hud inline-flex max-w-full flex-wrap items-baseline gap-x-1.5 rounded-md px-1.5 py-0.5 text-[10px] leading-4 text-fg sm:px-2 sm:text-[11px]">
                      <span className="font-semibold">{text.name}</span>
                      {text.time ? <span className="machine text-fg">{text.time}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </HudFrame>
        <ol className="grid gap-x-6 gap-y-2 text-caption text-fg-secondary sm:grid-cols-2">
          {grid.tiles.map((tile, index) => {
            const text = tileText(tile);
            return (
              <li key={tile.component + index} className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <span className="text-fg-tertiary">{['↖', '↗', '↙', '↘'][index]}</span>
                <span className="text-fg">{text.name}</span>
                <code className="machine text-[11px] text-fg-tertiary">{tile.component}</code>
                {text.time ? <span className="machine text-fg">{text.time}</span> : null}
              </li>
            );
          })}
        </ol>
        <p className="text-caption text-fg-tertiary">{copy.dit.media.audioNote}</p>
      </div>
    </div>
  );
}
