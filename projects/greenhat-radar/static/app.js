const RADAR_MODE = window.RADAR_MODE || "saas";
const IS_LOCAL = RADAR_MODE === "local";
const API_PREFIX = IS_LOCAL ? "/api/local" : "/api";

const state = {
  companies: [],
  selectedCompanyId: null,
  searchTimer: null,
  listLoading: false,
  listError: "",
  listRequest: 0,
  listController: null,
  reviewJobTimer: null,
};

const statusLabels = {
  new: "Nova",
  researching: "Pesquisando",
  ready_for_review: "Pronta para revisar",
  contacted: "Contatada",
  call_scheduled: "Ligação agendada",
  proposal_sent: "Proposta enviada",
  negotiation: "Negociação",
  follow_up: "Follow-up",
  won: "Ganha",
  lost: "Perdida",
};

const detailPanel = document.getElementById("detail-panel");
const toastElement = document.getElementById("toast");

function fitLabel(score) {
  if (score >= 70) return "Alta";
  if (score >= 50) return "Revisar";
  return "Pesquisar";
}

function hasActiveFilters() {
  return ["search-input", "segment-filter", "focus-filter", "state-filter", "status-filter"].some(
    (fieldId) => document.getElementById(fieldId).value.trim(),
  );
}

function effectiveFocus(company) {
  return company.effective_focus || company.focus_override || company.focus_verdict || "revisar";
}

function focusLabel(company) {
  return {
    aderente: "Aderente",
    fora_do_foco: "Fora do foco",
    revisar: "Revisar",
  }[effectiveFocus(company)] || "Revisar";
}

function focusClass(company) {
  return `tag tag--focus tag--focus-${effectiveFocus(company)}`;
}

function sortCompanies(companies) {
  const sort = document.getElementById("sort-filter").value;
  const reviewRank = {
    ready_for_review: 0,
    new: 1,
    researching: 2,
    contacted: 3,
    follow_up: 4,
    won: 5,
    lost: 6,
  };
  const focusRank = {
    aderente: 0,
    revisar: 1,
    fora_do_foco: 2,
  };
  return [...companies].sort((left, right) => {
    if (sort === "name") {
      return companyDisplayName(left).localeCompare(companyDisplayName(right), "pt-BR");
    }
    if (sort === "recent") {
      return String(right.updated_at).localeCompare(String(left.updated_at));
    }
    if (sort === "review") {
      return reviewRank[left.pipeline_status] - reviewRank[right.pipeline_status]
        || right.fit_score - left.fit_score;
    }
    return focusRank[effectiveFocus(left)] - focusRank[effectiveFocus(right)]
      || right.fit_score - left.fit_score
      || String(right.updated_at).localeCompare(String(left.updated_at));
  });
}

function nextAction(company) {
  if (company.pipeline_status === "ready_for_review") {
    return ["Revisar rascunho", "Há uma oportunidade marcada para revisão antes de qualquer contato."];
  }
  if (company.website_status === "unavailable") {
    return ["Corrigir ou descartar", "O site não abriu na análise. Confirme a URL ou remova o lead da fila."];
  }
  if (!company.website) {
    return ["Completar os sinais", "Sem site público informado. Confirme contexto e dados antes de criar um rascunho."];
  }
  if (!company.website_title && !company.website_description) {
    return ["Analisar o site", "Use sinais públicos para confirmar o fit antes de preparar a abordagem."];
  }
  if (company.fit_score >= 70) {
    return ["Preparar abordagem", "Fit alto confirmado. Gere um rascunho e revise o contexto antes de usar."];
  }
  return ["Validar prioridade", "Revise os sinais do score antes de avançar para uma abordagem."];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHref(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function showToast(message, isError = false) {
  toastElement.textContent = message;
  toastElement.classList.toggle("toast--error", isError);
  toastElement.hidden = false;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toastElement.hidden = true;
  }, 4600);
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível concluir a solicitação.");
  }
  return payload;
}

function scoreClass(score) {
  if (score >= 70) return "score score--high";
  if (score < 40) return "score score--low";
  return "score";
}

function companyDisplayName(company) {
  if (IS_LOCAL) return company.business_name || company.trade_name || company.legal_name;
  return company.trade_name || company.legal_name;
}

function segmentLabel(segment) {
  return segment === "Review" ? "Outro" : segment;
}

function publicProfileLinks(company) {
  const websiteLinks = company.website_social_links || {};
  return [
    ["LinkedIn", company.linkedin_url || websiteLinks.linkedin],
    ["Instagram", company.instagram_url || websiteLinks.instagram],
    ["Facebook", websiteLinks.facebook],
    ["Google Business", websiteLinks.google_business],
    ["YouTube", websiteLinks.youtube],
    ["TikTok", websiteLinks.tiktok],
    ["WhatsApp", websiteLinks.whatsapp],
    ["X", websiteLinks.x],
  ].map(([label, url]) => [label, safeHref(url)]).filter(([, url]) => url !== "#");
}

