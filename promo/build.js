// Renders promo.html frame by frame and encodes promo.mp4 (1920×1080, 30 fps, H.264 + AAC).
// Needs Node with Playwright, Python 3 with numpy, and ffmpeg.
// Voiceover: set KOKORO_DIR to a folder with the Kokoro model files (see voice.py); without it the video has music only.
// Usage: [KOKORO_DIR=/path/to/models] node build.js [out.mp4]
// Other videos: PAGE=reel.html MUSIC=reel_music.py LINES=reel_voice.json node build.js reel.mp4
// (the page sets window.SIZE = [width, height]; default 1920×1080)
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const FPS = 30;
const out = path.resolve(process.argv[2] || path.join(__dirname, 'promo.mp4'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-'));
const music = path.join(tmp, 'music.wav');
const mixed = path.join(tmp, 'mix.wav');
let wav = music;

(async () => {
  const PAGE = process.env.PAGE || 'promo.html', MUSIC = process.env.MUSIC || 'music.py';
  const [mScript, ...mArgs] = MUSIC.split(' ');     // e.g. MUSIC='reel_music.py short'
  execFileSync('python3', [path.join(__dirname, mScript), music, ...mArgs], { stdio: 'inherit' });
  if (process.env.KOKORO_DIR) {
    execFileSync('python3', [path.join(__dirname, 'voice.py'), music, mixed, process.env.KOKORO_DIR, ...(process.env.LINES ? [path.join(__dirname, process.env.LINES)] : [])], { stdio: 'inherit' });
    wav = mixed;
  }

  const browser = await chromium.launch();
  let page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, PAGE) + '?capture');
  const [W, H] = await page.evaluate(() => window.SIZE || [1920, 1080]);
  if (W !== 1920 || H !== 1080) await page.setViewportSize({ width: W, height: H });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const dur = await page.evaluate(() => window.DUR);
  const frames = Math.round(dur * FPS);

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.render(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) process.stdout.write(`frame ${i}/${frames}\n`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg exited ' + c)) : res()));
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('done:', out);
})();
