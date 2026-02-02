const REFERER = 'https://animepahe.si/';

export interface KwikStream {
  url: string;
  quality?: string;
  isM3U8: boolean;
}

async function fetchKwikHtml(kwikUrl: string): Promise<string> {
  const flaresolverrUrl = process.env.FLARESOLVERR_URL;
  if (flaresolverrUrl) {
    try {
      const res = await fetch(`${flaresolverrUrl.replace(/\/$/, '')}/v1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmd: 'request.get',
          url: kwikUrl,
          maxTimeout: 30000,
        }),
      });
      const data = (await res.json()) as { status?: string; solution?: { response?: string } };
      if (data.status === 'ok' && data.solution?.response) {
        return data.solution.response;
      }
    } catch (e) {
      console.warn('FlareSolverr fetch failed:', e);
    }
  }
  const response = await fetch(kwikUrl, {
    headers: { Referer: REFERER },
  });
  return response.text();
}

export async function extractFromKwikPage(kwikUrl: string): Promise<string | null> {
  const html = await fetchKwikHtml(kwikUrl);
  if (html.includes('Just a moment') || html.includes('cf-chl-bypass')) {
    return null;
  }
  const evalMatch = /;(eval)(\(f[\s\S]*?)(\n<\/script>)/.exec(html);
  if (evalMatch?.[2]) {
    try {
      const { safeUnpack } = await import('@consumet/extensions/dist/utils/utils');
      const unpacked = safeUnpack(evalMatch[2]);
      const m3u8Match = unpacked?.match(/https[^"'\s]*\.m3u8[^"'\s]*/);
      if (m3u8Match?.[0]) return m3u8Match[0];
    } catch {
      /* next pattern */
    }
  }
  const directM3u8 = html.match(/https:\/\/[^"'\s<>]*\.m3u8[^"'\s<>]*/);
  if (directM3u8?.[0]) return directM3u8[0];
  const attrM3u8 = html.match(/(?:src|href|file|url)=["'](https:\/\/[^"']*\.m3u8[^"']*)["']/);
  if (attrM3u8?.[1]) return attrM3u8[1];
  const altEvalMatch = html.match(/(?:eval|Function)\s*\(\s*['"`]?(function\s*\([^)]*\)\s*\{[\s\S]*?\}\s*\([^)]*\))/);
  if (altEvalMatch?.[1]) {
    try {
      const { safeUnpack } = await import('@consumet/extensions/dist/utils/utils');
      const unpacked = safeUnpack(altEvalMatch[1]);
      const m3u8Match = unpacked?.match(/https[^"'\s]*\.m3u8[^"'\s]*/);
      if (m3u8Match?.[0]) return m3u8Match[0];
    } catch {
      /* next */
    }
  }
  const scriptBlocks = Array.from(html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi));
  for (const [, scriptContent] of scriptBlocks) {
    const urlInScript = scriptContent.match(/https:\/\/[^"'\s;]*\.m3u8[^"'\s;]*/);
    if (urlInScript?.[0]) return urlInScript[0];
  }
  const encodedMatch = html.match(/atob\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  if (encodedMatch?.[1]) {
    try {
      const decoded = Buffer.from(encodedMatch[1], 'base64').toString('utf-8');
      const m3u8InDecoded = decoded.match(/https[^"'\s]*\.m3u8[^"'\s]*/);
      if (m3u8InDecoded?.[0]) return m3u8InDecoded[0];
    } catch {
      /* next */
    }
  }
  const anyM3u8 = html.match(/https?:\/\/[a-zA-Z0-9.-]+\/[^"'\s<>]*\.m3u8(\?[^"'\s<>]*)?/);
  if (anyM3u8?.[0]) return anyM3u8[0];
  const jsonStyle = html.match(/"(https?:\\\/\\\/[^"]*\.m3u8[^"]*)"/);
  if (jsonStyle?.[1]) return jsonStyle[1].replace(/\\\//g, '/');

  return null;
}