function locationText(company) {
  return [company.city, company.state].filter(Boolean).join(", ") || "Não informado";
}

function renderMetrics(metrics) {
  document.getElementById("metric-total").textContent = metrics.total;
  document.getElementById("metric-priority").textContent = metrics.priority;
  document.getElementById("metric-ready").textContent = metrics.ready;
  document.getElementById("metric-active").textContent = metrics.active;
}

function renderCompanies() {
  const table = document.getElementById("lead-table");
  const empty = document.getElementById("lead-empty");
  const body = document.getElementById("lead-table-body");
  const listWrap = document.getElementById("lead-list-wrap");
  const resultSummary = document.getElementById("lead-result-summary");
  const clearFilters = document.getElementById("clear-filters");
  const companies = sortCompanies(state.companies);
  const isEmpty = companies.length === 0;
  const filtering = hasActiveFilters();

  listWrap.setAttribute("aria-busy", String(state.listLoading));
  clearFilters.hidden = !filtering;
  resultSummary.textContent = state.listLoading
    ? "Atualizando oportunidades..."
    : `${companies.length} oportunidade${companies.length === 1 ? "" : "s"}${filtering ? ` encontrada${companies.length === 1 ? "" : "s"}` : " na fila"}.`;
  table.hidden = isEmpty;
  empty.hidden = !isEmpty;
  if (isEmpty) {
    if (state.listLoading) {
      empty.innerHTML = "<div class=\"empty-state__content\"><strong>Carregando oportunidades...</strong><span>Atualizando sua fila de trabalho.</span></div>";
    } else if (state.listError) {
      empty.innerHTML = `<div class="empty-state__content"><strong>Não foi possível atualizar a fila.</strong><span>${escapeHtml(state.listError)}</span><button class="button button--secondary" type="button" data-action="reload-companies">Tentar novamente</button></div>`;
    } else if (filtering) {
      empty.innerHTML = "<div class=\"empty-state__content\"><strong>Nenhuma oportunidade encontrada.</strong><span>Altere ou limpe os filtros para ver outras empresas.</span><button class=\"button button--secondary\" type=\"button\" data-action=\"clear-filters\">Limpar filtros</button></div>";
    } else {
      empty.innerHTML = "<div class=\"empty-state__content\"><strong>Base vazia.</strong><span>Importe um CSV ou cadastre uma empresa para começar.</span><button class=\"button button--primary\" type=\"button\" data-action=\"focus-import\">Importar lista</button></div>";
    }
  }
  body.innerHTML = companies.map((company) => `
    <tr class="${state.selectedCompanyId === company.id ? "lead-row--selected" : ""}">
      <td>
        <span class="company-name">${escapeHtml(companyDisplayName(company))}</span>
        <span class="company-detail-line">${IS_LOCAL
          ? escapeHtml(company.description || company.segment || "")
          : escapeHtml(company.cnae_primary || "CNAE não informado")}</span>
      </td>
      <td><span class="tag">${escapeHtml(segmentLabel(company.segment))}</span><span class="company-detail-line">${IS_LOCAL
        ? escapeHtml(company.suggested_service || "")
        : escapeHtml(company.business_category || "Não identificado")}</span></td>
      <td>${IS_LOCAL
        ? `<span class="tag">${escapeHtml(company.website_quality === "none" ? "Sem site" : company.website_quality === "poor" ? "Site ruim" : company.website_status === "available" ? "Analisado" : "Pendente")}</span>`
        : `<span class="${focusClass(company)}">${escapeHtml(focusLabel(company))}</span>`}</td>
      <td><div class="fit-cell"><span class="${scoreClass(company.fit_score)}">${company.fit_score}</span><span class="fit-label">${fitLabel(company.fit_score)}</span></div></td>
      <td>${escapeHtml(locationText(company))}</td>
      <td><span class="tag tag--status">${escapeHtml(statusLabels[company.pipeline_status] || company.pipeline_status)}</span></td>
      <td><button class="table-action" type="button" data-action="select-company" data-company-id="${company.id}" aria-label="Abrir detalhes de ${escapeHtml(companyDisplayName(company))}">${state.selectedCompanyId === company.id ? "Aberta" : "Abrir"}</button></td>
    </tr>
  `).join("");
}

async function loadDashboard() {
  const [dashboard, list] = await Promise.all([api(`${API_PREFIX}/dashboard`), loadCompanies(), loadSegments()]);
  renderMetrics(dashboard);
  return list;
}

