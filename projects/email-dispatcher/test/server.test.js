const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findEmailColumn,
  isValidEmail,
  makeEmailHtml,
  parseCsv,
  replacePlaceholders
} = require("../server");

test("lê CSV com vírgula, ponto e vírgula e campos entre aspas", () => {
  assert.deepEqual(parseCsv('email;observação\n"ana@empresa.com";"texto, com vírgula"'), [
    ["email", "observação"],
    ["ana@empresa.com", "texto, com vírgula"]
  ]);
});

test("encontra cabeçalhos de e-mail em português", () => {
  assert.equal(findEmailColumn(["Empresa", "Endereço de e-mail"]), 1);
  assert.equal(findEmailColumn(["Contato", "site"]), -1);
});

test("valida endereços de e-mail básicos", () => {
  assert.equal(isValidEmail("contato@empresa.com"), true);
  assert.equal(isValidEmail("contato sem arroba"), false);
});

test("substitui variáveis e protege conteúdo no HTML do e-mail", () => {
  const settings = { senderName: "Ana", companyName: "Acme" };
  const contact = { email: "contato@empresa.com" };
  const template = {
    preview: "Olá {{email}}",
    body: "Olá {{remetente}}\n\n<script>alert(1)</script>"
  };

  assert.equal(replacePlaceholders("De: {{remetente}}", settings, contact), "De: Ana");
  assert.match(makeEmailHtml(template, settings, contact), /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
