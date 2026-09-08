import { rawTemplates } from "./templates-data.js";

const recipients = [
  { nome: "Maria Silva", email: "maria.silva@example.com" },
  { nome: "João Pereira", email: "joao.pereira@example.com" },
  { nome: "Ana Costa", email: "ana.costa@example.com" },
  { nome: "Carlos Souza", email: "carlos.souza@example.com" },
  { nome: "Beatriz Lima", email: "beatriz.lima@example.com" },
  { nome: "Rafael Oliveira", email: "rafael.oliveira@example.com" },
  { nome: "Juliana Santos", email: "juliana.santos@example.com" },
  { nome: "Pedro Almeida", email: "pedro.almeida@example.com" },
];

const templates = [
  {
    id: "template1",
    short: "T1",
    name: "Pop-up anos 90",
    subject: "🚨🚨 URGENTE!!! MARIA SILVA VOCÊ NÃO VAI ACREDITAR 🚨🚨",
    tag: "Comic Sans",
  },
  {
    id: "template2",
    short: "T2",
    name: "Newsletter 2005",
    subject: "Newsletter — Maria Silva, confira nossa nova coleção!",
    tag: "Tabelas",
  },
  {
    id: "template3",
    short: "T3",
    name: "Cartão cursivo",
    subject: "~ Maria Silva, você é especial ✨ ~",
    tag: "Gradiente",
  },
  {
    id: "template4",
    short: "T4",
    name: "Newsletter™",
    subject: "Newsletter™ — Edição Especial para Maria Silva",
    tag: "Word vibes",
  },
];

const codeSnippets = {
  recipients: `export const recipients = [
  { nome: "Maria Silva", email: "maria.silva@example.com" },
  { nome: "João Pereira", email: "joao.pereira@example.com" },
  { nome: "Ana Costa", email: "ana.costa@example.com" },
  { nome: "Carlos Souza", email: "carlos.souza@example.com" },
  { nome: "Beatriz Lima", email: "beatriz.lima@example.com" },
  { nome: "Rafael Oliveira", email: "rafael.oliveira@example.com" },
  { nome: "Juliana Santos", email: "juliana.santos@example.com" },
  { nome: "Pedro Almeida", email: "pedro.almeida@example.com" },
];`,
  dispatcher: `const templates = [template1, template2, template3, template4];
let templateIndex = 0;

function pickTemplate() {
  const tpl = templates[templateIndex % templates.length];
  templateIndex++;
  return tpl;
}

for (const destinatario of recipients) {
  const tpl = pickTemplate();
  const { subject, html } = tpl(destinatario);

  await resend.emails.send({
    from: \`\${FROM_NAME} <\${FROM_EMAIL}>\`,
    to: destinatario.email,
    subject,
    html,
  });
}`,
};

const recipientsList = document.querySelector("#recipientsList");
const timeline = document.querySelector("#timeline");
const terminal = document.querySelector("#terminal");
const pickerBadge = document.querySelector("#pickerBadge");
const chips = Array.from(document.querySelectorAll(".chip"));
const btnRun = document.querySelector("#btnRun");
const btnStep = document.querySelector("#btnStep");
const btnReset = document.querySelector("#btnReset");
const speedRange = document.querySelector("#speedRange");

let currentIndex = 0;
let running = false;
let timer = null;

function templateForIndex(index) {
  return templates[index % templates.length];
}

function htmlForTemplate(templateId) {
  return rawTemplates[templateId] ?? "<p>template não encontrado</p>";
}

function setFrameHtml(frame, html) {
  frame.srcdoc = html;
}

function renderRecipients() {
  recipientsList.innerHTML = recipients
    .map(
      (r, idx) => `
      <li data-i="${idx}">
        <span><span class="check"></span><span class="name">${r.nome}</span></span>
        <span class="email">${r.email}</span>
      </li>`
    )
    .join("");
}

function renderTimeline() {
  timeline.innerHTML = recipients
    .map((r, idx) => {
      const tpl = templateForIndex(idx);
      return `
        <li data-i="${idx}">
          <span class="n">#${idx + 1}</span>
          <span>
            <div class="name">${r.nome}</div>
            <div class="email">${r.email}</div>
          </span>
          <span class="pick">${tpl.short}</span>
        </li>`;
    })
    .join("");
}

function updateVisualState() {
  const nextTemplate = templateForIndex(currentIndex);
  pickerBadge.textContent = nextTemplate.short;

  chips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.tpl === nextTemplate.id);
  });

  document.querySelectorAll("#recipientsList li").forEach((li, idx) => {
    li.classList.toggle("active", idx === currentIndex && currentIndex < recipients.length);
    li.classList.toggle("sent", idx < currentIndex);
    const check = li.querySelector(".check");
    check.textContent = idx < currentIndex ? "✓" : "";
  });

  document.querySelectorAll("#timeline li").forEach((li, idx) => {
    li.classList.toggle("highlight", idx === currentIndex && currentIndex < recipients.length);
    li.classList.toggle("done", idx < currentIndex);
  });
}

