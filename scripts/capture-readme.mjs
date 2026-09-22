/**
 * Record the README hero GIF.
 *
 * Prereq: `npm run dev` in another terminal (serves http://localhost:5173)
 * and ffmpeg on PATH.
 * Run:    node scripts/capture-readme.mjs
 *
 * Drives a scripted tour (boot -> overview -> subsystem focus -> orbit drag
 * -> theme switches) while Chrome's screencast streams real frames, then
 * encodes them (accurate per-frame timing, downscaled + palette) into
 * src/assets/preview_demo.gif.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import puppeteer from 'puppeteer-core';

const CHROME =
    process.env.CHROME_PATH ??
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.APP_URL ?? 'http://localhost:5173';
const OUT_GIF = path.resolve('src/assets/preview_demo.gif');

// GIF encoding knobs (kept modest so the README asset stays small)
const GIF_WIDTH = 880;
const GIF_FPS = 20;
const GIF_COLORS = 160;

// Record at 1280x720 on the real GPU — plenty of detail for the 880px GIF.
const VIEW_W = 1280;
const VIEW_H = 720;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-readme-'));

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    // Real GPU (SwiftShader software rendering caps capture at ~6 fps;
    // the smoke test keeps SwiftShader for determinism, recording does not).
    args: ['--no-sandbox', '--enable-gpu', '--window-size=1280,720'],
});

const frames = []; // { file, t } — t = screencast timestamp (seconds)

try {
    const page = await browser.newPage();
    await page.setViewport({ width: VIEW_W, height: VIEW_H });

    const clickSel = (sel) =>
        page.evaluate((s) => {
            document.querySelector(s)?.click();
        }, sel);

    // --- screencast: frames arrive whenever the compositor paints ----------
    const client = await page.createCDPSession();
    let seq = 0;
    client.on('Page.screencastFrame', async (ev) => {
        const i = seq++;
        if (i < 4000) {
            const file = path.join(frameDir, `f${String(i).padStart(4, '0')}.png`);
            fs.writeFileSync(file, Buffer.from(ev.data, 'base64'));
            frames.push({ file: path.basename(file), t: ev.metadata.timestamp });
        }
        try {
            await client.send('Page.screencastFrameAck', { sessionId: ev.sessionId });
        } catch {
            /* session already closed */
        }
    });
    await client.send('Page.startScreencast', {
        format: 'png',
        maxWidth: VIEW_W,
        maxHeight: VIEW_H,
    });

    // --- scripted tour ------------------------------------------------------
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(7000); // boot sequence + model load
    await sleep(3000); // overview, auto-rotating

    await clickSel('[data-nav="solar"]'); // camera flies to the solar array
    await sleep(2800);

    await page.mouse.move(620, 180); // manual orbit (drag-safe gesture)
    await page.mouse.down();
    await page.mouse.move(760, 260, { steps: 12 });
    await page.mouse.up();
    await sleep(1500);

    await clickSel('[data-nav="overview"]'); // pull back to overview
    await sleep(2600);

    await clickSel('[data-theme-btn]'); // YoRHa restyle
    await sleep(250);
    await clickSel('[data-theme-option="yorha"]');
    await sleep(2400);

    await clickSel('[data-theme-btn]'); // Blueprint restyle
    await sleep(250);
    await clickSel('[data-theme-option="blueprint"]');
    await sleep(2400);

    await clickSel('[data-theme-btn]'); // back to FUI classic
    await sleep(250);
    await clickSel('[data-theme-option="fui"]');
    await sleep(2000);

    await client.send('Page.stopScreencast');
} finally {
    await browser.close();
}

if (frames.length < 10) {
    console.error(`only ${frames.length} frames captured — aborting`);
    process.exit(1);
}

// --- encode: concat with real frame durations, resample, palette ------------
const lines = ['ffconcat version 1.0'];
for (let i = 0; i < frames.length; i++) {
    lines.push(`file '${frames[i].file}'`);
    const next = frames[i + 1];
    const dur = next ? next.t - frames[i].t : 0.1;
    // GPU capture runs near 100 fps — don't clamp real durations upward
    lines.push(`duration ${Math.min(Math.max(dur, 0.005), 1).toFixed(4)}`);
}
lines.push(`file '${frames[frames.length - 1].file}'`);
lines.push(`duration 0.1`);
fs.writeFileSync(path.join(frameDir, 'list.txt'), lines.join('\n'));

execFileSync(
    'ffmpeg',
    [
        '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', path.join(frameDir, 'list.txt'),
        '-vf',
        `fps=${GIF_FPS},scale=${GIF_WIDTH}:-2:flags=lanczos,` +
            `split[a][b];[a]palettegen=max_colors=${GIF_COLORS}[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
        '-loop', '0',
        OUT_GIF,
    ],
    { stdio: 'inherit' },
);

const elapsed = frames[frames.length - 1].t - frames[0].t;
const size = fs.statSync(OUT_GIF).size;
console.log(
    `GIF written: ${OUT_GIF} — ${frames.length} source frames over ${elapsed.toFixed(1)}s ` +
        `(~${(frames.length / elapsed).toFixed(1)} fps captured, ${GIF_FPS} fps output), ` +
        `${(size / 1024 / 1024).toFixed(1)} MB`,
);
fs.rmSync(frameDir, { recursive: true, force: true });
