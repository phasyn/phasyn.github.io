import './home.css';
import { Fragment, type ReactNode } from 'react';
import { useCopy } from '../../i18n/locale.tsx';
import type { SceneArtId } from '../../site/art.ts';
import { HOME } from './copy.ts';
import {
  EDIT_READY,
  INTRO_FILM_READY,
  PLUGINS_READY,
  PREVIEW_WORKS,
  PROMPT_VISUAL,
  REFERENCE_VISUAL,
  RENDER_READY,
  TAKES_CAPTURE,
  UPSCALE_PAIR,
  sceneArt,
} from './data.ts';
import { Hero } from './Hero.tsx';
import { CaptureScene } from './Scene.tsx';
import { SceneArt } from './SceneArt.tsx';
import {
  CtaScene,
  FilmScene,
  LocalScene,
  PromptWorkScene,
  ReferenceScene,
  UpscaleScene,
  WorksScene,
} from './Scenes.tsx';

type SceneRender = (index: number) => ReactNode;
type Entry = readonly [id: SceneArtId | 'upscale' | 'works', render: SceneRender | null];

/** A scene's opening illustration (art.ts SCENE_ART), when it has one. */
function opening(id: Entry[0]): ReactNode {
  const image = id === 'upscale' || id === 'works' ? undefined : sceneArt(id);
  return image ? <SceneArt image={image} size={id === 'local' ? 'tall' : 'band'} /> : null;
}

/**
 * Home as a keynote: one idea per screen, in this order — opening → describe → reference → takes → edit → render → plugins
 * → upscale → your own computer → works → start. Each scene shows one real picture (a capture, a still or a work) and is
 * left out when its picture does not exist yet (data.ts); the HUD numbers follow the scenes that are shown. A scene opens with
 * its illustration (SceneArt, art.ts SCENE_ART) when the still exists: mood above the headline, the real picture below.
 */
export function HomePage() {
  const t = useCopy(HOME);
  const promptWork = PROMPT_VISUAL?.kind === 'work' ? PROMPT_VISUAL.work : null;
  const takes = TAKES_CAPTURE;
  const scenes: Entry[] = [
    [
      'describe',
      PROMPT_VISUAL?.kind === 'capture'
        ? (index) => (
            <CaptureScene
              id="describe"
              index={index}
              tag="DESCRIBE"
              title={t.prompt.title}
              lead={t.prompt.lead}
              capture="shot-workspace"
              alt={t.prompt.alt}
              steps={[
                { region: 'prompt', label: t.prompt.steps[0] },
                { region: 'viewer', label: t.prompt.steps[1] },
              ]}
            />
          )
        : promptWork
          ? (index) => <PromptWorkScene index={index} work={promptWork} />
          : null,
    ],
    ['reference', REFERENCE_VISUAL ? (index) => <ReferenceScene index={index} /> : null],
    [
      'takes',
      takes
        ? (index) => (
            <CaptureScene
              id="takes"
              index={index}
              tag="TAKES"
              title={t.takes.title}
              lead={t.takes.lead}
              note={t.takes.note}
              capture={takes}
              alt={takes === 'shot-takes-compare' ? t.takes.compareAlt : t.takes.alt}
              steps={[
                takes === 'shot-takes-compare'
                  ? { region: 'viewer', label: t.takes.compare }
                  : { region: 'takes', label: t.takes.strip },
              ]}
            />
          )
        : null,
    ],
    [
      'edit',
      EDIT_READY
        ? (index) => (
            <CaptureScene
              id="edit"
              index={index}
              tag="EDIT"
              title={t.edit.title}
              lead={t.edit.lead}
              capture="edit-workspace"
              alt={t.edit.alt}
              steps={[
                { region: 'program', label: t.edit.steps[0] },
                { region: 'timeline', label: t.edit.steps[1] },
                { region: 'workspaces', label: t.edit.steps[2] },
              ]}
            />
          )
        : null,
    ],
    [
      'render',
      RENDER_READY
        ? (index) => (
            <CaptureScene
              id="render"
              index={index}
              tag="RENDER"
              title={t.render.title}
              lead={t.render.lead}
              capture="render-queue"
              alt={t.render.alt}
              steps={[{ region: 'variants', label: t.render.label }]}
            />
          )
        : null,
    ],
    [
      'plugins',
      PLUGINS_READY
        ? (index) => (
            <CaptureScene
              id="plugins"
              index={index}
              tag="PLUGINS"
              title={t.plugins.title}
              lead={t.plugins.lead}
              capture="plugin-manager"
              alt={t.plugins.alt}
              steps={[{ region: 'packs', label: t.plugins.label }]}
            />
          )
        : null,
    ],
    ['upscale', UPSCALE_PAIR ? (index) => <UpscaleScene index={index} /> : null],
    ['local', (index) => <LocalScene index={index} />],
    ['works', PREVIEW_WORKS.length > 0 ? (index) => <WorksScene index={index} /> : null],
  ];
  const shown = scenes.filter((entry): entry is readonly [Entry[0], SceneRender] => entry[1] !== null);
  const closing = sceneArt('start');

  return (
    <>
      <Hero />
      {INTRO_FILM_READY ? <FilmScene /> : null}
      {shown.map(([id, render], i) => (
        <Fragment key={id}>
          {opening(id)}
          {render(i + 1)}
        </Fragment>
      ))}
      {closing ? <SceneArt image={closing} size="tall" /> : null}
      <CtaScene />
    </>
  );
}
