// Builds a narrated demo video from the user-manual screenshots (public/manual/img) and the script in
// scripts/video/guion.json. Each scene becomes a 1920x1080 slide rendered by headless Chrome/Edge, a voice
// track from edge-tts (Microsoft neural voices, no key) and a clip with a slow zoom made by ffmpeg.
// Output: manual-video/Manual-de-usuario.mp4 (with a Spanish subtitle track) and its .srt.
//
// Requires ffmpeg/ffprobe on PATH and `pip install edge-tts`.
// Env: CHROME_PATH, PYTHON (default python/python3), VOZ and VELOCIDAD (override the script's voice and
// rate), MUSICA (path to a background track, mixed at low volume).
// `npm run manual:video -- --escena visor` renders only that scene, for a quick preview.
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { pathToFileURL } = require('url');
const { findBrowser } = require('./browser');

const root = join(__dirname, '..');
const manualDir = join(root, 'public', 'manual');
const outDir = join(root, 'manual-video');
const workDir = join(outDir, 'trabajo');
const output = join(outDir, 'Manual-de-usuario.mp4');
const outputSrt = join(outDir, 'Manual-de-usuario.srt');

const guion = JSON.parse(readFileSync(join(__dirname, 'video', 'guion.json'), 'utf8'));
const voice = process.env.VOZ || guion.voz;
const rate = process.env.VELOCIDAD || guion.velocidad;
const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');

const W = 1920;
const H = 1080;
const FPS = 30;
const LEAD = 0.5; // silence before the narration, in seconds
const TAIL = 0.9; // silence after it
const FADE = 0.3;
const ZOOM = 0.05; // the slide grows by 5% over the scene

function run(cmd, args) {
  try {
    return execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`No se encontró «${cmd}». Revisa que esté instalado y en el PATH.`);
    } else {
      console.error(error.stderr?.toString() || error.message);
    }
    process.exit(1);
  }
}

const duration = (file) =>
  Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]));

const escapeHtml = (text) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// --- slides ---------------------------------------------------------------------------------------

function pngSize(file) {
  const buffer = readFileSync(file);
  return { w: buffer.readUInt32BE(16), h: buffer.readUInt32BE(20) };
}

const PAD = 64;
const HEADER = 150;
const MAX_UPSCALE = 2;

// Sizes each screenshot to fit its box; `recorte` keeps only a horizontal band of a tall screenshot.
function figure(name, box, crop) {
  const file = join(manualDir, 'img', name);
  if (!existsSync(file)) {
    console.error(`No existe la captura ${file}. Genera las capturas con npm run manual:capturas.`);
    process.exit(1);
  }
  const { w, h } = pngSize(file);
  const top = crop?.y ?? 0;
  const visible = Math.min(crop?.alto ?? h, h - top);
  const scale = Math.min(box.w / w, box.h / visible, MAX_UPSCALE);
  return `<div class="shot" style="width:${Math.round(w * scale)}px;height:${Math.round(visible * scale)}px">
    <img src="${pathToFileURL(file).href}" style="width:${Math.round(w * scale)}px;margin-top:${-Math.round(top * scale)}px">
  </div>`;
}

function aspect(scene) {
  const { w, h } = pngSize(join(manualDir, 'img', [scene.imagen].flat()[0]));
  return w / Math.min(scene.recorte?.alto ?? h, h);
}

