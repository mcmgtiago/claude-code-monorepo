const state = {
  data: null,
  selectedContactId: "",
  selectedTemplateId: "",
  draft: null,
  currentView: "send"
};

const pageDetails = {
  send: { eyebrow: "Fluxo 01", title: "Preparar envio" },
  contacts: { eyebrow: "Base 02", title: "Organizar contatos" },
  templates: { eyebrow: "Biblioteca 03", title: "Escolher abordagem" },
  history: { eyebrow: "Registro 04", title: "Acompanhar envios" }
};

function previewData() {
  return {
    contacts: [{
      id: "preview-contact",
      email: "contato@empresa.com",
      optedOut: false,
      createdAt: "2026-07-26T12:00:00.000Z"
    }],
    templates: [
      {
        id: "abertura-direta",
        title: "Abordagem direta",
        category: "Introdução",
        subject: "Uma pergunta rápida sobre [seu serviço]",
        preview: "Uma abordagem objetiva para [resultado desejado].",
        body: "Olá,\n\nEstou entrando em contato porque trabalho com [seu serviço] para ajudar empresas a [resultado desejado].\n\nFaz sentido conversar?\n\nAtenciosamente,\n{{remetente}}\n\nSe preferir não receber novos contatos, responda a este e-mail com \"remover\"."
      },
      {
        id: "problema-recorrente",
        title: "Problema recorrente",
        category: "Dor operacional",
        subject: "Uma ideia para reduzir [problema]",
        preview: "Uma pergunta simples antes de enviar mais detalhes.",
        body: "Olá,\n\nMuitas equipes ainda perdem tempo com [problema].\n\nPosso enviar um exemplo curto para avaliar?\n\nAtenciosamente,\n{{remetente}}\n\nSe preferir não receber novos contatos, responda a este e-mail com \"remover\"."
      },
      {
        id: "diagnostico-curto",
        title: "Diagnóstico curto",
        category: "Valor inicial",
        subject: "Posso enviar um diagnóstico simples?",
        preview: "Uma forma objetiva de avaliar [tema] antes de decidir.",
        body: "Olá,\n\nTenho uma sugestão simples para analisar [tema].\n\nPosso enviar um diagnóstico de uma página?\n\nAtenciosamente,\n{{remetente}}\n\nSe preferir não receber novos contatos, responda a este e-mail com \"remover\"."
      },
      {
        id: "prioridade-atual",
        title: "Prioridade atual",
        category: "Checagem de contexto",
        subject: "Vale olhar para [tema] agora?",
        preview: "Quero confirmar se o assunto é relevante antes de insistir.",
        body: "Olá,\n\nQueria avaliar se [tema] é uma prioridade neste trimestre.\n\nHá alguém com quem eu deveria falar?\n\nAtenciosamente,\n{{remetente}}\n\nSe preferir não receber novos contatos, responda a este e-mail com \"remover\"."
      },
      {
        id: "encerramento-respeitoso",
        title: "Encerramento respeitoso",
        category: "Último contato",
        subject: "Posso encerrar este assunto?",
        preview: "Uma última checagem, sem insistência.",
        body: "Olá,\n\nNão quero ocupar sua caixa de entrada sem necessidade.\n\nSe fizer sentido, basta responder a esta mensagem.\n\nAtenciosamente,\n{{remetente}}\n\nSe preferir não receber novos contatos, responda a este e-mail com \"remover\"."
      }
    ],
    history: [],
    settings: {
      senderName: "Seu nome",
      senderEmail: "voce@seudominio.com",
      replyTo: "",
      companyName: "Sua empresa"
    },
    config: {
      provider: "Resend",
      senderConfigured: true,
      mailConfigured: false,
      ready: false
    }
  };
}

