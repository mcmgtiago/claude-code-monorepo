const state = {
  contacts: [],
  templates: [],
  campaigns: [],
  config: { configured: false, defaultDelaySeconds: 15 },
  selectedContactIds: new Set(),
  selectedTemplateIds: new Set()
};

const elements = {
  apiStatus: document.querySelector("#api-status"),
  setupNotice: document.querySelector("#setup-notice"),
  eligibleCount: document.querySelector("#eligible-count"),
  templateCount: document.querySelector("#template-count"),
  sentCount: document.querySelector("#sent-count"),
  contactForm: document.querySelector("#contact-form"),
  contactsBody: document.querySelector("#contacts-body"),
  emptyContacts: document.querySelector("#empty-contacts"),
  selectionSummary: document.querySelector("#selection-summary"),
  selectEligible: document.querySelector("#select-eligible"),
  templatesGrid: document.querySelector("#templates-grid"),
  campaignForm: document.querySelector("#campaign-form"),
  campaignTemplates: document.querySelector("#campaign-templates"),
  delaySeconds: document.querySelector("#delay-seconds"),
  campaignSummary: document.querySelector("#campaign-summary"),
  campaignsList: document.querySelector("#campaigns-list"),
  emptyCampaigns: document.querySelector("#empty-campaigns"),
  historyCopy: document.querySelector("#history-copy"),
  toast: document.querySelector("#toast")
};

let toastTimer;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
    : "Ainda não iniciado";
}

function campaignCounts(campaign) {
  const counts = { pending: 0, processing: 0, sent: 0, failed: 0, skipped: 0, cancelled: 0, unknown: 0 };
  for (const job of campaign.jobs) counts[job.status] = (counts[job.status] || 0) + 1;
  return counts;
}

function isCampaignActive(campaign) {
  return ["queued", "running", "cancelling"].includes(campaign.status);
}

function activeCampaigns() {
  return state.campaigns.some(isCampaignActive);
}

function selectedContacts() {
  return state.contacts.filter((contact) => contact.optedIn && state.selectedContactIds.has(contact.id));
}

function selectedTemplates() {
  return state.templates.filter((template) => template.enabled && state.selectedTemplateIds.has(template.id));
}

function statusLabel(status) {
  return {
    queued: "na fila",
    running: "em envio",
    cancelling: "cancelando",
    completed: "concluída",
    cancelled: "cancelada",
    interrupted: "interrompida"
  }[status] || status;
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("Não foi possível acessar o servidor local. Verifique se ele está em execução.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    // A mensagem genérica cobre respostas que não forem JSON.
  }
  if (!response.ok) throw new Error(data.error || "A operação não foi concluída.");
  return data;
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.className = `toast toast--visible${isError ? " toast--error" : ""}`;
  toastTimer = window.setTimeout(() => {
    elements.toast.className = "toast";
  }, 5000);
}

function pruneSelections() {
  const contactIds = new Set(state.contacts.filter((contact) => contact.optedIn).map((contact) => contact.id));
  const templateIds = new Set(state.templates.filter((template) => template.enabled).map((template) => template.id));
  state.selectedContactIds = new Set([...state.selectedContactIds].filter((id) => contactIds.has(id)));
  state.selectedTemplateIds = new Set([...state.selectedTemplateIds].filter((id) => templateIds.has(id)));
}

function renderStatus() {
  const configured = state.config.configured;
  elements.apiStatus.textContent = configured ? "API configurada" : "API pendente";
  elements.apiStatus.className = `status-chip ${configured ? "status-chip--ready" : "status-chip--pending"}`;
  elements.setupNotice.className = `notice${configured ? " notice--ready" : ""}`;
  elements.setupNotice.innerHTML = configured
    ? "<strong>API pronta</strong><span>As credenciais foram encontradas. Confirme os modelos aprovados antes de enviar.</span>"
    : "<strong>Configuração necessária</strong><span>Adicione as credenciais da Cloud API no arquivo <code>.env</code> antes de iniciar uma campanha.</span>";
}

