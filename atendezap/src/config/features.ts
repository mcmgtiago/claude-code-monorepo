// Flags de funcionalidade do VeloHUB.
// Mude aqui para ligar/desligar áreas inteiras do produto sem mexer no resto do código.

/**
 * Modelo de cobrança (trial, planos, checkout, paywall, suspensão por inadimplência).
 *
 * Enquanto `false`:
 *  - nenhum cliente é bloqueado por trial expirado ou conta suspensa;
 *  - o banner de trial e a tela de checkout não aparecem;
 *  - criar empresa no painel admin não exige plano.
 *
 * Quando o produto for monetizado, basta voltar para `true`.
 */
export const BILLING_ENABLED = false;