const elements = {
  body: document.body,
  pageEyebrow: document.querySelector("#page-eyebrow"),
  pageTitle: document.querySelector("#page-title"),
  flash: document.querySelector("#flash-message"),
  navLinks: document.querySelectorAll(".nav-link"),
  views: document.querySelectorAll(".view"),
  sidebarDeliveryState: document.querySelector("#sidebar-delivery-state"),
  recipientSelect: document.querySelector("#recipient-select"),
  templateOptions: document.querySelector("#template-options"),
  templateCount: document.querySelector("#template-count"),
  subjectInput: document.querySelector("#subject-input"),
  previewInput: document.querySelector("#preview-input"),
  bodyInput: document.querySelector("#body-input"),
  dirtyState: document.querySelector("#template-dirty-state"),
  previewFrom: document.querySelector("#preview-from"),
  previewTo: document.querySelector("#preview-to"),
  previewSubject: document.querySelector("#preview-subject"),
  previewPreheader: document.querySelector("#preview-preheader"),
  previewBody: document.querySelector("#preview-body"),
  complianceCheck: document.querySelector("#compliance-check"),
  sendButton: document.querySelector("#send-email"),
  sendGuard: document.querySelector("#send-guard"),
  contactCount: document.querySelector("#contact-count"),
  contactsTableBody: document.querySelector("#contacts-table-body"),
  templateLibrary: document.querySelector("#template-library"),
  historyCount: document.querySelector("#history-count"),
  historyTableBody: document.querySelector("#history-table-body"),
  contactDialog: document.querySelector("#contact-dialog"),
  contactForm: document.querySelector("#contact-form"),
  settingsDialog: document.querySelector("#settings-dialog"),
  settingsForm: document.querySelector("#settings-form"),
  quickContactForm: document.querySelector("#quick-contact-form"),
  csvImportForm: document.querySelector("#csv-import-form")
};

function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(path, { ...options, headers }).then(async (response) => {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Não foi possível concluir a operação.");
    }
    return payload;
  });
}

async function loadState() {
  const previousContact = state.selectedContactId;
  const previousTemplate = state.selectedTemplateId;
  try {
    state.data = await api("/api/state");
  } catch (error) {
    if (!window.location.pathname.includes("/mockups/")) {
      throw error;
    }
    state.data = previewData();
  }

  const activeContacts = state.data.contacts.filter((contact) => !contact.optedOut);
  state.selectedContactId = activeContacts.some((contact) => contact.id === previousContact)
    ? previousContact
    : activeContacts[0]?.id || "";
  state.selectedTemplateId = state.data.templates.some((template) => template.id === previousTemplate)
    ? previousTemplate
    : state.data.templates[0]?.id || "";
  loadDraftFromSelectedTemplate();
  renderAll();
}

function selectedContact() {
  return state.data?.contacts.find((contact) => contact.id === state.selectedContactId) || null;
}

function selectedTemplate() {
  return state.data?.templates.find((template) => template.id === state.selectedTemplateId) || null;
}

function loadDraftFromSelectedTemplate() {
  const template = selectedTemplate();
  state.draft = template ? {
    id: template.id,
    subject: template.subject,
    preview: template.preview,
    body: template.body
  } : null;
}

function isDraftDirty() {
  const template = selectedTemplate();
  return Boolean(template && state.draft && (
    template.subject !== state.draft.subject ||
    template.preview !== state.draft.preview ||
    template.body !== state.draft.body
  ));
}

