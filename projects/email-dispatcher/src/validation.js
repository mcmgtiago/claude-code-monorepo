class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function text(value, field, { min = 1, max = 200 } = {}) {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} é obrigatório.`);
  }

  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new ValidationError(`${field} deve ter entre ${min} e ${max} caracteres.`);
  }
  return normalized;
}

function normalizePhone(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/[\s().-]/g, "");

  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    throw new ValidationError("Use o telefone no formato internacional E.164, por exemplo +5511999999999.");
  }
  return normalized;
}

function validateContact(input) {
  if (input.optedIn !== true) {
    throw new ValidationError("Só é permitido cadastrar contatos com consentimento explícito.");
  }

  return {
    name: text(input.name, "Nome", { max: 120 }),
    phone: normalizePhone(input.phone),
    optedIn: true
  };
}

function validateTemplate(input) {
  if (typeof input.name !== "string") {
    throw new ValidationError("Nome do modelo é obrigatório.");
  }
  const name = input.name.trim();
  if (name.length > 512) {
    throw new ValidationError("Nome do modelo deve ter no máximo 512 caracteres.");
  }
  if (name && !/^[a-z0-9_]+$/.test(name)) {
    throw new ValidationError("O nome do modelo deve usar apenas letras minúsculas, números e sublinhados.");
  }

  const language = text(input.language, "Idioma", { max: 12 });
  if (!/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(language)) {
    throw new ValidationError("Use um idioma como pt_BR ou en_US.");
  }

  if (typeof input.enabled !== "boolean" || typeof input.useContactName !== "boolean") {
    throw new ValidationError("Os campos de configuração do modelo são inválidos.");
  }
  if (input.enabled && !name) {
    throw new ValidationError("Informe o nome do modelo antes de ativá-lo.");
  }

  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (description.length > 280) {
    throw new ValidationError("A descrição pode ter no máximo 280 caracteres.");
  }

  return { name, language, description, enabled: input.enabled, useContactName: input.useContactName };
}

function uniqueIds(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError(`Selecione pelo menos um ${field}.`);
  }

  const ids = [...new Set(value)];
  if (!ids.every((id) => typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id))) {
    throw new ValidationError(`A seleção de ${field} é inválida.`);
  }
  return ids;
}

function validateCampaign(input, defaultDelaySeconds) {
  const requestedDelay = Number.parseInt(input.delaySeconds, 10);
  const delaySeconds = Number.isInteger(requestedDelay) ? requestedDelay : defaultDelaySeconds;
  if (delaySeconds < 5 || delaySeconds > 3600) {
    throw new ValidationError("O intervalo deve ficar entre 5 e 3600 segundos.");
  }

  return {
    contactIds: uniqueIds(input.contactIds, "contato"),
    templateIds: uniqueIds(input.templateIds, "modelo"),
    delaySeconds
  };
}

module.exports = {
  ValidationError,
  normalizePhone,
  validateCampaign,
  validateContact,
  validateTemplate
};