function slideBody(scene) {
  if (scene.tipo === 'tarjeta') {
    return `<div class="card">
      <div class="lights"><i></i><i></i><i></i></div>
      <h1>${escapeHtml(scene.titulo)}</h1>
      <p>${escapeHtml(scene.subtitulo ?? '')}</p>
    </div>`;
  }

  const images = [scene.imagen].flat();
  const contentW = W - 2 * PAD;
  const contentH = H - HEADER - 2 * PAD;
  const points = scene.puntos?.length
    ? `<ul>${scene.puntos.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
    : '';
  // portrait screenshots go next to the bullet points, wide ones above them
  const side = points && images.length === 1 && aspect(scene) < 1.6;
  const box = side
    ? { w: contentW * 0.58, h: contentH }
    : {
        w: (contentW - (images.length - 1) * 48) / images.length,
        h: points ? contentH - 190 : contentH,
      };

  return `<header>
      <span class="num">${String(scene.capitulo ?? '').padStart(2, '0')}</span>
      <h2>${escapeHtml(scene.titulo)}</h2>
      <span class="brand">POKÉDEX · MANUAL</span>
    </header>
    <main class="${side ? 'side' : 'stack'}">
      <div class="figures">${images.map((name) => figure(name, box, scene.recorte)).join('')}</div>
      ${points}
    </main>`;
}

function slideHtml(scene) {
  const font = (file) => pathToFileURL(join(manualDir, 'fonts', file)).href;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Space Mono'; font-weight: 700; src: url('${font('space-mono-latin-700-normal.woff2')}'); }
  @font-face { font-family: 'Plus Jakarta Sans'; font-weight: 600; src: url('${font('plus-jakarta-sans-latin-600-normal.woff2')}'); }
  :root { --ink: #1e2533; --frame: #d9dce1; --surface: #f1f3f5; --line: #cfd5dd; --muted: #6b7685; --accent: #dc2638; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    background: var(--surface);
    background-image: radial-gradient(var(--line) 1.5px, transparent 1.5px);
    background-size: 28px 28px;
    color: var(--ink);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    padding: ${PAD}px;
    display: flex;
    flex-direction: column;
  }
  header {
    height: ${HEADER - PAD / 2}px;
    margin-bottom: ${PAD / 2}px;
    display: flex;
    align-items: center;
    gap: 28px;
    border-bottom: 5px solid var(--ink);
    font-family: 'Space Mono', monospace;
    font-weight: 700;
  }
  .num { color: var(--accent); font-size: 64px; }
  h2 { font-size: 54px; letter-spacing: 0.02em; flex: 1; }
  .brand { color: var(--muted); font-size: 24px; letter-spacing: 0.1em; }
  main { flex: 1; display: flex; align-items: center; justify-content: center; gap: 64px; }
  main.stack { flex-direction: column; gap: 48px; }
  .figures { display: flex; gap: 48px; align-items: center; justify-content: center; }
  .shot {
    overflow: hidden;
    background: #fff;
    border: 4px solid var(--ink);
    border-radius: 14px;
    box-shadow: 10px 10px 0 var(--ink);
  }
  .shot img { display: block; }
  ul { list-style: none; padding: 0; display: flex; gap: 22px; }
  main.side ul { flex-direction: column; max-width: 640px; }
  main.stack ul { flex-wrap: wrap; justify-content: center; }
  li {
    font-size: 34px;
    line-height: 1.3;
    background: #fff;
    border: 3px solid var(--ink);
    border-left: 14px solid var(--accent);
    border-radius: 10px;
    padding: 18px 26px;
    box-shadow: 6px 6px 0 var(--ink);
  }
  .card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 36px;
    background: var(--ink);
    border-radius: 28px;
    box-shadow: 16px 16px 0 var(--accent);
    color: #fff;
  }
  .lights { display: flex; gap: 22px; }
  .lights i { width: 36px; height: 36px; border-radius: 50%; border: 4px solid #fff; background: var(--accent); }
  .lights i:nth-child(2) { background: #facc15; }
  .lights i:nth-child(3) { background: #16a34a; }
  .card h1 { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 150px; letter-spacing: 0.06em; }
  .card p { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 40px; color: var(--line); }
</style></head><body>${slideBody(scene)}</body></html>`;
}

function renderSlide(browser, scene, base) {
  const html = `${base}.html`;
  const png = `${base}.png`;
  writeFileSync(html, slideHtml(scene));
  run(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    `--window-size=${W},${H}`,
    '--force-device-scale-factor=2',
    '--virtual-time-budget=5000',
    `--screenshot=${png}`,
    pathToFileURL(html).href,
  ]);
  return png;
}

// --- narration ------------------------------------------------------------------------------------

// edge-tts needs internet; the audio is cached by voice, rate and text so re-runs only redo what changed.
function narrate(scene) {
  const hash = createHash('sha1').update(`${voice}|${rate}|${scene.texto}`).digest('hex').slice(0, 10);
  const base = join(workDir, `voz-${scene.id}-${hash}`);
  if (!existsSync(`${base}.mp3`) || !existsSync(`${base}.srt`)) {
    run(python, [
      '-m', 'edge_tts',
      '--voice', voice,
      `--rate=${rate}`,
      '--text', scene.texto,
      '--write-media', `${base}.mp3`,
      '--write-subtitles', `${base}.srt`,
    ]);
  }
  return { audio: `${base}.mp3`, srt: readFileSync(`${base}.srt`, 'utf8') };
}

// --- subtitles ------------------------------------------------------------------------------------

const toMs = (t) => {
  const [h, m, s] = t.replace(',', '.').split(':').map(Number);
  return Math.round((h * 3600 + m * 60 + s) * 1000);
};
const toTime = (ms) => {
  const pad = (n, size = 2) => String(n).padStart(size, '0');
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
};

function parseSrt(srt) {
  return srt
    .replace(/\r/g, '')
    .split(/\n\n+/)
    .map((block) => block.split('\n'))
    .filter((lines) => lines.length >= 3 && lines[1].includes('-->'))
    .map(([, times, ...text]) => {
      const [start, end] = times.split('-->').map((t) => toMs(t.trim()));
      return { start, end, text: text.join(' ') };
    });
}

// edge-tts gives one cue per sentence; long ones are split at the punctuation nearest the middle,
// sharing the time in proportion to their length
const MAX_CUE = 84;

