const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const axeSource = require('axe-core').source;

const url = process.env.QA_URL || 'http://127.0.0.1:4173/';
const outputDir = process.env.QA_OUTPUT_DIR;
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

if (!outputDir || !fs.existsSync(outputDir)) {
  throw new Error('QA_OUTPUT_DIR must point to an existing directory.');
}

const viewports = [
  { name: '320', width: 320, height: 800 },
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
  { name: 'low-height', width: 667, height: 375 },
];

async function waitForStablePage(page) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(450);
}

async function inspectViewport(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.waitForTimeout(100);

  const metrics = await page.evaluate(() => {
    const all = [...document.querySelectorAll('body *')];
    const overflowElements = all
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.position === 'fixed' || style.display === 'none') return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1);
      })
      .slice(0, 12)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: element.className,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
      }));

    const targetSizes = [...document.querySelectorAll('.jn-button, summary, a[href^="mailto:"]')].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        label: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 60),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });

    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      overflowElements,
      targetSizes,
    };
  });

  await page.screenshot({
    path: path.join(outputDir, `pw-full-${viewport.name}.png`),
    fullPage: true,
  });

  return {
    ...viewport,
    ...metrics,
    noHorizontalScroll: metrics.documentWidth <= viewport.width && metrics.bodyWidth <= viewport.width,
    targetsMeetMinimum: metrics.targetSizes.every((target) => target.width >= 44 && target.height >= 44),
  };
}

