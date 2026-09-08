const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

class StoreError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "StoreError";
    this.status = status;
  }
}

const TEMPLATE_SLOTS = [
  ["modelo-1", "Apresentação"],
  ["modelo-2", "Diagnóstico"],
  ["modelo-3", "Proposta de valor"],
  ["modelo-4", "Convite"],
  ["modelo-5", "Retomada"]
];

function now() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultTemplates() {
  return TEMPLATE_SLOTS.map(([id, label]) => ({
    id,
    label,
    name: "",
    language: "pt_BR",
    description: "",
    enabled: false,
    useContactName: false,
    updatedAt: now()
  }));
}

function defaultData() {
  return {
    schemaVersion: 1,
    contacts: [],
    suppressions: [],
    templates: defaultTemplates(),
    campaigns: []
  };
}

function normalizeData(data) {
  const normalized = data && typeof data === "object" ? data : defaultData();
  normalized.schemaVersion = 1;
  normalized.contacts = Array.isArray(normalized.contacts) ? normalized.contacts : [];
  normalized.suppressions = Array.isArray(normalized.suppressions) ? normalized.suppressions : [];
  normalized.templates = Array.isArray(normalized.templates) ? normalized.templates : [];
  normalized.campaigns = Array.isArray(normalized.campaigns) ? normalized.campaigns : [];

  const suppressionsByPhone = new Map(
    normalized.suppressions
      .filter((item) => item && typeof item.phone === "string")
      .map((item) => [item.phone, item])
  );
  for (const contact of normalized.contacts) {
    if (contact?.optedIn === false && typeof contact.phone === "string" && !suppressionsByPhone.has(contact.phone)) {
      suppressionsByPhone.set(contact.phone, { phone: contact.phone, optedOutAt: contact.optedOutAt || now() });
    }
  }
  normalized.suppressions = [...suppressionsByPhone.values()];

  const currentTemplates = new Map(normalized.templates.map((template) => [template.id, template]));
  normalized.templates = defaultTemplates().map((slot) => {
    const saved = currentTemplates.get(slot.id);
    return saved
      ? {
          ...slot,
          ...saved,
          id: slot.id,
          label: slot.label,
          enabled: saved.enabled === true,
          useContactName: saved.useContactName === true
        }
      : slot;
  });

  return normalized;
}

function createStore(filePath) {
  let queue = Promise.resolve();

  async function readFile() {
    try {
      return normalizeData(JSON.parse(await fs.readFile(filePath, "utf8")));
    } catch (error) {
      if (error.code === "ENOENT") return defaultData();
      throw error;
    }
  }

  async function writeFile(data) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  function mutate(mutator) {
    const operation = queue.then(async () => {
      const data = await readFile();
      const result = await mutator(data);
      await writeFile(data);
      return clone(result);
    });
    queue = operation.catch(() => undefined);
    return operation;
  }

  async function read() {
    await queue;
    return clone(await readFile());
  }

  async function initialize() {
    await mutate((data) => {
      for (const campaign of data.campaigns) {
        if (campaign.status === "queued" || campaign.status === "running" || campaign.status === "cancelling") {
          campaign.status = "interrupted";
          campaign.completedAt = now();
          for (const job of campaign.jobs || []) {
            if (job.status === "processing") job.status = "unknown";
          }
        }
      }
      return { ok: true };
    });
  }

  async function getData() {
    const data = await read();
    return {
      contacts: data.contacts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      templates: data.templates,
      campaigns: data.campaigns.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    };
  }

  async function getContact(id) {
    const data = await read();
    return data.contacts.find((contact) => contact.id === id) || null;
  }

  async function addContact(input) {
    return mutate((data) => {
      if (data.suppressions.some((suppression) => suppression.phone === input.phone)) {
        throw new StoreError("Este telefone está na lista de supressão após um descadastro anterior.");
      }
      if (data.contacts.some((contact) => contact.phone === input.phone)) {
        throw new StoreError("Este telefone já está cadastrado.");
      }

      const contact = {
        id: randomUUID(),
        ...input,
        optedInAt: now(),
        createdAt: now(),
        updatedAt: now()
      };
      data.contacts.push(contact);
      return contact;
    });
  }

  async function optOutContact(id) {
    return mutate((data) => {
      const contact = data.contacts.find((item) => item.id === id);
      if (!contact) throw new StoreError("Contato não encontrado.", 404);
      contact.optedIn = false;
      contact.optedOutAt = now();
      contact.updatedAt = now();
      if (!data.suppressions.some((suppression) => suppression.phone === contact.phone)) {
        data.suppressions.push({ phone: contact.phone, optedOutAt: contact.optedOutAt });
      }
      return contact;
    });
  }

  async function updateTemplate(id, input) {
    return mutate((data) => {
      const template = data.templates.find((item) => item.id === id);
      if (!template) throw new StoreError("Modelo não encontrado.", 404);
      Object.assign(template, input, { updatedAt: now() });
      return template;
    });
  }

  async function createCampaign(input) {
    return mutate((data) => {
      const contacts = input.contactIds.map((id) => data.contacts.find((contact) => contact.id === id));
      const templates = input.templateIds.map((id) => data.templates.find((template) => template.id === id));

      if (contacts.some((contact) => !contact)) throw new StoreError("Um ou mais contatos não foram encontrados.", 404);
      if (templates.some((template) => !template)) throw new StoreError("Um ou mais modelos não foram encontrados.", 404);
      if (contacts.some((contact) => !contact.optedIn)) {
        throw new StoreError("Todos os destinatários precisam ter opt-in ativo.");
      }
      if (templates.some((template) => !template.enabled)) {
        throw new StoreError("Ative e configure todos os modelos selecionados antes de enviar.");
      }

      const createdAt = now();
      const jobs = contacts.flatMap((contact) =>
        templates.map((template) => ({
          id: randomUUID(),
          contactId: contact.id,
          contactName: contact.name,
          phone: contact.phone,
          templateId: template.id,
          template: {
            name: template.name,
            language: template.language,
            useContactName: template.useContactName
          },
          templateLabel: template.label,
          status: "pending",
          createdAt
        }))
      );

      const campaign = {
        id: randomUUID(),
        status: "queued",
        cancelRequested: false,
        delaySeconds: input.delaySeconds,
        createdAt,
        startedAt: null,
        completedAt: null,
        jobs
      };
      data.campaigns.push(campaign);
      return campaign;
    });
  }

  async function getCampaign(id) {
    const data = await read();
    return data.campaigns.find((campaign) => campaign.id === id) || null;
  }

  async function updateCampaign(id, update) {
    return mutate((data) => {
      const campaign = data.campaigns.find((item) => item.id === id);
      if (!campaign) throw new StoreError("Campanha não encontrada.", 404);
      const result = update(campaign);
      return result === undefined ? campaign : result;
    });
  }

  async function requestCancellation(id) {
    return updateCampaign(id, (campaign) => {
      campaign.cancelRequested = true;
      if (campaign.status === "queued") {
        campaign.status = "cancelled";
        campaign.completedAt = now();
        for (const job of campaign.jobs) {
          if (job.status === "pending") job.status = "cancelled";
        }
      } else if (campaign.status === "running") {
        campaign.status = "cancelling";
      }
      return campaign;
    });
  }

  return {
    addContact,
    createCampaign,
    getCampaign,
    getContact,
    getData,
    initialize,
    optOutContact,
    requestCancellation,
    updateCampaign,
    updateTemplate
  };
}

module.exports = { StoreError, createStore };