function fillText(node, value, fallback = "") {
  node.textContent = value || fallback;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function flash(message, type = "success") {
  elements.flash.textContent = message;
  elements.flash.className = `flash is-${type}`;
  elements.flash.hidden = false;
  window.clearTimeout(flash.timeout);
  flash.timeout = window.setTimeout(() => {
    elements.flash.hidden = true;
  }, 5500);
}

function renderAll() {
  renderRecipientSelect();
  renderTemplateOptions();
  renderEditor();
  renderPreview();
  renderDeliveryState();
  renderContacts();
  renderTemplateLibrary();
  renderHistory();
}

function renderRecipientSelect() {
  const select = elements.recipientSelect;
  select.replaceChildren();
  const prompt = new Option("Escolha um contato", "");
  select.add(prompt);

  for (const contact of state.data.contacts) {
    if (contact.optedOut) {
      continue;
    }
    select.add(new Option(contact.email, contact.id, false, contact.id === state.selectedContactId));
  }
}

function renderTemplateOptions() {
  elements.templateOptions.replaceChildren();
  elements.templateCount.textContent = `${state.data.templates.length} modelos`;

  state.data.templates.forEach((template, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `template-option${template.id === state.selectedTemplateId ? " is-selected" : ""}`;
    button.dataset.templateId = template.id;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(template.id === state.selectedTemplateId));
    button.tabIndex = template.id === state.selectedTemplateId ? 0 : -1;
    button.innerHTML = `<span class="template-number">0${index + 1}</span><span><span class="template-title"></span><span class="template-category"></span></span><span class="selection-mark" aria-hidden="true">+</span>`;
    button.querySelector(".template-title").textContent = template.title;
    button.querySelector(".template-category").textContent = template.category;
    elements.templateOptions.append(button);
  });
}

function renderEditor() {
  const draft = state.draft;
  elements.subjectInput.value = draft?.subject || "";
  elements.previewInput.value = draft?.preview || "";
  elements.bodyInput.value = draft?.body || "";
  const dirty = isDraftDirty();
  elements.dirtyState.textContent = dirty ? "Não salvo" : "Salvo";
  elements.dirtyState.classList.toggle("is-dirty", dirty);
}

function replacePreviewVariables(value) {
  const settings = state.data.settings;
  const contact = selectedContact();
  return String(value || "")
    .replace(/\{\{remetente\}\}/g, settings.senderName || settings.companyName || "[seu nome]")
    .replace(/\{\{empresa_remetente\}\}/g, settings.companyName || "[sua empresa]")
    .replace(/\{\{email\}\}/g, contact?.email || "[e-mail]");
}

function renderPreview() {
  const settings = state.data.settings;
  const contact = selectedContact();
  const draft = state.draft;
  const from = settings.senderName && settings.senderEmail
    ? `${settings.senderName} <${settings.senderEmail}>`
    : "Configure o remetente";

  fillText(elements.previewFrom, from);
  fillText(elements.previewTo, contact?.email, "Escolha um contato");
  fillText(elements.previewSubject, replacePreviewVariables(draft?.subject), "Escolha um modelo");
  fillText(elements.previewPreheader, replacePreviewVariables(draft?.preview));
  fillText(elements.previewBody, replacePreviewVariables(draft?.body), "A mensagem aparecerá aqui.");
}

function renderDeliveryState() {
  const { config } = state.data;
  let message = "Pronto para configurar";
  let stateClass = "";
  if (config.ready) {
    message = "Envio pronto";
    stateClass = "is-ready";
  } else if (!config.senderConfigured && !config.mailConfigured) {
    message = "Remetente e chave pendentes";
    stateClass = "is-blocked";
  } else if (!config.senderConfigured) {
    message = "Remetente pendente";
    stateClass = "is-blocked";
  } else {
    message = "Chave do Resend pendente";
    stateClass = "is-blocked";
  }

  elements.sidebarDeliveryState.className = `delivery-state ${stateClass}`;
  elements.sidebarDeliveryState.querySelector("span:last-child").textContent = message;

  const contact = selectedContact();
  const canSend = Boolean(config.ready && contact && !contact.optedOut && state.draft && elements.complianceCheck.checked);
  elements.sendButton.disabled = !canSend;

  if (!config.senderConfigured) {
    elements.sendGuard.textContent = "Informe nome e e-mail remetente em Configuração.";
  } else if (!config.mailConfigured) {
    elements.sendGuard.textContent = "Adicione RESEND_API_KEY ao arquivo .env e reinicie o servidor.";
  } else if (!contact) {
    elements.sendGuard.textContent = "Escolha ou cadastre um contato para continuar.";
  } else if (!elements.complianceCheck.checked) {
    elements.sendGuard.textContent = "Confirme a permissão de contato antes de enviar.";
  } else {
    elements.sendGuard.textContent = "O e-mail será enviado apenas para este contato.";
  }
}

