// Template 3: Imagem placeholder gigante, texto cursivo e espaçamento caótico
export function template3({ nome, email }) {
  return {
    subject: `~ ${nome}, você é especial ✨ ~`,
    html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0; padding:40px; background:linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb); font-family:'Brush Script MT', cursive;">
      <div style="max-width:650px; margin:0 auto; background:#fff8dc; padding:50px; border:15px ridge #8b4513; box-shadow:10px 10px 0 #000;">
        <div align="center" style="margin-bottom:30px;">
          <div style="width:200px; height:200px; background:repeating-linear-gradient(45deg, #ff0000, #ffff00 10px, #00ff00 10px, #00ffff 20px); border-radius:50%; border:8px solid #ff00ff; display:inline-block; line-height:200px; font-size:80px;">
            🎁
          </div>
        </div>
        <h1 style="text-align:center; font-size:60px; color:#ff1493; margin:10px 0; letter-spacing:8px;">
          ~ Olá ${nome} ~
        </h1>
        <h2 style="text-align:center; font-size:32px; color:#8b008b; font-weight:normal; margin:5px 0 40px 0;">
          ✨ Você é especial ✨
        </h2>
        <p style="font-size:26px; color:#4b0082; text-indent:60px; line-height:2.5;">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p style="font-size:28px; color:#006400; text-align:center; letter-spacing:15px; word-spacing:30px;">
          ★ ★ ★ ★ ★
        </p>
        <p style="font-size:24px; color:#dc143c; text-align:justify; line-height:1.8;">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <hr style="border:none; border-top:5px dotted #ff00ff; margin:40px 0;">
        <div align="center">
          <a href="#" style="display:inline-block; background:#ff1493; color:#fff; padding:25px 60px; font-size:32px; font-family:Arial; text-decoration:none; border-radius:50px; box-shadow:8px 8px 0 #8b008b; text-transform:uppercase;">
            ★ Saiba Mais ★
          </a>
        </div>
        <p style="font-size:14px; color:#999; text-align:center; margin-top:50px; font-family:monospace;">
          Esta mensagem foi enviada para ${email}.<br>
          Por favor, não responda este e-mail.<br>
          © Copyright 2026 — Todos os direitos reservados (inclusive os que não são nossos)
        </p>
      </div>
    </body>
    </html>
  `,
  };
}