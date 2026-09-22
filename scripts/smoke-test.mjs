/**
 * Headless smoke test for the inspection terminal.
 *
 * Prereq: `npm run dev` in another terminal (serves http://localhost:5173).
 * Run:    node scripts/smoke-test.mjs
 *
 * Verifies WebGL boots, captures console/page errors, drives the subsystem
 * navigation, checks the drag-to-orbit guard (a drag ending on empty space
 * must NOT reset focus) and switches through every fleet model, writing
 * screenshots to %TEMP%.
 */
import puppeteer from 'puppeteer-core';

const CHROME =
    process.env.CHROME_PATH ??
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.APP_URL ?? 'http://localhost:5173';
const OUT = process.env.SHOT_DIR ?? process.env.TEMP ?? '.';

const logs = [];
const fails = [];
const note = (line) => logs.push(line);
const fail = (line) => {
    logs.push(line);
    fails.push(line);
};

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
        '--no-sandbox',
        '--enable-unsafe-swiftshader',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--window-size=1600,900',
    ],
});

try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') {
            logs.push(`[console.${m.type()}] ${m.text()}`);
        }
    });
    page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
    page.on('requestfailed', (r) =>
        logs.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`),
    );

    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });

    const webgl = await page.evaluate(() => {
        const c = document.querySelector('canvas');
        if (!c) return 'NO CANVAS';
        return c.getContext('webgl2') ? 'webgl2-ok' : 'context-ok';
    });
    note(`[webgl] ${webgl}`);

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const clickSel = async (sel) => {
        const ok = await page.evaluate((s) => {
            const el = document.querySelector(s);
            if (el) el.click();
            return !!el;
        }, sel);
        note(`[click] ${sel} -> ${ok}`);
        if (!ok) fail(`[fail] missing selector ${sel}`);
        return ok;
    };
    const panelTitle = () =>
        page.evaluate(
            () => document.querySelector('[data-testid="panel-title"]')?.textContent ?? '(none)',
        );

    await sleep(9000);
    await page.screenshot({ path: `${OUT}\\shot-1-overview.png` });

    // --- subsystem focus -----------------------------------------------------
    await clickSel('[data-nav="solar"]');
    await sleep(2600);
    await page.screenshot({ path: `${OUT}\\shot-2-solar.png` });

    await clickSel('[data-nav="antenna"]');
    await sleep(2600);
    await page.screenshot({ path: `${OUT}\\shot-3-antenna.png` });

    // --- drag guard: orbiting must not bounce focus back to overview ---------
    await clickSel('[data-nav="solar"]');
    await sleep(2200);
    const beforeDrag = await panelTitle();
    await page.mouse.move(620, 180);
    await page.mouse.down();
    await page.mouse.move(720, 225, { steps: 10 });
    await page.mouse.up();
    await sleep(1000);
    const afterDrag = await panelTitle();
    note(`[drag-guard] panel title "${beforeDrag}" -> "${afterDrag}"`);
    if (afterDrag.trim() !== beforeDrag.trim()) {
        fail(`[fail] drag reverted focus: "${beforeDrag}" -> "${afterDrag}"`);
    }

    // --- blueprint toggle ----------------------------------------------------
    await clickSel('[data-nav="overview"]');
    await sleep(2200);
    await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) =>
            x.textContent.includes('Blueprint Mesh'),
        );
        b?.click();
    });
    await sleep(900);
    await page.screenshot({ path: `${OUT}\\shot-4-blueprint.png` });
    await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) =>
            x.textContent.includes('Blueprint Mesh'),
        );
        b?.click();
    });
    await sleep(400);

    // --- theme dropdown: opens, every theme applies, cycles and persists -----
    const THEME_ORDER = ['yorha', 'crt', 'glass', 'blueprint', 'milspec', 'fui'];
    for (const want of THEME_ORDER) {
        await clickSel('[data-theme-btn]'); // open the dropdown
        await sleep(250);
        await clickSel(`[data-theme-option="${want}"]`); // pick (also closes)
        await sleep(700);
        const id = await page.evaluate(() => document.documentElement.dataset.theme ?? '');
        note(`[theme] -> ${id || '(none)'}`);
        if (id !== want) fail(`[fail] theme expected ${want}, got ${id || '(none)'}`);
        const menuStillOpen = await page.evaluate(() => {
            const trigger = document.querySelector('[data-theme-btn]');
            const menu = trigger?.parentElement?.querySelector('[role="listbox"]');
            return menu ? getComputedStyle(menu).display === 'flex' : false;
        });
        if (menuStillOpen) fail(`[fail] theme menu still open after picking ${want}`);
        await page.screenshot({ path: `${OUT}\\shot-theme-${id || 'none'}.png` });
    }

    // --- fleet dropdown: every model loads, frames and focuses --------------
    const FLEET_IDS = ['hst', 'tdrs', 'goes', 'soho', 'ssl1300', 'sdo'];
    for (const id of FLEET_IDS) {
        await clickSel('[data-fleet-btn]'); // open the top-bar dropdown
        await sleep(250);
        await clickSel(`[data-fleet="${id}"]`); // pick (also closes)
        await sleep(5000); // GLB load + camera settle
        await page.screenshot({ path: `${OUT}\\shot-model-${id}.png` });

        const partId = await page.evaluate(() => {
            const items = [...document.querySelectorAll('[data-nav]')];
            const part = items.find((b) => b.getAttribute('data-nav') !== 'overview');
            if (part) part.click();
            return part ? part.getAttribute('data-nav') : null;
        });
        note(`[${id}] first part -> ${partId}`);
        if (!partId) fail(`[fail] ${id}: no subsystem in nav`);
        await sleep(2800);
        await page.screenshot({ path: `${OUT}\\shot-model-${id}-part.png` });

        const title = await panelTitle();
        note(`[${id}] panel title -> ${title}`);
        if (title.includes('OVERVIEW')) fail(`[fail] ${id}: focus did not apply (${title})`);
    }
} finally {
    await browser.close();
}

const problems = logs.filter(
    (l) =>
        l.startsWith('[pageerror]') ||
        l.startsWith('[console.') ||
        l.startsWith('[requestfailed]'),
);
console.log(logs.join('\n') || '(no logs)');
const total = problems.length + fails.length;
console.log(total === 0 ? '\nSMOKE TEST: PASS' : `\nSMOKE TEST: ${total} PROBLEM(S)`);
process.exit(total === 0 ? 0 : 1);
