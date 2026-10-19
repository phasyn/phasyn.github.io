import { renderToReadableStream } from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';

// Build-time HTML rendering only (prerender); no server entry ships to GitHub Pages.
export default async function handleRequest(request: Request, status: number, headers: Headers, context: EntryContext) {
  const stream = await renderToReadableStream(<ServerRouter context={context} url={request.url} />, {
    signal: request.signal,
    // Static pages wait for everything so the HTML is complete without JavaScript.
    progressiveChunkSize: Number.POSITIVE_INFINITY,
  });
  await stream.allReady;
  headers.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(stream, { status, headers });
}