async function run() {
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  const report = {
    url,
    browser: 'Microsoft Edge (Chromium)',
    consoleErrors: [],
    pageErrors: [],
    failedResponses: [],
    viewports: [],
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'light',
      locale: 'pt-BR',
    });
    const page = await context.newPage();

    page.on('console', (message) => {
      if (message.type() === 'error') report.consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => report.pageErrors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) {
        report.failedResponses.push({ status: response.status(), url: response.url() });
      }
    });

    await waitForStablePage(page);

    report.content = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      const whatsappLinks = [...document.querySelectorAll('a[href*="api.whatsapp.com"]')];
      const localLinks = [...document.querySelectorAll('link[href], script[src], img[src]')].map((element) => element.href || element.src);
      const headings = [...document.querySelectorAll('h1, h2, h3')].map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: heading.textContent.trim(),
      }));

      return {
        lang: document.documentElement.lang,
        title: document.title,
        h1Count: document.querySelectorAll('h1').length,
        detailsCount: document.querySelectorAll('details').length,
        formCount: document.querySelectorAll('form').length,
        canonicalCount: document.querySelectorAll('link[rel="canonical"]').length,
        schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length,
        duplicateIds: [...new Set(duplicateIds)],
        whatsappCount: whatsappLinks.length,
        whatsappHrefs: [...new Set(whatsappLinks.map((link) => link.href))],
        whatsappLabels: [...new Set(whatsappLinks.map((link) => link.textContent.trim().replace(/\s+/g, ' ')))],
        imageAltMissing: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
        imageNaturalSize: [...document.images].map((image) => ({ width: image.naturalWidth, height: image.naturalHeight })),
        localLinks,
        headings,
        placeholders: document.body.innerText.match(/\[PENDENTE|Lorem|ENVIAR|R\$\s*XX|Seu Nome/gi) || [],
        forbiddenText: document.body.innerText.match(/Dra\.|CRN|Terapeuta Ortobiomolecular|99961-2978|Kiwify|Mounjaro/gi) || [],
        cookies: document.cookie,
        localStorageEntries: localStorage.length,
        sessionStorageEntries: sessionStorage.length,
      };
    });

    for (const viewport of viewports) {
      report.viewports.push(await inspectViewport(page, viewport));
    }

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    report.keyboard = await page.evaluate(() => ({
      firstFocusText: document.activeElement?.textContent?.trim(),
      firstFocusHref: document.activeElement?.getAttribute('href'),
      firstFocusOutline: getComputedStyle(document.activeElement).outlineStyle,
    }));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    report.keyboard.afterSkip = await page.evaluate(() => ({
      hash: location.hash,
      activeId: document.activeElement?.id,
    }));

    const firstSummary = page.locator('summary').first();
    await firstSummary.focus();
    await page.keyboard.press('Enter');
    report.keyboard.firstFaqOpenAfterEnter = await page.locator('details').first().getAttribute('open') !== null;
    await page.keyboard.press('Space');
    report.keyboard.firstFaqClosedAfterSpace = await page.locator('details').first().getAttribute('open') === null;

    await page.addScriptTag({ content: axeSource });
    const axeResult = await page.evaluate(async () => axe.run(document, {
      resultTypes: ['violations', 'incomplete'],
    }));
    report.axe = {
      violations: axeResult.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.length,
        targets: violation.nodes.map((node) => node.target),
      })),
      incomplete: axeResult.incomplete.map((item) => ({
        id: item.id,
        impact: item.impact,
        help: item.help,
        nodes: item.nodes.length,
        targets: item.nodes.map((node) => node.target),
        summaries: item.nodes.map((node) => node.failureSummary),
      })),
    };

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.goto('about:blank');
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.locator('#modalidades').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    report.bfcache = await page.evaluate(() => {
      const target = document.querySelector('#modalidades');
      return {
        navigationType: performance.getEntriesByType('navigation')[0]?.type,
        targetVisible: target?.classList.contains('is-jn-visible'),
        targetPending: target?.classList.contains('is-jn-pending'),
        targetOpacity: target ? getComputedStyle(target).opacity : null,
        targetTransform: target ? getComputedStyle(target).transform : null,
      };
    });

    await context.close();

    const reducedContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: 'reduce',
      locale: 'pt-BR',
    });
    const reducedPage = await reducedContext.newPage();
    await waitForStablePage(reducedPage);
    report.reducedMotion = await reducedPage.evaluate(() => ({
      matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      revealStates: [...document.querySelectorAll('[data-jn-reveal]')].map((element) => ({
        opacity: getComputedStyle(element).opacity,
        transform: getComputedStyle(element).transform,
      })),
    }));
    await reducedPage.screenshot({ path: path.join(outputDir, 'pw-reduced-375.png'), fullPage: true });
    await reducedContext.close();

    const noJsContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      javaScriptEnabled: false,
      locale: 'pt-BR',
    });
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    report.noJs = {
      h1Visible: await noJsPage.locator('h1').isVisible(),
      whatsappCount: await noJsPage.locator('a[href*="api.whatsapp.com"]').count(),
      detailsCount: await noJsPage.locator('details').count(),
      revealOpacity: await noJsPage.locator('[data-jn-reveal]').first().evaluate((element) => getComputedStyle(element).opacity),
      revealTransform: await noJsPage.locator('[data-jn-reveal]').first().evaluate((element) => getComputedStyle(element).transform),
    };
    await noJsPage.screenshot({ path: path.join(outputDir, 'pw-nojs-375.png'), fullPage: true });
    await noJsContext.close();

    const zoomContext = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      locale: 'pt-BR',
    });
    const zoomPage = await zoomContext.newPage();
    const zoomSession = await zoomContext.newCDPSession(zoomPage);
    await zoomSession.send('Emulation.setDeviceMetricsOverride', {
      width: 512,
      height: 384,
      deviceScaleFactor: 2,
      mobile: false,
      screenWidth: 1024,
      screenHeight: 768,
    });
    await waitForStablePage(zoomPage);
    report.zoom200 = await zoomPage.evaluate(() => ({
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      noHorizontalScroll: document.documentElement.scrollWidth <= window.innerWidth && document.body.scrollWidth <= window.innerWidth,
    }));
    await zoomPage.screenshot({ path: path.join(outputDir, 'pw-zoom-200.png'), fullPage: true });
    await zoomContext.close();

    const spacingContext = await browser.newContext({
      viewport: { width: 320, height: 800 },
      locale: 'pt-BR',
    });
    const spacingPage = await spacingContext.newPage();
    await waitForStablePage(spacingPage);
    await spacingPage.addStyleTag({ content: `
      * { letter-spacing: 0.12em !important; word-spacing: 0.16em !important; line-height: 1.5 !important; }
      p { margin-bottom: 2em !important; }
    ` });
    report.textSpacing = await spacingPage.evaluate(() => {
      const clippedTextElements = [...document.querySelectorAll('body *')]
        .filter((element) => {
          if (!element.textContent.trim() || element.children.length > 0) return false;
          const style = getComputedStyle(element);
          return (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)
            && (style.overflowX !== 'visible' || style.overflowY !== 'visible');
        })
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          className: element.className,
          text: element.textContent.trim().slice(0, 80),
        }));

      return {
        innerWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        noHorizontalScroll: document.documentElement.scrollWidth <= window.innerWidth && document.body.scrollWidth <= window.innerWidth,
        clippedTextElements,
      };
    });
    await spacingPage.screenshot({ path: path.join(outputDir, 'pw-text-spacing-320.png'), fullPage: true });
    await spacingContext.close();

    const forcedContext = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      forcedColors: 'active',
      locale: 'pt-BR',
    });
    const forcedPage = await forcedContext.newPage();
    await waitForStablePage(forcedPage);
    report.forcedColors = await forcedPage.evaluate(() => ({
      matches: matchMedia('(forced-colors: active)').matches,
      h1Visible: Boolean(document.querySelector('h1')?.getClientRects().length),
      ctaVisible: [...document.querySelectorAll('.jn-button')].every((element) => element.getClientRects().length > 0),
    }));
    await forcedPage.screenshot({ path: path.join(outputDir, 'pw-forced-colors.png'), fullPage: true });
    await forcedContext.close();
  } finally {
    await browser.close();
  }

  const criticalFailures = [
    report.consoleErrors.length > 0,
    report.pageErrors.length > 0,
    report.failedResponses.length > 0,
    report.content.h1Count !== 1,
    report.content.detailsCount !== 6,
    report.content.formCount !== 0,
    report.content.canonicalCount !== 0,
    report.content.schemaCount !== 0,
    report.content.duplicateIds.length > 0,
    report.content.whatsappCount !== 3,
    report.content.whatsappHrefs.length !== 1,
    report.content.placeholders.length > 0,
    report.content.forbiddenText.length > 0,
    report.viewports.some((viewport) => !viewport.noHorizontalScroll || !viewport.targetsMeetMinimum),
    report.keyboard.firstFocusHref !== '#conteudo-principal',
    report.keyboard.afterSkip.hash !== '#conteudo-principal',
    !report.keyboard.firstFaqOpenAfterEnter,
    !report.keyboard.firstFaqClosedAfterSpace,
    report.axe.violations.length > 0,
    !report.bfcache.targetVisible,
    report.bfcache.targetPending,
    report.bfcache.targetOpacity !== '1',
    report.bfcache.targetTransform !== 'none',
    !report.reducedMotion.matches,
    report.reducedMotion.revealStates.some((state) => state.opacity !== '1' || state.transform !== 'none'),
    !report.noJs.h1Visible,
    report.noJs.whatsappCount !== 3,
    report.noJs.revealOpacity !== '1',
    report.noJs.revealTransform !== 'none',
    report.zoom200.devicePixelRatio < 1.9,
    !report.zoom200.noHorizontalScroll,
    !report.textSpacing.noHorizontalScroll,
    report.textSpacing.clippedTextElements.length > 0,
    !report.forcedColors.matches,
    !report.forcedColors.h1Visible,
    !report.forcedColors.ctaVisible,
  ];

  console.log(JSON.stringify(report, null, 2));
  if (criticalFailures.some(Boolean)) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