function appendLog(html) {
  terminal.innerHTML += html + "\n";
  terminal.scrollTop = terminal.scrollHeight;
}

function resetSimulation() {
  running = false;
  clearTimeout(timer);
  timer = null;
  currentIndex = 0;
  terminal.innerHTML = `<span class="info">$ node dispatcher.js</span>\n<span class="lbl">modo:</span> round-robin · 4 templates · ${recipients.length} destinatários\n<span class="cursor"></span>`;
  updateVisualState();
  btnRun.textContent = "▶ Simular disparo";
}

function stepSimulation() {
  if (currentIndex >= recipients.length) {
    appendLog(`<span class="ok">✅ fim: ${recipients.length}/${recipients.length} processados</span>`);
    running = false;
    btnRun.textContent = "▶ Simular disparo";
    return false;
  }

  const r = recipients[currentIndex];
  const tpl = templateForIndex(currentIndex);
  const fakeId = `email_${String(currentIndex + 1).padStart(3, "0")}_${tpl.short.toLowerCase()}`;

  appendLog(
    `<span class="info">[${currentIndex + 1}/${recipients.length}]</span> ` +
      `<span class="lbl">${r.email}</span> → ` +
      `<b>${tpl.short}</b> (${tpl.name})\n` +
      `   resend.emails.send({ to: "${r.email}", template: "${tpl.id}" })\n` +
      `   <span class="ok">✅ enviado</span> id=${fakeId}`
  );

  currentIndex++;
  updateVisualState();
  return true;
}

function runLoop() {
  if (!running) return;
  const hasMore = stepSimulation();
  if (!hasMore) return;
  timer = setTimeout(runLoop, Number(speedRange.value));
}

function renderGallery() {
  const grid = document.querySelector("#galleryGrid");
  const cardTpl = document.querySelector("#cardTpl");

  for (const t of templates) {
    const node = cardTpl.content.cloneNode(true);
    const article = node.querySelector("article");
    const frame = node.querySelector("iframe");

    node.querySelector(".name").textContent = t.name;
    node.querySelector(".tag").textContent = t.short;
    node.querySelector(".addr").textContent = recipients[0].email;
    node.querySelector(".subject").textContent = t.subject;

    setFrameHtml(frame, htmlForTemplate(t.id));

    node.querySelector(".fullscreen").addEventListener("click", () => {
      openTemplateModal(t);
    });

    article.addEventListener("mouseenter", () => {
      chips.forEach((chip) => chip.classList.toggle("active", chip.dataset.tpl === t.id));
      pickerBadge.textContent = t.short;
    });

    article.addEventListener("mouseleave", updateVisualState);

    grid.appendChild(node);
  }
}

function openTemplateModal(template) {
  const modal = document.querySelector("#modal");
  document.querySelector("#modalTitle").textContent = `${template.short} · ${template.name}`;
  setFrameHtml(document.querySelector("#modalFrame"), htmlForTemplate(template.id));
  modal.hidden = false;
}

function closeTemplateModal() {
  document.querySelector("#modal").hidden = true;
}

function openCodeModal(key) {
  const modal = document.querySelector("#codeModal");
  document.querySelector("#codeTitle").textContent = key === "recipients" ? "recipients.js" : "dispatcher.js";
  document.querySelector("#codeBody").textContent = codeSnippets[key];
  modal.hidden = false;
}

function closeCodeModal() {
  document.querySelector("#codeModal").hidden = true;
}

function wireEvents() {
  btnRun.addEventListener("click", () => {
    if (running) {
      running = false;
      clearTimeout(timer);
      btnRun.textContent = "▶ Continuar";
      return;
    }
    if (currentIndex >= recipients.length) resetSimulation();
    running = true;
    btnRun.textContent = "⏸ Pausar";
    runLoop();
  });

  btnStep.addEventListener("click", () => {
    if (running) return;
    stepSimulation();
  });

  btnReset.addEventListener("click", resetSimulation);

  document.querySelector("#modalClose").addEventListener("click", closeTemplateModal);
  document.querySelector("#modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeTemplateModal();
  });

  document.querySelector("#codeClose").addEventListener("click", closeCodeModal);
  document.querySelector("#codeModal").addEventListener("click", (e) => {
    if (e.target.id === "codeModal") closeCodeModal();
  });

  document.querySelectorAll(".peek").forEach((btn) => {
    btn.addEventListener("click", () => openCodeModal(btn.dataset.target));
  });

  chips.forEach((chip, idx) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".email-card")[idx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTemplateModal();
      closeCodeModal();
    }
  });
}

renderRecipients();
renderTimeline();
renderGallery();
wireEvents();
resetSimulation();