function renderMetrics() {
  const eligible = state.contacts.filter((contact) => contact.optedIn).length;
  const activeTemplates = state.templates.filter((template) => template.enabled).length;
  const sent = state.campaigns.reduce((total, campaign) => total + campaignCounts(campaign).sent, 0);
  elements.eligibleCount.textContent = eligible;
  elements.templateCount.textContent = `${activeTemplates}/5`;
  elements.sentCount.textContent = sent;
}

function renderContacts() {
  elements.emptyContacts.hidden = state.contacts.length > 0;
  elements.contactsBody.innerHTML = state.contacts
    .map((contact) => {
      const selectable = contact.optedIn;
      const selected = state.selectedContactIds.has(contact.id);
      const actions = contact.optedIn
        ? `<button class="button button--text" type="button" data-action="opt-out" data-id="${escapeHtml(contact.id)}">Descadastrar</button>`
        : '<span class="retention-note">Retido para bloqueio</span>';
      return `
        <tr>
          <td><input type="checkbox" data-contact-select="${escapeHtml(contact.id)}" aria-label="Selecionar ${escapeHtml(contact.name)}" ${selected ? "checked" : ""} ${selectable ? "" : "disabled"}></td>
          <td><strong>${escapeHtml(contact.name)}</strong></td>
          <td class="phone">${escapeHtml(contact.phone)}</td>
          <td><span class="consent-badge ${contact.optedIn ? "consent-badge--yes" : "consent-badge--no"}">${contact.optedIn ? "Opt-in ativo" : "Descadastrado"}</span></td>
          <td>${actions}</td>
        </tr>`;
    })
    .join("");

  const count = selectedContacts().length;
  elements.selectionSummary.textContent = count
    ? `${count} contato${count === 1 ? "" : "s"} apto${count === 1 ? "" : "s"} selecionado${count === 1 ? "" : "s"}.`
    : "Nenhum contato selecionado.";
}

function renderTemplates() {
  elements.templatesGrid.innerHTML = state.templates
    .map(
      (template, index) => `
        <article class="template-card" data-template-id="${escapeHtml(template.id)}">
          <div><span class="slot">MODELO ${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(template.label)}</h3></div>
          <span class="template-status ${template.enabled ? "template-status--active" : ""}">${template.enabled ? "Ativo" : "Inativo"}</span>
          <div class="field"><label for="name-${template.id}">Nome aprovado</label><input id="name-${template.id}" data-field="name" type="text" value="${escapeHtml(template.name)}" placeholder="nome_do_modelo" maxlength="512"></div>
          <div class="field"><label for="language-${template.id}">Idioma</label><input id="language-${template.id}" data-field="language" type="text" value="${escapeHtml(template.language)}" maxlength="12"></div>
          <div class="field"><label for="description-${template.id}">Uso interno</label><input id="description-${template.id}" data-field="description" type="text" value="${escapeHtml(template.description)}" placeholder="Ex.: primeiro contato" maxlength="280"></div>
          <label class="consent-control" for="enabled-${template.id}"><input id="enabled-${template.id}" data-field="enabled" type="checkbox" ${template.enabled ? "checked" : ""}><span>Modelo ativo</span></label>
          <label class="consent-control" for="name-param-${template.id}"><input id="name-param-${template.id}" data-field="useContactName" type="checkbox" ${template.useContactName ? "checked" : ""}><span>Usa o nome em <code>{{1}}</code></span></label>
          <button class="button button--primary" type="button" data-action="save-template">Salvar modelo</button>
        </article>`
    )
    .join("");
}

