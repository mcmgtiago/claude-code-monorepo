const state = {
  campaigns: [],
  config: { configured: false, defaultDelaySeconds: 15 },
  contacts: [],
  selectedContactIds: new Set(),
  selectedTemplateIds: new Set(),
  templates: []
};

const elements = {
  apiStatus: document.querySelector("#api-status"),
  campaignForm: document.querySelector("#campaign-form"),
  campaignSummary: document.querySelector("#campaign-summary"),
  campaignTemplates: document.querySelector("#campaign-templates"),
  campaignsList: document.querySelector("#campaigns-list"),
  contactForm: document.querySelector("#contact-form"),
  contactsBody: document.querySelector("#contacts-body"),
  delaySeconds: document.querySelector("#delay-seconds"),
  eligibleCount: document.querySelector("#eligible-count"),
  emptyCampaigns: document.querySelector("#empty-campaigns"),
  emptyContacts: document.querySelector("#empty-contacts"),
  historyCopy: document.querySelector("#history-copy"),
  selectEligible: document.querySelector("#select-eligible"),
  selectionSummary: document.querySelector("#selection-summary"),
  sentCount: document.querySelector("#sent-count"),
  setupNotice: document.querySelector("#setup-notice"),
  templateCount: document.querySelector("#template-count"),
  templatesGrid: document.querySelector("#templates-grid"),
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
  if (!value) return "Ainda não iniciado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function statusLabel(status) {
  const labels = {
    queued: "na fila",
    running: "em envio",
    cancelling: "cancelando",
    completed: "concluída",
    cancelled: "cancelada",
    interrupted: "interrompida"
  };
  return labels[status] || status;
}

function jobCounts(campaign) {
  const counts = { pending: 0, processing: 0, sent: 0, failed: 0, skipped: 0, cancelled: 0, unknown: 0 };
  for (const job of campaign.jobs) counts[job.status] = (counts[job.status] || 0) + 1;
  return counts;
}

function activeCampaigns() {
  return state.campaigns.some((campaign) => ["queued", "running", "cancelling"].includes(campaign.status));
}

function selectedEligibleContacts() {
  return state.contacts.filter((contact) => contact.optedIn && state.selectedContactIds.has(contact.id));
}

function selectedEnabledTemplates() {
  return state.templates.filter((template) => template.enabled && state.selectedTemplateIds.has(template.id));
}

function pruneSelections() {
  const validContacts = new Set(state.contacts.filter((contact) => contact.optedIn).map((contact) => contact.id));
  const validTemplates = new Set(state.templates.filter((template) => template.enabled).map((template) => template.id));
  state.selectedContactIds = new Set([...state.selectedContactIds].filter((id) => validContacts.has(id)));
  state.selectedTemplateIds = new Set([...state.selectedTemplateIds].filter((id) => validTemplates.has(id)));
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

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // A mensagem genérica abaixo cobre respostas inválidas.
  }

  if (!response.ok) throw new Error(payload.error || "A operação não foi concluída.");
  return payload;
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.className = `toast toast--visible${isError ? " toast--error" : ""}`;
  toastTimer = window.setTimeout(() => {
    elements.toast.className = "toast";
  }, 5000);
}

function renderStatus() {
  const configured = state.config.configured;
  elements.apiStatus.textContent = configured ? "API configurada" : "API pendente";
  elements.apiStatus.className = `status-chip ${configured ? "status-chip--ready" : "status-chip--pending"}`;
  elements.setupNotice.className = `notice${configured ? " notice--ready" : ""}`;
  elements.setupNotice.innerHTML = configured
    ? "<strong>API pronta</strong><span>As credenciais foram encontradas. Confirme que os modelos abaixo estão aprovados antes de enviar.</span>"
    : "<strong>Configuração necessária</strong><span>Adicione as credenciais da Cloud API no arquivo <code>.env</code> antes de iniciar uma campanha.</span>";
}

function renderMetrics() {
  const eligible = state.contacts.filter((contact) => contact.optedIn).length;
  const templates = state.templates.filter((template) => template.enabled).length;
  const sent = state.campaigns.reduce((total, campaign) => total + jobCounts(campaign).sent, 0);
  elements.eligibleCount.textContent = eligible;
  elements.templateCount.textContent = `${templates}/5`;
  elements.sentCount.textContent = sent;
}