function splitCue(cue) {
  const { text } = cue;
  if (text.length <= MAX_CUE) return [cue];
  const breaks = [...text.matchAll(/[,;:] /g)].map((m) => m.index + 1);
  const spaces = [...text.matchAll(/ /g)].map((m) => m.index);
  const nearest = (list) =>
    list.reduce((best, i) => (Math.abs(i - text.length / 2) < Math.abs(best - text.length / 2) ? i : best), -1);
  let at = nearest(breaks);
  if (at < text.length * 0.25 || at > text.length * 0.75) at = nearest(spaces);
  if (at <= 0) return [cue];
  const middle = cue.start + Math.round(((cue.end - cue.start) * at) / text.length);
  return [
    ...splitCue({ start: cue.start, end: middle, text: text.slice(0, at).trim() }),
    ...splitCue({ start: middle, end: cue.end, text: text.slice(at).trim() }),
  ];
}

// --- clips ----------------------------------------------------------------------------------------

function renderClip(scene, slide, audio, seconds, file) {
  const frames = Math.round(seconds * FPS);
  const [fx, fy] = scene.foco ?? [0.5, 0.5];
  const delay = Math.round(LEAD * 1000);
  const video = [
    `zoompan=z='1+${ZOOM}*on/${frames}':x='(iw-iw/zoom)*${fx}':y='(ih-ih/zoom)*${fy}':d=${frames}:s=${W}x${H}:fps=${FPS}`,
    `fade=t=in:st=0:d=${FADE}`,
    `fade=t=out:st=${(seconds - FADE).toFixed(3)}:d=${FADE}`,
    'format=yuv420p',
  ].join(',');
  const sound = [
    `adelay=${delay}:all=1`,
    `apad=whole_dur=${seconds.toFixed(3)}`,
    `afade=t=out:st=${(seconds - FADE).toFixed(3)}:d=${FADE}`,
  ].join(',');
  run('ffmpeg', [
    '-y', '-v', 'error',
    '-i', slide,
    '-i', audio,
    '-filter_complex', `[0:v]${video}[v];[1:a]${sound}[a]`,
    '-map', '[v]', '-map', '[a]',
    '-t', seconds.toFixed(3),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-tune', 'stillimage', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
    file,
  ]);
}

// --- main -----------------------------------------------------------------------------------------

function main() {
  const only = process.argv.includes('--escena') ? process.argv[process.argv.indexOf('--escena') + 1] : null;
  const scenes = only ? guion.escenas.filter((s) => s.id === only) : guion.escenas;
  if (!scenes.length) {
    console.error(`No hay una escena «${only}». Escenas: ${guion.escenas.map((s) => s.id).join(', ')}`);
    process.exit(1);
  }

  mkdirSync(workDir, { recursive: true });
  const browser = findBrowser();
  const clips = [];
  const cues = [];
  let offset = 0;

  scenes.forEach((scene, i) => {
    const base = join(workDir, `${String(i + 1).padStart(2, '0')}-${scene.id}`);
    process.stdout.write(`[${i + 1}/${scenes.length}] ${scene.id}… `);
    const slide = renderSlide(browser, scene, base);
    const { audio, srt } = narrate(scene);
    const seconds = LEAD + duration(audio) + TAIL;
    renderClip(scene, slide, audio, seconds, `${base}.mp4`);
    clips.push(`${base}.mp4`);

    const startMs = Math.round((offset + LEAD) * 1000);
    const endMs = Math.round((offset + seconds) * 1000);
    for (const cue of parseSrt(srt).flatMap(splitCue)) {
      // edge-tts cues overlap by a few milliseconds
      const start = Math.max(startMs + cue.start, cues.at(-1)?.end ?? 0);
      cues.push({ start, end: Math.min(startMs + cue.end, endMs), text: cue.text });
    }
    offset += seconds;
    console.log(`${seconds.toFixed(1)} s`);
  });

  if (only) {
    console.log(`Vista previa: ${clips[0]}`);
    return;
  }

  // the clips share codec settings, so they can be joined without re-encoding
  const list = join(workDir, 'clips.txt');
  writeFileSync(list, clips.map((clip) => `file '${clip.replace(/\\/g, '/')}'`).join('\n'));
  const joined = join(workDir, 'unido.mp4');
  run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined]);

  writeFileSync(
    outputSrt,
    cues.map((cue, i) => `${i + 1}\n${toTime(cue.start)} --> ${toTime(cue.end)}\n${cue.text}\n`).join('\n')
  );

  const music = process.env.MUSICA;
  const args = ['-y', '-v', 'error', '-i', joined, '-i', outputSrt];
  if (music) {
    args.push(
      '-stream_loop', '-1', '-i', music,
      '-filter_complex', '[2:a]volume=0.12[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[a]',
      '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '192k'
    );
  } else {
    args.push('-map', '0:v', '-map', '0:a', '-c:a', 'copy');
  }
  args.push(
    '-map', '1:s', '-c:v', 'copy', '-c:s', 'mov_text',
    '-metadata:s:s:0', 'language=spa',
    '-movflags', '+faststart',
    output
  );
  run('ffmpeg', args);

  const total = Math.round(offset);
  console.log(`Video generado (${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}): ${output}`);
  console.log(`Subtítulos: ${outputSrt}`);
}

main();