function renderCampaignForm() {
  elements.campaignTemplates.innerHTML = state.templates
    .map(
      (template) => `
        <label class="model-option ${template.enabled ? "" : "model-option--disabled"}" for="campaign-${template.id}">
          <input id="campaign-${template.id}" data-template-select="${escapeHtml(template.id)}" type="checkbox" ${state.selectedTemplateIds.has(template.id) ? "checked" : ""} ${template.enabled ? "" : "disabled"}>
          <span>${escapeHtml(template.label)}</span>
        </label>`
    )
    .join("");

  if (document.activeElement !== elements.delaySeconds) {
    elements.delaySeconds.value = state.config.defaultDelaySeconds;
  }
  renderCampaignSummary();
}

function renderCampaignSummary() {
  const contactCount = selectedContacts().length;
  const templateCount = selectedTemplates().length;
  const submit = elements.campaignForm.querySelector('button[type="submit"]');

  if (!state.config.configured) {
    elements.campaignSummary.textContent = "Configure a Cloud API no arquivo .env para liberar o envio.";
  } else if (!contactCount || !templateCount) {
    elements.campaignSummary.textContent = "Selecione contatos aptos e pelo menos um modelo ativo.";
  } else {
    const total = contactCount * templateCount;
    elements.campaignSummary.textContent = `${contactCount} contato${contactCount === 1 ? "" : "s"} x ${templateCount} modelo${templateCount === 1 ? "" : "s"}: ${total} mensagem${total === 1 ? "" : "s"} na fila.`;
  }
  submit.disabled = !state.config.configured || !contactCount || !templateCount;
}

function renderCampaigns() {
  elements.emptyCampaigns.hidden = state.campaigns.length > 0;
  elements.historyCopy.textContent = activeCampaigns()
    ? "A fila é atualizada automaticamente enquanto houver envios em andamento."
    : "As campanhas recentes aparecem aqui.";
  elements.campaignsList.innerHTML = state.campaigns.slice(0, 20).map((campaign) => {
    const counts = campaignCounts(campaign);
    const total = campaign.jobs.length;
    const active = isCampaignActive(campaign);
    const bars = ["sent", "failed", "skipped", "cancelled", "pending", "processing"]
      .filter((status) => counts[status])
      .map((status) => `<span class="${status}" style="flex:${counts[status]}" title="${status}: ${counts[status]}"></span>`)
      .join("");
    const jobs = campaign.jobs.slice(-100).reverse().map((job) => `
      <div class="job-row">
        <span>${escapeHtml(job.contactName)} <small>${escapeHtml(job.templateLabel)}</small></span>
        <span class="job-status job-status--${escapeHtml(job.status)}">${escapeHtml(job.status)}</span>
        ${job.error ? `<span class="job-error">${escapeHtml(job.error)}</span>` : ""}
      </div>`).join("");
    return `
      <article class="campaign">
        <div class="campaign-head">
          <div class="campaign-title"><strong>${total} envio${total === 1 ? "" : "s"}</strong><span>${escapeHtml(campaign.id.slice(0, 8))}</span></div>
          <div><span class="campaign-status campaign-status--${escapeHtml(campaign.status)}">${escapeHtml(statusLabel(campaign.status))}</span>${active ? `<button class="button button--text" type="button" data-action="cancel-campaign" data-id="${escapeHtml(campaign.id)}">Cancelar</button>` : ""}</div>
        </div>
        <div class="campaign-details"><span>Criada: ${escapeHtml(formatDate(campaign.createdAt))}</span><span>Intervalo: ${escapeHtml(campaign.delaySeconds)} s</span><span>Enviadas: ${counts.sent}</span><span>Falhas: ${counts.failed}</span><span>Ignoradas: ${counts.skipped}</span></div>
        <div class="campaign-progress" aria-label="Progresso da campanha">${bars}</div>
        <details class="job-details"><summary>Ver detalhes dos envios</summary><div class="job-list">${jobs}</div>${campaign.jobs.length > 100 ? '<p class="job-limit">Mostrando os últimos 100 envios.</p>' : ""}</details>
      </article>`;
  }).join("");
}

function renderAll() {
  pruneSelections();
  renderStatus();
  renderMetrics();
  renderContacts();
  renderTemplates();
  renderCampaignForm();
  renderCampaigns();
}