function renderContacts() {
  const contacts = state.contacts;
  elements.emptyContacts.hidden = contacts.length > 0;
  elements.contactsBody.innerHTML = contacts
    .map((contact) => {
      const selectable = contact.optedIn;
      const selected = state.selectedContactIds.has(contact.id);
      return `
        <tr>
          <td><input type="checkbox" data-contact-select="${escapeHtml(contact.id)}" aria-label="Selecionar ${escapeHtml(contact.name)}" ${selected ? "checked" : ""} ${selectable ? "" : "disabled"}></td>
          <td><strong>${escapeHtml(contact.name)}</strong></td>
          <td class="phone">${escapeHtml(contact.phone)}</td>
          <td><span class="consent-badge ${contact.optedIn ? "consent-badge--yes" : "consent-badge--no"}">${contact.optedIn ? "Opt-in ativo" : "Descadastrado"}</span></td>
          <td>
            ${contact.optedIn ? `<button class="button button--text" type="button" data-action="opt-out" data-id="${escapeHtml(contact.id)}">Descadastrar</button>` : ""}
            <button class="button button--danger" type="button" data-action="delete-contact" data-id="${escapeHtml(contact.id)}">Remover</button>
          </td>
        </tr>`;
    })
    .join("");

  const selectedCount = selectedEligibleContacts().length;
  elements.selectionSummary.textContent = selectedCount
    ? `${selectedCount} contato${selectedCount === 1 ? "" : "s"} apto${selectedCount === 1 ? "" : "s"} selecionado${selectedCount === 1 ? "" : "s"}.`
    : "Nenhum contato selecionado.";
}

function renderTemplates() {
  elements.templatesGrid.innerHTML = state.templates
    .map(
      (template, index) => `
        <article class="template-card" data-template-id="${escapeHtml(template.id)}">
          <div>
            <span class="slot">MODELO ${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(template.label)}</h3>
          </div>
          <span class="template-status ${template.enabled ? "template-status--active" : ""}">${template.enabled ? "Ativo" : "Inativo"}</span>
          <div class="field">
            <label for="name-${template.id}">Nome aprovado</label>
            <input id="name-${template.id}" data-field="name" type="text" value="${escapeHtml(template.name)}" placeholder="nome_do_modelo" maxlength="512">
          </div>
          <div class="field">
            <label for="language-${template.id}">Idioma</label>
            <input id="language-${template.id}" data-field="language" type="text" value="${escapeHtml(template.language)}" maxlength="12">
          </div>
          <div class="field">
            <label for="description-${template.id}">Uso interno</label>
            <input id="description-${template.id}" data-field="description" type="text" value="${escapeHtml(template.description)}" placeholder="Ex.: primeiro contato" maxlength="280">
          </div>
          <label class="consent-control" for="enabled-${template.id}">
            <input id="enabled-${template.id}" data-field="enabled" type="checkbox" ${template.enabled ? "checked" : ""}>
            <span>Modelo ativo</span>
          </label>
          <label class="consent-control" for="name-param-${template.id}">
            <input id="name-param-${template.id}" data-field="useContactName" type="checkbox" ${template.useContactName ? "checked" : ""}>
            <span>Usa o nome em <code>{{1}}</code></span>
          </label>
          <button class="button button--primary" type="button" data-action="save-template">Salvar modelo</button>
        </article>`
    )
    .join("");
}

function renderCampaignOptions() {
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
  const contacts = selectedEligibleContacts().length;
  const templates = selectedEnabledTemplates().length;
  const count = contacts * templates;
  const submit = elements.campaignForm.querySelector('button[type="submit"]');

  if (!state.config.configured) {
    elements.campaignSummary.textContent = "Configure a Cloud API no arquivo .env para liberar o envio.";
  } else if (!contacts || !templates) {
    elements.campaignSummary.textContent = "Selecione contatos aptos e pelo menos um modelo ativo.";
  } else {
    elements.campaignSummary.textContent = `${contacts} contato${contacts === 1 ? "" : "s"} x ${templates} modelo${templates === 1 ? "" : "s"}: ${count} mensagem${count === 1 ? "" : "s"} na fila.`;
  }
  submit.disabled = !state.config.configured || !contacts || !templates;
}

