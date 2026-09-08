const path = require("node:path");
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const screenshotsRoot = path.join(
  "C:/Users/ADMINI~1/AppData/Local/Temp/opencode",
  "amanda-screenshots",
);

const viewports = [
  { name: "320", width: 320, height: 740 },
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 900 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
];

test("renderiza sem overflow nos viewports obrigatórios", async ({
  browser,
}) => {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /marcar a minha avaliação/i }).first(),
    ).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    if (dimensions.scrollWidth > dimensions.clientWidth + 1) {
      const offenders = await page.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className: element.className?.toString().slice(0, 100),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          })
          .filter(
            (element) =>
              element.left < -1 || element.right > window.innerWidth + 1,
          )
          .slice(0, 20),
      );
      console.log(`Overflow em ${viewport.name}px`, offenders);
      const scrollContainers = await page.evaluate(() =>
        [
          document.documentElement,
          document.body,
          ...document.querySelectorAll("body *"),
        ]
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map((element) => ({
            tag: element.tagName.toLowerCase(),
            id: element.id,
            className: element.className?.toString().slice(0, 100),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            overflowX: getComputedStyle(element).overflowX,
          }))
          .slice(0, 30),
      );
      console.log(
        `Contentores com overflow em ${viewport.name}px`,
        scrollContainers,
      );
    }
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(
      dimensions.clientWidth + 1,
    );

    const missingAnchors = await page.evaluate(() =>
      [...document.querySelectorAll('a[href^="#"]')]
        .map((link) => link.getAttribute("href"))
        .filter(
          (href) => href && href !== "#" && !document.querySelector(href),
        ),
    );
    expect(missingAnchors).toEqual([]);
    expect(pageErrors).toEqual([]);

    const pageHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    for (
      let y = 0;
      y < pageHeight;
      y += Math.max(320, viewport.height * 0.75)
    ) {
      await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
      await page.waitForTimeout(35);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(80);

    await page.screenshot({
      path: path.join(screenshotsRoot, `amanda-${viewport.name}.png`),
      fullPage: true,
    });
    await page.close();
  }
});

test("mantém reflow em baixa altura e largura equivalente a zoom 200%", async ({
  browser,
}) => {
  const scenarios = [
    { name: "landscape", width: 740, height: 360 },
    { name: "zoom-200-proxy", width: 720, height: 450 },
  ];

  for (const scenario of scenarios) {
    const page = await browser.newPage({
      viewport: { width: scenario.width, height: scenario.height },
    });
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.locator("h1")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(
      dimensions.clientWidth + 1,
    );

    const pageHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    for (let y = 0; y < pageHeight; y += Math.max(240, scenario.height * 0.7)) {
      await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
      await page.waitForTimeout(35);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(80);

    await page.screenshot({
      path: path.join(screenshotsRoot, `amanda-${scenario.name}.png`),
      fullPage: true,
    });
    await page.close();
  }
});

test("menu móvel abre, fecha e atualiza o estado", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const toggle = page.getByRole("button", { name: "Abrir menu" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).not.toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("drawer é acessível e devolve o foco", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const trigger = page
    .getByRole("button", { name: /quero marcar a minha avaliação/i })
    .first();
  await trigger.focus();
  await trigger.click();

  const dialog = page.locator("#booking-dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator("#modal-name")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("formulário final valida erros e conclui o modo demonstração", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const form = page.locator("#final-form");
  const submit = form.getByRole("button", { name: /preparar pedido/i });

  await submit.click();
  await expect(form.locator("#final-name")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.locator("#final-name")).toBeFocused();

  await form.locator("#final-name").fill("Maria Teste");
  await form.locator("#final-phone").fill("+351 912 345 678");
  await form
    .locator("#final-goal")
    .selectOption({ label: "Organizar a alimentação" });
  await form
    .locator("#final-difficulty")
    .selectOption({ label: "Falta de tempo" });
  await form.locator("#final-consent").check();
  await submit.click();

  await expect(form.locator("[data-form-success]")).toContainText(
    "sem transmitir dados",
  );
  await expect(submit).toBeEnabled();
});

test("formulário do drawer usa a mesma validação", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("button", { name: /marcar consulta/i })
    .first()
    .click();
  const form = page.locator("#modal-form");

  await form.locator("#modal-name").fill("João Teste");
  await form.locator("#modal-phone").fill("+351 913 456 789");
  await form
    .locator("#modal-goal")
    .selectOption({ label: "Esclarecer dúvidas gerais" });
  await form
    .locator("#modal-difficulty")
    .selectOption({ label: "Informação contraditória" });
  await form.locator("#modal-consent").check();
  await form.getByRole("button", { name: /preparar pedido/i }).click();

  await expect(form.locator("[data-form-success]")).toContainText(
    "sem transmitir dados",
  );
});

test("FAQ funciona por teclado", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const item = page.locator(".faq-item").nth(1);
  const summary = item.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(item).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(item).not.toHaveAttribute("open", "");
});

test("reduced motion remove sticky e revela o conteúdo", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const state = await page
    .locator(".method-card")
    .first()
    .evaluate((element) => ({
      opacity: getComputedStyle(element).opacity,
      position: getComputedStyle(element).position,
    }));
  expect(state.opacity).toBe("1");
  expect(state.position).toBe("relative");
  await context.close();
});

test("conteúdo essencial permanece visível sem JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#method-title")).toBeVisible();
  await expect(page.locator("#final-form")).toBeVisible();
  await expect(page.locator("[data-reveal]").first()).toHaveCSS("opacity", "1");
  await context.close();
});

test("falha de recursos externos não inutiliza conteúdo ou formulário", async ({
  page,
}) => {
  await page.route(
    /https:\/\/(cdn\.tailwindcss\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|images\.unsplash\.com)/,
    (route) => route.abort(),
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#final-form")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /preparar pedido/i }).last(),
  ).toBeEnabled();
});

test("interface não expõe placeholders ou schema não validado", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const markup = await page.content();

  expect(markup).not.toMatch(/\[PENDENTE:|Lorem ipsum|placehold\.co/i);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0,
  );
});

test("axe não encontra violações sérias ou críticas", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  const results = await new AxeBuilder({ page }).analyze();
  const blockers = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact),
  );
  expect(blockers, JSON.stringify(blockers, null, 2)).toEqual([]);
});