function createStatusPill(text, className) {
  const status = document.createElement("span");
  status.className = `status-pill ${className}`;
  status.textContent = text;
  return status;
}

function renderContacts() {
  elements.contactCount.textContent = `${state.data.contacts.length} ${state.data.contacts.length === 1 ? "contato" : "contatos"}`;
  elements.contactsTableBody.replaceChildren();

  if (state.data.contacts.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    row.innerHTML = "<td colspan=\"4\">Nenhum contato cadastrado. Adicione um e-mail ou importe uma planilha CSV.</td>";
    elements.contactsTableBody.append(row);
    return;
  }

  for (const contact of state.data.contacts) {
    const row = document.createElement("tr");
    const email = document.createElement("td");
    email.textContent = contact.email;
    const status = document.createElement("td");
    status.append(createStatusPill(contact.optedOut ? "Bloqueado" : "Ativo", contact.optedOut ? "is-blocked" : "is-active"));
    const created = document.createElement("td");
    created.textContent = formatDate(contact.createdAt);
    const actionCell = document.createElement("td");
    const action = document.createElement("button");
    action.type = "button";
    action.className = "table-action";
    action.dataset.contactAction = "toggle-opt-out";
    action.dataset.contactId = contact.id;
    action.textContent = contact.optedOut ? "Reativar" : "Bloquear";
    actionCell.append(action);
    row.append(email, status, created, actionCell);
    elements.contactsTableBody.append(row);
  }
}

function renderTemplateLibrary() {
  elements.templateLibrary.replaceChildren();

  state.data.templates.forEach((template, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "library-card";
    card.dataset.templateId = template.id;
    card.innerHTML = `<span class="template-number">MODELO 0${index + 1}</span><h3></h3><p></p><span class="library-subject"></span>`;
    card.querySelector("h3").textContent = template.title;
    card.querySelector("p").textContent = template.category;
    card.querySelector(".library-subject").textContent = template.subject;
    elements.templateLibrary.append(card);
  });
}

function renderHistory() {
  elements.historyCount.textContent = `${state.data.history.length} ${state.data.history.length === 1 ? "registro" : "registros"}`;
  elements.historyTableBody.replaceChildren();

  if (state.data.history.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    row.innerHTML = "<td colspan=\"4\">Nenhuma tentativa de envio registrada ainda.</td>";
    elements.historyTableBody.append(row);
    return;
  }

  for (const item of state.data.history) {
    const row = document.createElement("tr");
    const date = document.createElement("td");
    date.textContent = formatDate(item.sentAt);
    const email = document.createElement("td");
    email.textContent = item.contactEmail;
    const template = document.createElement("td");
    template.textContent = item.templateTitle;
    const status = document.createElement("td");
    const label = item.status === "sent" ? "Enviado" : "Falhou";
    status.append(createStatusPill(label, item.status === "sent" ? "is-sent" : "is-failed"));
    row.append(date, email, template, status);
    elements.historyTableBody.append(row);
  }
}

function setView(view) {
  state.currentView = view;
  const details = pageDetails[view];
  elements.pageEyebrow.textContent = details.eyebrow;
  elements.pageTitle.textContent = details.title;

  elements.navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewTarget === view);
  });
  elements.views.forEach((section) => {
    const isActive = section.dataset.view === view;
    section.hidden = !isActive;
    section.classList.toggle("is-active", isActive);
  });
}