function renderCampaigns() {
  elements.emptyCampaigns.hidden = state.campaigns.length > 0;
  elements.historyCopy.textContent = activeCampaigns()
    ? "A fila é atualizada automaticamente enquanto houver envios em andamento."
    : "As campanhas recentes aparecem aqui.";

  elements.campaignsList.innerHTML = state.campaigns
    .slice(0, 20)
    .map((campaign) => {
      const counts = jobCounts(campaign);
      const total = campaign.jobs.length;
      const visibleJobs = campaign.jobs.slice(-100).reverse();
      const progress = ["sent", "failed", "skipped", "cancelled", "pending", "processing"]
        .filter((status) => counts[status])
        .map((status) => `<span class="${status}" style="flex:${counts[status]}" title="${status}: ${counts[status]}"></span>`)
        .join("");
      const canCancel = ["queued", "running", "cancelling"].includes(campaign.status);
      const campaignLabel = `${total} envio${total === 1 ? "" : "s"}`;
      return `
        <article class="campaign">
          <div class="campaign-head">
            <div class="campaign-title">
              <strong>${campaignLabel}</strong>
              <span>${escapeHtml(campaign.id.slice(0, 8))}</span>
            </div>
            <div>
              <span class="campaign-status campaign-status--${escapeHtml(campaign.status)}">${escapeHtml(statusLabel(campaign.status))}</span>
              ${canCancel ? `<button class="button button--text" type="button" data-action="cancel-campaign" data-id="${escapeHtml(campaign.id)}">Cancelar</button>` : ""}
            </div>
          </div>
          <div class="campaign-details">
            <span>Criada: ${escapeHtml(formatDate(campaign.createdAt))}</span>
            <span>Intervalo: ${escapeHtml(campaign.delaySeconds)} s</span>
            <span>Enviadas: ${counts.sent}</span>
            <span>Falhas: ${counts.failed}</span>
            <span>Ignoradas: ${counts.skipped}</span>
          </div>
          <div class="campaign-progress" aria-label="Progresso: ${counts.sent} enviados, ${counts.failed} falhas, ${counts.pending + counts.processing} pendentes">${progress}</div>
          <details class="job-details">
            <summary>Ver detalhes dos envios</summary>
            <div class="job-list">
              ${visibleJobs
                .map(
                  (job) => `
                    <div class="job-row">
                      <span>${escapeHtml(job.contactName)} <small>${escapeHtml(job.templateLabel)}</small></span>
                      <span class="job-status job-status--${escapeHtml(job.status)}">${escapeHtml(job.status)}</span>
                      ${job.error ? `<span class="job-error">${escapeHtml(job.error)}</span>` : ""}
                    </div>`
                )
                .join("")}
            </div>
            ${campaign.jobs.length > visibleJobs.length ? `<p class="job-limit">Mostrando os últimos ${visibleJobs.length} envios.</p>` : ""}
          </details>
        </article>`;
    })
    .join("");
}

function renderAll() {
  pruneSelections();
  renderStatus();
  renderMetrics();
  renderContacts();
  renderTemplates();
  renderCampaignOptions();
  renderCampaigns();
}

function renderLiveData() {
  renderStatus();
  renderMetrics();
  renderCampaigns();
}

async function refresh({ silent = false, liveOnly = false } = {}) {
  try {
    const data = await api("/api/data");
    state.contacts = data.contacts;
    state.templates = data.templates;
    state.campaigns = data.campaigns;
    state.config = data.config;
    if (liveOnly) renderLiveData();
    else renderAll();
  } catch (error) {
    if (!silent) showToast(error.message, true);
  }
}

async function submitContact(event) {
  event.preventDefault();
  const form = new FormData(elements.contactForm);
  const submit = elements.contactForm.querySelector('button[type="submit"]');
  submit.disabled = true;

  try {
    await api("/api/contacts", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        optedIn: form.get("consent") === "on"
      })
    });
    elements.contactForm.reset();
    await refresh();
    showToast("Contato adicionado com opt-in ativo.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    submit.disabled = false;
  }
}

async function saveTemplate(button) {
  const card = button.closest("[data-template-id]");
  const id = card.dataset.templateId;
  const field = (name) => card.querySelector(`[data-field="${name}"]`);
  button.disabled = true;

  try {
    await api(`/api/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: field("name").value,
        language: field("language").value,
        description: field("description").value,
        enabled: field("enabled").checked,
        useContactName: field("useContactName").checked
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

async function submitCampaign(event) {
  event.preventDefault();
  const contacts = selectedEligibleContacts();
  const templates = selectedEnabledTemplates();
  const submit = elements.campaignForm.querySelector('button[type="submit"]');

  if (!contacts.length || !templates.length) {
    showToast("Selecione contatos aptos e modelos ativos.", true);
    return;
  }

  submit.disabled = true;
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
    showToast("Campanha adicionada à fila.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    renderCampaignSummary();
  }
}

async function actionForContact(action, id) {
  try {
    if (action === "opt-out") {
      await api(`/api/contacts/${id}/opt-out`, { method: "POST" });
      state.selectedContactIds.delete(id);
      showToast("Contato descadastrado. Ele não receberá novos envios.");
    } else if (action === "delete-contact") {
      await api(`/api/contacts/${id}`, { method: "DELETE" });
      state.selectedContactIds.delete(id);
      showToast("Contato removido.");
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

function bindEvents() {
  elements.contactForm.addEventListener("submit", submitContact);
  elements.campaignForm.addEventListener("submit", submitCampaign);

  elements.contactsBody.addEventListener("change", (event) => {
    const id = event.target.dataset.contactSelect;
    if (!id) return;
    if (event.target.checked) state.selectedContactIds.add(id);
    else state.selectedContactIds.delete(id);
    renderCampaignSummary();
    renderContacts();
  });

  elements.contactsBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    void actionForContact(button.dataset.action, button.dataset.id);
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
}

bindEvents();
void refresh();
window.setInterval(() => {
  if (activeCampaigns()) void refresh({ silent: true, liveOnly: true });
}, 3000);
