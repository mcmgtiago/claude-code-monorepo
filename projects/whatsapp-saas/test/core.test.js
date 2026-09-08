const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { isAllowedHost, isAllowedOrigin, trustedHost } = require("../src/server");
const { createStore } = require("../src/store");
const { normalizePhone, validateContact, validateTemplate } = require("../src/validation");
const { buildTemplatePayload } = require("../src/whatsapp");

test("normaliza telefone E.164 e exige opt-in", () => {
  assert.equal(normalizePhone("+55 (11) 99999-9999"), "+5511999999999");
  assert.throws(() => validateContact({ name: "Ana", phone: "+5511999999999", optedIn: false }), /consentimento explícito/);
});

test("permite limpar um modelo inativo, mas exige nome para ativá-lo", () => {
  assert.deepEqual(
    validateTemplate({ name: "", language: "pt_BR", description: "", enabled: false, useContactName: false }),
    { name: "", language: "pt_BR", description: "", enabled: false, useContactName: false }
  );
  assert.throws(
    () => validateTemplate({ name: "", language: "pt_BR", description: "", enabled: true, useContactName: false }),
    /nome do modelo/i
  );
});

test("monta payload oficial com o primeiro parâmetro de nome quando solicitado", () => {
  assert.deepEqual(
    buildTemplatePayload(
      { name: "Ana", phone: "+5511999999999" },
      { name: "boas_vindas", language: "pt_BR", useContactName: true }
    ),
    {
      messaging_product: "whatsapp",
      to: "5511999999999",
      type: "template",
      template: {
        name: "boas_vindas",
        language: { code: "pt_BR" },
        components: [{ type: "body", parameters: [{ type: "text", text: "Ana" }] }]
      }
    }
  );
});

test("preserva a supressão após descadastro", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "whatsapp-outreach-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));

  const store = createStore(path.join(directory, "store.json"));
  await store.initialize();
  const contact = await store.addContact({ name: "Ana", phone: "+5511999999999", optedIn: true });
  await store.optOutContact(contact.id);
  await assert.rejects(
    store.addContact({ name: "Ana", phone: "+5511999999999", optedIn: true }),
    /lista de supressão/
  );
});

test("cria uma campanha apenas com contatos consentidos e modelos ativos", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "whatsapp-outreach-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));

  const store = createStore(path.join(directory, "store.json"));
  await store.initialize();
  const contact = await store.addContact({ name: "Ana", phone: "+5511999999999", optedIn: true });
  await store.updateTemplate("modelo-1", {
    name: "boas_vindas",
    language: "pt_BR",
    description: "Contato inicial",
    enabled: true,
    useContactName: true
  });
  const campaign = await store.createCampaign({
    contactIds: [contact.id],
    templateIds: ["modelo-1"],
    delaySeconds: 15
  });

  assert.equal(campaign.jobs.length, 1);
  assert.equal(campaign.jobs[0].status, "pending");
  await store.optOutContact(contact.id);
  await assert.rejects(
    store.createCampaign({ contactIds: [contact.id], templateIds: ["modelo-1"], delaySeconds: 15 }),
    /opt-in ativo/
  );
});

test("aceita somente host local e origem local para mutações", () => {
  assert.equal(isAllowedHost({ headers: { host: trustedHost() } }), true);
  assert.equal(isAllowedHost({ headers: { host: "example.com" } }), false);
  assert.equal(isAllowedOrigin({ headers: { origin: `http://${trustedHost()}` } }), true);
  assert.equal(isAllowedOrigin({ headers: { origin: "https://example.com" } }), false);
  assert.equal(trustedHost(80), "127.0.0.1");
});