async function loadSegments() {
  try {
    const data = await api(`${API_PREFIX}/segments`);
    const select = document.getElementById("segment-filter");
    const currentValue = select.value;
    // Keep first option ("Todos os segmentos")
    select.innerHTML = '<option value="">Todos os segmentos</option>';
    if (data.segments && data.segments.length) {
      for (const seg of data.segments) {
        const opt = document.createElement("option");
        opt.value = seg;
        opt.textContent = seg;
        select.appendChild(opt);
      }
    }
    // Restore selection if it still exists
    if (currentValue) select.value = currentValue;
  } catch (e) {
    // Fallback: keep static options
  }
}

async function loadCompanies(render = true) {
  const search = document.getElementById("search-input").value.trim();
  const segment = document.getElementById("segment-filter").value;
  const focus = document.getElementById("focus-filter");
  const stateFilter = document.getElementById("state-filter");
  const status = document.getElementById("status-filter").value;
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (segment) params.set("segment", segment);
  if (focus && focus.value) params.set(IS_LOCAL ? "city" : "focus", focus.value);
  if (stateFilter && stateFilter.value) params.set(IS_LOCAL ? "city" : "state", stateFilter.value);
  if (status) params.set("status", status);
  state.listController?.abort();
  const controller = new AbortController();
  const requestId = ++state.listRequest;
  state.listController = controller;
  state.listLoading = true;
  state.listError = "";
  if (render) renderCompanies();
  try {
    const payload = await api(`${API_PREFIX}/companies?${params.toString()}`, { signal: controller.signal });
    if (requestId !== state.listRequest) return state.companies;
    state.companies = payload.companies;
    return payload.companies;
  } catch (error) {
    if (error.name === "AbortError" || requestId !== state.listRequest) return state.companies;
    state.listError = error.message;
    throw error;
  } finally {
    if (requestId === state.listRequest) {
      state.listLoading = false;
      state.listController = null;
      if (render) renderCompanies();
    }
  }
}

function renderWebsiteSection(company) {
  const hasSummary = company.website_title || company.website_description || company.website_excerpt;
  const siteUnavailable = company.website_status === "unavailable";
  const profileCount = Object.keys(company.website_social_links || {}).length;
  const websiteLink = company.website
    ? `<a href="${escapeHtml(safeHref(company.website))}" target="_blank" rel="noreferrer">Abrir site</a>`
    : "<span class=\"company-detail-line\">Nenhum site informado</span>";
  const excerpt = company.website_excerpt
    ? `${escapeHtml(company.website_excerpt.slice(0, 700))}${company.website_excerpt.length > 700 ? "..." : ""}`
    : "Ainda não analisado.";
  return `
    <section class="detail-section">
      <h3>Site público</h3>
      ${websiteLink}
      ${hasSummary ? `
        <p><strong>${escapeHtml(company.website_title || "Sem título")}</strong></p>
        <p>${escapeHtml(company.website_description || excerpt)}</p>
      ` : `<p>${excerpt}</p>`}
      ${profileCount ? `<p class="website-discovery">${profileCount} perfil${profileCount === 1 ? "" : "is"} público${profileCount === 1 ? "" : "s"} encontrado${profileCount === 1 ? "" : "s"} no site.</p>` : ""}
      ${siteUnavailable ? "<p class=\"website-status website-status--unavailable\" role=\"status\">O RADAR não conseguiu abrir este site. Corrija a URL, tente novamente ou remova este lead da fila.</p>" : ""}
      <div class="website-actions">
        <button class="button button--quiet" type="button" data-action="enrich-company" data-company-id="${company.id}" ${company.website ? "" : "disabled"}>${siteUnavailable ? "Tentar novamente" : "Analisar site"}</button>
        ${siteUnavailable ? `<button class="button button--danger" type="button" data-action="delete-company" data-company-id="${company.id}" data-company-name="${escapeHtml(companyDisplayName(company))}">Remover lead</button>` : ""}
      </div>
    </section>
  `;
}

function renderDrafts(drafts) {
  if (!drafts.length) {
    return "<p class=\"company-detail-line\">Nenhum rascunho criado ainda.</p>";
  }
  return drafts.map((draft) => `
    <article class="draft-card" data-draft-id="${draft.id}">
      <div class="draft-card__top">
        <span>${escapeHtml(draft.channel)} · ${escapeHtml(draft.language)}</span>
        <strong class="draft-status draft-status--${escapeHtml(draft.status)}">${escapeHtml(draft.status.replaceAll("_", " "))}</strong>
      </div>
      <label class="visually-hidden" for="draft-content-${draft.id}">Conteúdo do rascunho</label>
      <textarea id="draft-content-${draft.id}" rows="7">${escapeHtml(draft.content)}</textarea>
      <label class="visually-hidden" for="draft-notes-${draft.id}">Notas da revisão</label>
      <input id="draft-notes-${draft.id}" type="text" value="${escapeHtml(draft.reviewer_notes)}" placeholder="Nota de revisão opcional">
      <p class="draft-card__notice" data-draft-notice hidden>Há alterações não salvas. Salve antes de aprovar ou rejeitar.</p>
      <div class="draft-card__actions">
        <button class="button button--quiet" type="button" data-action="save-draft" data-draft-id="${draft.id}" data-status="${draft.status}">Salvar</button>
        <button class="button button--secondary" type="button" data-action="approve-draft" data-draft-id="${draft.id}">Aprovar salvo</button>
        <button class="button button--quiet" type="button" data-action="reject-draft" data-draft-id="${draft.id}">Rejeitar</button>
      </div>
    </article>
  `).join("");
}