function selectTemplate(id) {
  if (id === state.selectedTemplateId || !state.data.templates.some((template) => template.id === id)) {
    return id === state.selectedTemplateId;
  }
  if (isDraftDirty() && !window.confirm("As alterações neste modelo ainda não foram salvas. Trocar de modelo mesmo assim?")) {
    return false;
  }
  state.selectedTemplateId = id;
  loadDraftFromSelectedTemplate();
  renderAll();
  return true;
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

function closeDialog(dialog) {
  if (dialog.open) {
    dialog.close();
  }
}

async function addContact(email) {
  const result = await api("/api/contacts", {
    method: "POST",
    body: JSON.stringify({ email })
  });
  state.selectedContactId = result.contact.id;
  await loadState();
  flash("Contato adicionado à base local.");
}

async function saveTemplate({ quiet = false } = {}) {
  if (!state.draft) {
    throw new Error("Escolha um modelo antes de salvar.");
  }

  const result = await api(`/api/templates/${state.draft.id}`, {
    method: "PUT",
    body: JSON.stringify({
      subject: state.draft.subject,
      preview: state.draft.preview,
      body: state.draft.body
    })
  });
  const index = state.data.templates.findIndex((template) => template.id === result.template.id);
  state.data.templates[index] = result.template;
  loadDraftFromSelectedTemplate();
  renderAll();
  if (!quiet) {
    flash("Modelo salvo.");
  }
}

async function resetTemplate() {
  const template = selectedTemplate();
  if (!template || !window.confirm(`Restaurar o modelo "${template.title}"? As alterações salvas serão perdidas.`)) {
    return;
  }
  const result = await api(`/api/templates/${template.id}/reset`, { method: "POST" });
  const index = state.data.templates.findIndex((item) => item.id === result.template.id);
  state.data.templates[index] = result.template;
  loadDraftFromSelectedTemplate();
  renderAll();
  flash("Modelo original restaurado.");
}

async function sendEmail() {
  if (!elements.complianceCheck.checked) {
    renderDeliveryState();
    return;
  }
  if (isDraftDirty()) {
    await saveTemplate({ quiet: true });
  }

  elements.sendButton.disabled = true;
  elements.sendButton.textContent = "Enviando...";
  try {
    const result = await api("/api/send", {
      method: "POST",
      body: JSON.stringify({
        contactId: state.selectedContactId,
        templateId: state.selectedTemplateId
      })
    });
    elements.complianceCheck.checked = false;
    await loadState();
    flash(`E-mail enviado e registrado às ${formatDate(result.sentAt)}.`);
  } finally {
    elements.sendButton.textContent = "Enviar este e-mail";
    renderDeliveryState();
  }
}

function bindEvents() {
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", () => setView(link.dataset.viewTarget));
  });

  document.querySelector("#open-settings").addEventListener("click", () => {
    const settings = state.data.settings;
    elements.settingsForm.senderName.value = settings.senderName || "";
    elements.settingsForm.companyName.value = settings.companyName || "";
    elements.settingsForm.senderEmail.value = settings.senderEmail || "";
    elements.settingsForm.replyTo.value = settings.replyTo || "";
    openDialog(elements.settingsDialog);
  });

  document.querySelector("#open-contact-from-send").addEventListener("click", () => openDialog(elements.contactDialog));
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(document.querySelector(`#${button.dataset.closeDialog}`)));
  });

  elements.recipientSelect.addEventListener("change", () => {
    state.selectedContactId = elements.recipientSelect.value;
    renderPreview();
    renderDeliveryState();
  });

  elements.templateOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-template-id]");
    if (button) {
      selectTemplate(button.dataset.templateId);
    }
  });

  elements.templateOptions.addEventListener("keydown", (event) => {
    const current = event.target.closest("[data-template-id]");
    if (!current) {
      return;
    }

    const options = [...elements.templateOptions.querySelectorAll("[data-template-id]")];
    const currentIndex = options.indexOf(current);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = options.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTemplate = options[nextIndex];
    if (selectTemplate(nextTemplate.dataset.templateId)) {
      requestAnimationFrame(() => {
        elements.templateOptions.querySelector(`[data-template-id="${nextTemplate.dataset.templateId}"]`)?.focus();
      });
    }
  });

  elements.templateLibrary.addEventListener("click", (event) => {
    const card = event.target.closest("[data-template-id]");
    if (card) {
      selectTemplate(card.dataset.templateId);
      setView("send");
    }
  });

  [
    [elements.subjectInput, "subject"],
    [elements.previewInput, "preview"],
    [elements.bodyInput, "body"]
  ].forEach(([input, field]) => {
    input.addEventListener("input", () => {
      state.draft[field] = input.value;
      elements.dirtyState.textContent = "Não salvo";
      elements.dirtyState.classList.add("is-dirty");
      renderPreview();
    });
  });

  elements.complianceCheck.addEventListener("change", renderDeliveryState);
  document.querySelector("#save-template").addEventListener("click", () => saveTemplate().catch((error) => flash(error.message, "error")));
  document.querySelector("#reset-template").addEventListener("click", () => resetTemplate().catch((error) => flash(error.message, "error")));
  elements.sendButton.addEventListener("click", () => sendEmail().catch((error) => {
    elements.sendButton.textContent = "Enviar este e-mail";
    renderDeliveryState();
    flash(error.message, "error");
  }));

  elements.contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = new FormData(elements.contactForm).get("email");
    addContact(email)
      .then(() => {
        elements.contactForm.reset();
        closeDialog(elements.contactDialog);
      })
      .catch((error) => flash(error.message, "error"));
  });

  elements.quickContactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = new FormData(elements.quickContactForm).get("email");
    addContact(email)
      .then(() => elements.quickContactForm.reset())
      .catch((error) => flash(error.message, "error"));
  });

  elements.csvImportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = document.querySelector("#csv-file").files[0];
    if (!file) {
      flash("Escolha uma planilha CSV para importar.", "error");
      return;
    }
    try {
      const csv = await file.text();
      const result = await api("/api/contacts/import", {
        method: "POST",
        body: JSON.stringify({ csv })
      });
      await loadState();
      elements.csvImportForm.reset();
      flash(`Importação concluída: ${result.imported} adicionados, ${result.duplicates} duplicados e ${result.invalid} inválidos.`);
    } catch (error) {
      flash(error.message, "error");
    }
  });

  elements.contactsTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-contact-action]");
    if (!button) {
      return;
    }
    const contact = state.data.contacts.find((item) => item.id === button.dataset.contactId);
    if (!contact) {
      return;
    }
    const nextOptedOut = !contact.optedOut;
    const action = nextOptedOut ? "bloquear" : "reativar";
    if (!window.confirm(`Deseja ${action} ${contact.email}?`)) {
      return;
    }
    api(`/api/contacts/${contact.id}`, {
      method: "PATCH",
      body: JSON.stringify({ optedOut: nextOptedOut })
    })
      .then(async () => {
        if (nextOptedOut && state.selectedContactId === contact.id) {
          state.selectedContactId = "";
        }
        await loadState();
        flash(nextOptedOut ? "Contato bloqueado para novos e-mails." : "Contato reativado.");
      })
      .catch((error) => flash(error.message, "error"));
  });

  elements.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.settingsForm);
    api("/api/settings", {
      method: "PUT",
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    })
      .then(async () => {
        await loadState();
        closeDialog(elements.settingsDialog);
        flash("Configuração do remetente salva.");
      })
      .catch((error) => flash(error.message, "error"));
  });
}

async function boot() {
  bindEvents();
  try {
    await loadState();
    setView("send");
  } catch (error) {
    flash(`Não foi possível abrir o painel: ${error.message}`, "error");
  }
}

boot();
