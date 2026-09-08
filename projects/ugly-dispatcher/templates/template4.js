// Template 4: Layout estilo "newsletter do Word" — espaçamentos absurdos, alinhamentos misturados
export function template4({ nome, email }) {
  return {
    subject: `Newsletter™ — Edição Especial para ${nome}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0; padding:0; font-family:Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding:50px 0;">
            <table width="700" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
              <!-- Header gigante e desproporcional -->
              <tr>
                <td align="center" style="background:#1e90ff; color:#ffffff; padding:80px 20px; border-bottom:10px dashed #ff4500;">
                  <h1 style="font-size:72px; margin:0; font-weight:900; letter-spacing:-2px;">
                    Newsletter™
                  </h1>
                  <p style="font-size:14px; margin:20px 0 0 0; letter-spacing:20px;">
                    E D I Ç Ã O   E S P E C I A L
                  </p>
                </td>
              </tr>
              <!-- Breadcrumb sem propósito -->
              <tr>
                <td style="background:#f0f0f0; padding:15px 40px; font-size:11px; color:#666; border-bottom:2px solid #ccc;">
                  Início &gt; Novidades &gt; <b>Promoções</b> &gt; Edição Especial &gt; Você está aqui
                </td>
              </tr>
              <!-- Hero com texto gigante -->
              <tr>
                <td style="padding:60px 60px 20px 60px;">
                  <h2 style="font-size:42px; color:#1e90ff; margin:0 0 30px 0; line-height:1.1;">
                    ${nome}, temos novidades INCRÍVEIS para você!
                  </h2>
                  <p style="font-size:18px; color:#333; line-height:2.0; margin:0 0 20px 0;">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
                    habitant morbi tristique senectus et netus et malesuada fames ac turpis
                    egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor
                    sit amet, ante.
                  </p>
                </td>
              </tr>
              <!-- Três colunas mal alinhadas -->
              <tr>
                <td style="padding:20px 60px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="33%" valign="top" align="left" style="padding:15px; background:#fffacd; border:2px solid #ff4500;">
                        <h3 style="font-size:20px; color:#ff4500; margin:0 0 10px 0;">📦 Produto A</h3>
                        <p style="font-size:13px; line-height:1.6; margin:0;">
                          Descrição pequena demais pra ler com pressa.
                        </p>
                      </td>
                      <td width="2%">&nbsp;</td>
                      <td width="33%" valign="middle" align="center" style="padding:15px; background:#e0ffff; border:2px dashed #1e90ff;">
                        <h3 style="font-size:20px; color:#1e90ff; margin:0 0 10px 0;">🎯 Produto B</h3>
                        <p style="font-size:13px; line-height:1.6; margin:0;">
                          Centralizado e desalinhado do resto.
                        </p>
                      </td>
                      <td width="2%">&nbsp;</td>
                      <td width="33%" valign="bottom" align="right" style="padding:15px; background:#ffe4e1; border:2px dotted #228b22;">
                        <h3 style="font-size:20px; color:#228b22; margin:0 0 10px 0;">⭐ Produto C</h3>
                        <p style="font-size:13px; line-height:1.6; margin:0;">
                          Alinhado à direita. Por quê? Ninguém sabe.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- CTA isolado -->
              <tr>
                <td align="center" style="padding:50px 60px;">
                  <a href="#" style="background:#ff4500; color:#fff; padding:20px 50px; text-decoration:none; font-size:22px; font-weight:bold; display:inline-block; border-radius:4px;">
                    CLIQUE AQUI →
                  </a>
                  <p style="font-size:12px; color:#999; margin-top:20px;">
                    *Sujeito a termos e condições que ninguém lê.
                  </p>
                </td>
              </tr>
              <!-- Footer com info demais -->
              <tr>
                <td style="background:#222; color:#999; padding:40px; font-size:11px; line-height:2.0;">
                  <table width="100%">
                    <tr>
                      <td width="50%" valign="top">
                        <b style="color:#fff;">Nossa Empresa Ltda.</b><br>
                        Rua das Flores, 123 — Sala 404<br>
                        São Paulo / SP — 01234-567<br>
                        CNPJ: 00.000.000/0001-00
                      </td>
                      <td width="50%" valign="top" align="right">
                        <a href="#" style="color:#1e90ff;">Cancelar inscrição</a> |
                        <a href="#" style="color:#1e90ff;">Política de privacidade</a> |
                        <a href="#" style="color:#1e90ff;">Contato</a><br><br>
                        Enviado para: <b>${email}</b>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
  };
}