function renderDetail(company, drafts) {
  const reasons = company.score_reasons.length
    ? company.score_reasons.map((reason) => `<span class="reason">${escapeHtml(reason)}</span>`).join("")
    : "<span class=\"reason\">Sem sinais suficientes; revisar manualmente.</span>";
  const segment = segmentLabel(company.segment);
  const metadata = [
    ["CNPJ", company.cnpj || "Não informado"],
    ["CNAE", company.cnae_primary || "Não informado"],
    ["Categoria", company.business_category || "Não identificado"],
    ["Foco", focusLabel(company)],
    ["Porte", company.employee_count ? `${company.employee_count} colaboradores` : "Não informado"],
    ["Decisor", company.decision_maker || "Não informado"],
  ].map(([label, value]) => `<div><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  const [nextActionTitle, nextActionCopy] = nextAction(company);
  const socialLinks = publicProfileLinks(company)
    .map(([label, url]) => `<a class="button button--quiet" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`)
    .join("");
  const classificationSection = segment === "Outro"
    ? `<section class="detail-section"><h3>Atividade observada</h3><p>${escapeHtml(company.classification_detail || "Sem sinais públicos suficientes para identificar a atividade da empresa.")}</p></section>`
    : "";
  const automaticFocusLabel = {
    aderente: "Aderente",
    fora_do_foco: "Fora do foco",
    revisar: "Revisar",
  }[company.focus_verdict] || "Revisar";
  const focusOverrideSection = `
    <section class="detail-section">
      <h3>Aderência ao foco GREENHAT</h3>
      <p>Categoria observada: <strong>${escapeHtml(company.business_category || "Não identificado")}</strong>. Veredito atual: <strong>${escapeHtml(focusLabel(company))}</strong>.</p>
      <div class="pipeline-control">
        <label class="visually-hidden" for="focus-override">Ajustar aderência ao foco</label>
        <select id="focus-override">
          <option value="" ${!company.focus_override ? "selected" : ""}>Automático: ${escapeHtml(automaticFocusLabel)}</option>
          <option value="aderente" ${company.focus_override === "aderente" ? "selected" : ""}>Marcar como aderente</option>
          <option value="fora_do_foco" ${company.focus_override === "fora_do_foco" ? "selected" : ""}>Marcar fora do foco</option>
          <option value="revisar" ${company.focus_override === "revisar" ? "selected" : ""}>Manter para revisão</option>
        </select>
        <button class="button button--quiet" type="button" data-action="save-focus" data-company-id="${company.id}">Salvar</button>
      </div>
    </section>`;
  const fitAnalysis = company.ai_fit_summary
    ? `<div class="fit-analysis__result"><strong>Leitura salva${company.ai_fit_model ? ` · ${escapeHtml(company.ai_fit_model)}` : ""}</strong><p>${escapeHtml(company.ai_fit_summary)}</p></div>`
    : "<p class=\"company-detail-line\">Opcional. Usa apenas sinais públicos já registrados e não altera o score automaticamente.</p>";

  detailPanel.innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">${escapeHtml(segment)} · FIT ${company.fit_score}</p>
        <h2 id="detail-title">${escapeHtml(companyDisplayName(company))}</h2>
        <p>${escapeHtml(locationText(company))}</p>
      </div>
      <span class="${scoreClass(company.fit_score)}">${company.fit_score}</span>
    </div>
    <div class="score-reasons">${reasons}</div>
    <div class="next-action"><span>Próxima ação</span><strong>${escapeHtml(nextActionTitle)}</strong><p>${escapeHtml(nextActionCopy)}</p></div>
    <div class="detail-report-link"><a class="button button--primary" href="/companies/${company.id}/report" target="_blank" rel="noopener">Abrir relatório completo</a></div>
    ${socialLinks ? `<div class="detail-actions">${socialLinks}</div>` : ""}
    <section class="detail-section">
      <h3>Dados da empresa</h3>
      <div class="metadata">${metadata}</div>
      <p>${escapeHtml(company.description || "Sem descrição importada.")}</p>
    </section>
    ${classificationSection}
    ${focusOverrideSection}
    ${renderWebsiteSection(company)}
    <section class="detail-section">
      <h3>Leitura de fit com Claude</h3>
      ${fitAnalysis}
      <button class="button button--secondary" type="button" data-action="analyze-fit" data-company-id="${company.id}" ${company.website_status === "available" ? "" : "disabled"}>Interpretar fit com Claude</button>
    </section>
    <section class="detail-section">
      <h3>Pipeline</h3>
      <div class="pipeline-control">
        <label class="visually-hidden" for="pipeline-status">Status do pipeline</label>
        <select id="pipeline-status">
          ${Object.entries(statusLabels).map(([value, label]) => `<option value="${value}" ${company.pipeline_status === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
        <button class="button button--quiet" type="button" data-action="save-pipeline" data-company-id="${company.id}">Salvar</button>
      </div>
    </section>
    <section class="detail-section">
      <h3>Rascunho com Claude</h3>
      <p>O rascunho fica pendente de revisão. O RADAR não envia nada.</p>
      <form id="draft-form" class="draft-form" data-company-id="${company.id}">
        <div class="draft-options">
          <label>Canal
            <select name="channel">
              <option value="email">E-mail</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>
          <label>Idioma
            <select name="language">
              <option value="pt-BR">Português</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        <label>Objetivo
          <input name="objective" type="text" placeholder="Ex.: abrir conversa sobre reposicionamento do produto.">
        </label>
        <button class="button button--primary" type="submit">Gerar para revisão</button>
      </form>
      <div id="draft-list">${renderDrafts(drafts)}</div>
    </section>
  `;
}

async function selectCompany(companyId) {
  state.selectedCompanyId = Number(companyId);
  renderCompanies();
  detailPanel.innerHTML = "<div class=\"detail-panel__empty\" role=\"status\"><p>Carregando empresa...</p></div>";
  try {
    const payload = await api(`${API_PREFIX}/companies/${companyId}`);
    renderDetail(payload.company, payload.drafts);
    if (window.matchMedia("(max-width: 980px)").matches) {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      detailPanel.scrollIntoView({ behavior, block: "start" });
    }
    detailPanel.focus({ preventScroll: true });
  } catch (error) {
    detailPanel.innerHTML = `<div class="detail-panel__empty"><p>${escapeHtml(error.message)}</p></div>`;
    showToast(error.message, true);
  }
}

async function refreshAfterChange(companyId = state.selectedCompanyId) {
  await loadDashboard();
  if (companyId) await selectCompany(companyId);
}

async function submitImport(form) {
  const button = form.querySelector("button[type=submit]");
  const feedback = document.getElementById("import-result");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Importando...";
  feedback.textContent = "";
  feedback.className = "form-feedback";
  try {
    const payload = await api(`${API_PREFIX}/import`, { method: "POST", body: new FormData(form) });
    const errors = payload.errors.length ? ` ${payload.errors.length} erro(s) exibidos abaixo.` : "";
    feedback.textContent = `${payload.files} arquivo(s): ${payload.imported} nova(s), ${payload.consolidated} consolidada(s), ${payload.skipped} ignorada(s).${errors}`;
    feedback.classList.add("form-feedback--success");
    if (payload.errors.length) {
      feedback.textContent += ` ${payload.errors.map((item) => `${item.file ? `${item.file}, ` : ""}linha ${item.line}: ${item.message}`).join(" | ")}`;
    }
    form.reset();
    document.getElementById("import-source").value = "Filtro CNAE";
    updateCsvSelection();
    await refreshAfterChange(null);
    showToast("Importação concluída.");
  } catch (error) {
    feedback.textContent = error.message;
    feedback.classList.add("form-feedback--error");
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function submitManualCompany(form) {
  const button = form.querySelector("button[type=submit]");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Adicionando...";
  try {
    const payload = Object.fromEntries(new FormData(form));
    const result = await api(`${API_PREFIX}/companies`, { method: "POST", body: JSON.stringify(payload) });
    form.reset();
    form.closest("details").open = false;
    await refreshAfterChange(result.company.id);
    showToast(result.created ? "Empresa adicionada." : "Empresa atualizada com os novos dados.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function enrichCompany(companyId, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Analisando...";
  try {
    await api(`${API_PREFIX}/companies/${companyId}/enrich`, { method: "POST" });
    await refreshAfterChange(companyId);
    showToast("Site público analisado e score atualizado.");
  } catch (error) {
    await refreshAfterChange(companyId).catch(() => {});
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function analyzeFit(companyId, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Interpretando...";
  try {
    await api(`${API_PREFIX}/companies/${companyId}/fit-analysis`, { method: "POST" });
    await refreshAfterChange(companyId);
    showToast("Leitura de fit criada para revisão.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function deleteCompany(companyId, companyName, button) {
  const confirmation = `Remover ${companyName} da fila? Isso também apaga rascunhos desta empresa e não pode ser desfeito.`;
  if (!window.confirm(confirmation)) return;

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Removendo...";
  try {
    await api(`${API_PREFIX}/companies/${companyId}`, { method: "DELETE" });
    state.selectedCompanyId = null;
    detailPanel.innerHTML = "<div class=\"detail-panel__empty\"><p class=\"eyebrow\">DETALHE</p><h2 id=\"detail-title\">Lead removido</h2><p>A fila foi atualizada. Selecione outra empresa para continuar.</p></div>";
    await loadDashboard();
    detailPanel.focus({ preventScroll: true });
    showToast("Lead removido da fila.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function saveFocus(companyId, button) {
  const focusOverride = document.getElementById("focus-override").value;
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Salvando...";
  try {
    await api(`${API_PREFIX}/companies/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify({ focus_override: focusOverride }),
    });
    await refreshAfterChange(companyId);
    showToast("Aderência ao foco atualizada.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function isActiveReviewJob(job) {
  return job && ["queued", "running", "cancel_requested"].includes(job.status);
}

function renderReviewJob(job) {
  const feedback = document.getElementById("batch-review-result");
  const startButton = document.getElementById("start-review-job");
  const cancelButton = document.getElementById("cancel-review-job");
  const limitInput = document.getElementById("batch-limit");
  const active = isActiveReviewJob(job);
  startButton.disabled = active;
  limitInput.disabled = active;
  cancelButton.hidden = !active;
  cancelButton.disabled = job?.status === "cancel_requested";
  cancelButton.dataset.jobId = job?.id || "";
  if (!job) return;

  feedback.className = "helper-text";
  if (job.status === "queued") {
    feedback.textContent = `Análise ${job.id} aguardando início: 0 de ${job.requested_count} sites.`;
  } else if (job.status === "running") {
    feedback.textContent = `Análise ${job.id} em andamento: ${job.processed_count} de ${job.requested_count} sites. ${job.analyzed_count} analisado(s), ${job.unavailable_count} indisponível(is), ${job.remaining_count} pendente(s) na fila.`;
  } else if (job.status === "cancel_requested") {
    feedback.textContent = `Parada solicitada para análise ${job.id}. O site atual termina antes de interromper.`;
  } else if (job.status === "completed") {
    feedback.textContent = `Análise ${job.id} concluída: ${job.processed_count} site(s), ${job.analyzed_count} analisado(s), ${job.unavailable_count} indisponível(is). ${job.remaining_count} ainda aguardam revisão.`;
    feedback.classList.add("form-feedback--success");
  } else if (job.status === "cancelled") {
    feedback.textContent = `Análise ${job.id} interrompida após ${job.processed_count} site(s). ${job.remaining_count} continuam pendentes.`;
  } else {
    feedback.textContent = `Análise ${job.id} parou antes do fim. ${job.remaining_count} sites continuam pendentes.`;
    feedback.classList.add("form-feedback--error");
  }
  if (job.errors?.length) {
    feedback.textContent += ` ${job.errors.slice(0, 3).map((item) => `${item.company || "Sistema"}: ${item.message}`).join(" | ")}`;
  }
}

function stopReviewJobPolling() {
  window.clearTimeout(state.reviewJobTimer);
  state.reviewJobTimer = null;
}

async function pollReviewJob(jobId) {
  stopReviewJobPolling();
  try {
    const payload = await api(`/api/review-jobs/${jobId}`);
    renderReviewJob(payload.job);
    if (isActiveReviewJob(payload.job)) {
      state.reviewJobTimer = window.setTimeout(() => pollReviewJob(jobId), 1400);
      return;
    }
    await refreshAfterChange(state.selectedCompanyId);
    showToast(payload.job.status === "completed" ? "Análise em lote concluída." : "Análise em lote encerrada.");
  } catch (error) {
    document.getElementById("batch-review-result").textContent = error.message;
    document.getElementById("batch-review-result").className = "helper-text form-feedback--error";
  }
}

async function reviewBatch() {
  const feedback = document.getElementById("batch-review-result");
  const limitInput = document.getElementById("batch-limit");
  if (!limitInput.reportValidity()) return;
  const limit = Number(limitInput.value);
  feedback.textContent = "Criando análise em segundo plano...";
  feedback.className = "helper-text";
  try {
    const payload = await api("/api/review-jobs", { method: "POST", body: JSON.stringify({ limit }) });
    renderReviewJob(payload.job);
    showToast(`Análise de até ${payload.job.requested_count} sites iniciada.`);
    if (isActiveReviewJob(payload.job)) pollReviewJob(payload.job.id);
    else await refreshAfterChange(state.selectedCompanyId);
  } catch (error) {
    feedback.textContent = error.message;
    feedback.classList.add("form-feedback--error");
    showToast(error.message, true);
  }
}

async function cancelReviewJob(button) {
  const jobId = button.dataset.jobId;
  if (!jobId) return;
  button.disabled = true;
  try {
    const payload = await api(`/api/review-jobs/${jobId}/cancel`, { method: "POST" });
    renderReviewJob(payload.job);
    if (isActiveReviewJob(payload.job)) pollReviewJob(payload.job.id);
  } catch (error) {
    showToast(error.message, true);
    button.disabled = false;
  }
}

async function resumeActiveReviewJob() {
  const payload = await api("/api/review-jobs/active");
  if (!payload.job) return;
  renderReviewJob(payload.job);
  pollReviewJob(payload.job.id);
}

async function savePipeline(companyId, button) {
  const status = document.getElementById("pipeline-status").value;
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Salvando...";
  try {
    await api(`${API_PREFIX}/companies/${companyId}`, { method: "PATCH", body: JSON.stringify({ pipeline_status: status }) });
    await refreshAfterChange(companyId);
    showToast("Pipeline atualizado.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function generateDraft(form) {
  const companyId = form.dataset.companyId;
  const button = form.querySelector("button[type=submit]");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Gerando...";
  try {
    const payload = Object.fromEntries(new FormData(form));
    await api(`${API_PREFIX}/companies/${companyId}/drafts`, { method: "POST", body: JSON.stringify(payload) });
    await selectCompany(companyId);
    showToast("Rascunho criado e pendente de revisão.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function updateDraft(draftId, status, button) {
  const content = document.getElementById(`draft-content-${draftId}`).value;
  const reviewerNotes = document.getElementById(`draft-notes-${draftId}`).value;
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Salvando...";
  try {
    await api(`/api/drafts/${draftId}`, {
      method: "PATCH",
      body: JSON.stringify({ content, reviewer_notes: reviewerNotes, status }),
    });
    await selectCompany(state.selectedCompanyId);
    showToast(status === "approved" ? "Rascunho aprovado. Revise antes de enviar." : "Rascunho salvo.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function setDraftStatus(draftId, status, button) {
  const card = button.closest(".draft-card");
  if (card.classList.contains("draft-card--dirty")) {
    card.querySelector("[data-draft-notice]").hidden = false;
    showToast("Salve as alterações antes de mudar o status do rascunho.", true);
    return;
  }
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = status === "approved" ? "Aprovando..." : "Rejeitando...";
  try {
    await api(`/api/drafts/${draftId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await selectCompany(state.selectedCompanyId);
    showToast(status === "approved" ? "Rascunho aprovado. Nenhuma mensagem foi enviada." : "Rascunho rejeitado.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function markDraftDirty(target) {
  const card = target.closest(".draft-card");
  if (!card) return;
  card.classList.add("draft-card--dirty");
  card.querySelector("[data-draft-notice]").hidden = false;
}

function clearFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("segment-filter").value = "";
  document.getElementById("focus-filter").value = "";
  document.getElementById("state-filter").value = "";
  document.getElementById("status-filter").value = "";
  loadCompanies().catch((error) => showToast(error.message, true));
}

function updateCsvSelection() {
  const files = document.getElementById("csv-file").files;
  const selection = document.getElementById("csv-selection");
  if (!files.length) {
    selection.textContent = "Selecione um ou mais CSVs. O RADAR consolida duplicatas por CNPJ, site, empresa ou e-mail.";
    return;
  }
  selection.textContent = `${files.length} arquivo${files.length === 1 ? "" : "s"} selecionado${files.length === 1 ? "" : "s"}. Duplicatas serão consolidadas na mesma fila.`;
}

document.getElementById("import-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitImport(event.currentTarget);
});

document.getElementById("csv-file").addEventListener("change", updateCsvSelection);

document.getElementById("manual-company-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitManualCompany(event.currentTarget);
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "draft-form") {
    event.preventDefault();
    generateDraft(event.target);
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "select-company") selectCompany(button.dataset.companyId);
  if (action === "focus-import") {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById("import-panel").scrollIntoView({ behavior, block: "start" });
    document.getElementById("csv-file").focus({ preventScroll: true });
  }
  if (action === "reload-companies") loadCompanies().catch((error) => showToast(error.message, true));
  if (action === "clear-filters") clearFilters();
  if (action === "enrich-company") enrichCompany(button.dataset.companyId, button);
  if (action === "analyze-fit") analyzeFit(button.dataset.companyId, button);
  if (action === "delete-company") deleteCompany(button.dataset.companyId, button.dataset.companyName, button);
  if (action === "save-focus") saveFocus(button.dataset.companyId, button);
  if (action === "start-review-job") reviewBatch();
  if (action === "cancel-review-job") cancelReviewJob(button);
  if (action === "save-pipeline") savePipeline(button.dataset.companyId, button);
  if (action === "save-draft") updateDraft(button.dataset.draftId, button.dataset.status, button);
  if (action === "approve-draft") setDraftStatus(button.dataset.draftId, "approved", button);
  if (action === "reject-draft") setDraftStatus(button.dataset.draftId, "rejected", button);
  if (action === "enrich-ai") enrichCompanyAI(button.dataset.companyId, button);
  if (action === "start-enrich-batch") startEnrichBatch();
  if (action === "export") exportCSV();
});

// Buscar empresas por e-mail no cadastro
async function searchByEmail() {
  const search = document.getElementById("search-input").value.trim();
  if (!search) return;
  const url = new URL(window.location.origin + `${API_PREFIX}/companies`);
  url.searchParams.set("q", search);
  const resp = await fetch(url);
  const data = await resp.json();
  console.log("Resultados:", data);
}

async function startEnrichBatch() {
  const limitInput = document.getElementById("enrich-limit");
  const limit = parseInt(limitInput.value, 10) || 50;
  const resultEl = document.getElementById("enrich-batch-result");
  const button = document.getElementById("start-enrich-batch");

  button.disabled = true;
  resultEl.textContent = "Iniciando enriquecimento com Claude...";

  try {
    const resp = await fetch("/api/enrich-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      resultEl.textContent = data.error || "Erro ao iniciar enriquecimento.";
      resultEl.className = "helper-text form-feedback--error";
      return;
    }
    resultEl.textContent = `Enriquecimento iniciado: ${data.requested} empresas de ${data.pending} pendentes. Roda em segundo plano.`;
    resultEl.className = "helper-text form-feedback--success";
    showToast(`Enriquecimento com Claude iniciado (${data.requested} empresas).`);

    // Poll status every 10s
    const pollInterval = setInterval(async () => {
      try {
        const statusResp = await fetch("/api/enrich-batch/status");
        const statusData = await statusResp.json();
        if (statusData.pending === 0) {
          resultEl.textContent = `Enriquecimento completo. ${statusData.already_enriched} empresas enriquecidas.`;
          clearInterval(pollInterval);
          button.disabled = false;
          loadCompanies();
          loadSegments();
        } else {
          resultEl.textContent = `Em andamento: ${statusData.already_enriched} enriquecidas, ${statusData.pending} restantes...`;
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 10000);

    // Disable button for 30s then re-enable (if still polling)
    setTimeout(() => { button.disabled = false; }, 30000);
  } catch (error) {
    resultEl.textContent = error.message;
    resultEl.className = "helper-text form-feedback--error";
  } finally {
    setTimeout(() => { button.disabled = false; }, 5000);
  }
}

async function exportCSV() {
  const minScore = prompt("Score mínimo para exportar (0-100):", "70");
  if (minScore === null) return;
  const score = parseInt(minScore, 10);
  if (isNaN(score) || score < 0) {
    showToast("Score inválido.", true);
    return;
  }

  const state = document.getElementById("state-filter").value;
  const segment = document.getElementById("segment-filter").value;

  const params = new URLSearchParams();
  params.set("min_score", String(score));
  if (state) params.set("state", state);
  if (segment) params.set("segment", segment);

  const url = `/api/export?${params.toString()}`;
  showToast("Exportando leads qualificados...");
  window.location.href = url;
}

async function enrichCompanyAI(companyId, button) {
  if (button) button.disabled = true;
  try {
    const resp = await fetch(`${API_PREFIX}/companies/${companyId}/enrich-ai`, { method: "POST" });
    const data = await resp.json();
    if (!resp.ok) {
      showToast(data.error || "Erro ao enriquecer com IA.", true);
      return;
    }
    showToast("Enriquecido com IA (stack, líderes, ângulo).");
    state.selectedCompanyId = companyId;
    await loadCompanies();
    selectCompany(companyId);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    if (button) button.disabled = false;
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select")) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("search-input").focus();
  }
  if (event.key.toLowerCase() === "n" && state.selectedCompanyId !== null) {
    event.preventDefault();
    const idx = state.companies.findIndex((c) => c.id === state.selectedCompanyId);
    if (idx >= 0 && idx < state.companies.length - 1) {
      selectCompany(state.companies[idx + 1].id);
    }
  }
  if (event.key.toLowerCase() === "p" && state.selectedCompanyId !== null) {
    event.preventDefault();
    const company = state.companies.find((c) => c.id === state.selectedCompanyId);
    if (company && typeof window.openDraftForm === "function") {
      // assume draft form exists
    }
  }
});

document.getElementById("clear-filters").addEventListener("click", clearFilters);

document.getElementById("search-input").addEventListener("input", () => {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => {
    loadCompanies().catch((error) => showToast(error.message, true));
  }, 220);
});

for (const fieldId of ["segment-filter", "focus-filter", "state-filter", "status-filter"]) {
  document.getElementById(fieldId).addEventListener("change", () => {
    loadCompanies().catch((error) => showToast(error.message, true));
  });
}

document.getElementById("sort-filter").addEventListener("change", renderCompanies);

document.addEventListener("input", (event) => {
  if (event.target.matches(".draft-card textarea, .draft-card input")) markDraftDirty(event.target);
});

loadDashboard().catch((error) => showToast(error.message, true));
resumeActiveReviewJob().catch((error) => showToast(error.message, true));