function renderLive() {
  renderStatus();
  renderMetrics();
  renderCampaigns();
}

async function refresh({ silent = false, liveOnly = false } = {}) {
  try {
    const data = await api("/api/data");
    Object.assign(state, data);
    if (liveOnly) renderLive();
    else renderAll();
  } catch (error) {
    if (!silent) showToast(error.message, true);
  }
}

async function addContact(event) {
  event.preventDefault();
  const form = new FormData(elements.contactForm);
  const button = elements.contactForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await api("/api/contacts", { method: "POST", body: JSON.stringify({ name: form.get("name"), phone: form.get("phone"), optedIn: form.get("consent") === "on" }) });
    elements.contactForm.reset();
    await refresh();
    showToast("Contato adicionado com opt-in ativo.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function saveTemplate(button) {
  const card = button.closest("[data-template-id]");
  const getField = (name) => card.querySelector(`[data-field="${name}"]`);
  button.disabled = true;
  try {
    await api(`/api/templates/${card.dataset.templateId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: getField("name").value,
        language: getField("language").value,
        description: getField("description").value,
        enabled: getField("enabled").checked,
        useContactName: getField("useContactName").checked
      })
    });
    await refresh();
    showToast("Modelo salvo.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function startCampaign(event) {
  event.preventDefault();
  const contacts = selectedContacts();
  const templates = selectedTemplates();
  if (!contacts.length || !templates.length) return showToast("Selecione contatos aptos e modelos ativos.", true);

  const button = elements.campaignForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await api("/api/campaigns", {
      method: "POST",
      body: JSON.stringify({
        contactIds: contacts.map((contact) => contact.id),
        templateIds: templates.map((template) => template.id),
        delaySeconds: elements.delaySeconds.value
      })
    });
    await refresh();
    showToast("Campanha adicionada à fila global.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    renderCampaignSummary();
  }
}

async function handleContactAction(button) {
  const { action, id } = button.dataset;
  try {
    if (action === "opt-out") {
      await api(`/api/contacts/${id}/opt-out`, { method: "POST" });
      state.selectedContactIds.delete(id);
      showToast("Contato descadastrado e retido na lista de bloqueio.");
    }
    await refresh();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function cancelCampaign(id) {
  try {
    await api(`/api/campaigns/${id}/cancel`, { method: "POST" });
    await refresh();
    showToast("Cancelamento solicitado. O envio atual pode levar alguns segundos para terminar.");
  } catch (error) {
    showToast(error.message, true);
  }
}

elements.contactForm.addEventListener("submit", addContact);
elements.campaignForm.addEventListener("submit", startCampaign);
elements.contactsBody.addEventListener("change", (event) => {
  const id = event.target.dataset.contactSelect;
  if (!id) return;
  if (event.target.checked) state.selectedContactIds.add(id);
  else state.selectedContactIds.delete(id);
  renderContacts();
  renderCampaignSummary();
});
elements.contactsBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (button) void handleContactAction(button);
});
elements.selectEligible.addEventListener("click", () => {
  state.selectedContactIds = new Set(state.contacts.filter((contact) => contact.optedIn).map((contact) => contact.id));
  renderContacts();
  renderCampaignSummary();
});
elements.templatesGrid.addEventListener("click", (event) => {
  const button = event.target.closest('button[data-action="save-template"]');
  if (button) void saveTemplate(button);
});
elements.campaignTemplates.addEventListener("change", (event) => {
  const id = event.target.dataset.templateSelect;
  if (!id) return;
  if (event.target.checked) state.selectedTemplateIds.add(id);
  else state.selectedTemplateIds.delete(id);
  renderCampaignSummary();
});
elements.campaignsList.addEventListener("click", (event) => {
  const button = event.target.closest('button[data-action="cancel-campaign"]');
  if (button) void cancelCampaign(button.dataset.id);
});

void refresh();
window.setInterval(() => {
  if (activeCampaigns()) void refresh({ silent: true, liveOnly: true });
}, 3000);
