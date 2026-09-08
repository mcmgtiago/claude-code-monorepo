# PILAR Recursos Humanos

> Pessoas certas. Relações que permanecem.

Site institucional completo, responsivo, acessível e pronto para produção para a PILAR Recursos Humanos.

## 🎯 Características

- **React 18** com TypeScript estrito
- **Tailwind CSS v4** para estilização
- **Vite** para build otimizado
- **Motion** para animações suaves
- **React Router** para navegação SPA
- **Supabase** para backend funcional
- **React Hook Form** + **Zod** para formulários validados
- **Responsivo** de 320px até 1920px
- **Acessível** (A11y, WCAG 2.1 AA)
- **Performance** otimizada (code splitting, lazy loading)

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Setup

```bash
# 1. Clonar repositório
git clone https://github.com/seu-org/pilar-rh.git
cd pilar-rh

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

O site estará disponível em `http://localhost:5173`

## 📋 Configuração

### Supabase

1. Criar projeto no [Supabase](https://supabase.com)
2. Copiar URL e chave anon
3. Adicionar ao `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Executar migrações:

```bash
cd supabase/migrations
# Importar via console Supabase ou rodas manualmente
```

### Mídia

O projeto aceita imagens e vídeos de múltiplas fontes:

```bash
# Gerar dados de mídia
npm run media:fetch
```

## 📦 Build e Deploy

### Desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
npm run preview
```

### Deploy em Vercel

```bash
npx vercel deploy
```

### Deploy em VPS

```bash
# Build
npm run build

# Copiar dist/ para servidor
scp -r dist/* user@server:/var/www/pilar-rh
```

## 🎨 Personalização

### Cores

Editar `src/index.css` (seção `:root`):

```css
:root {
  --color-navy: #10283f;
  --color-wine: #8b3e4d;
  --color-sand: #d1b98c;
  /* ... outras cores */
}
```

### Logotipo

1. Gerar símbolo com GPT Image 2
2. Salvar em `public/brand/`
3. Atualizar `src/components/brand/Logo.tsx`

### Tipografia

Três fontes configuradas em `src/index.css`:

- **Manrope** (sans) — textos, navegação
- **Newsreader** (serif) — títulos
- **IBM Plex Mono** (mono) — dados técnicos

## 📱 Responsividade

- **Mobile** <640px
- **Tablet** 640px–1023px
- **Desktop** >1024px

## ♿ Acessibilidade

- ✅ Contraste WCAG AA
- ✅ Navegação por teclado
- ✅ Skip links
- ✅ ARIA labels
- ✅ Suporte a reduced motion
- ✅ Sem scroll horizontal

## 📊 Estrutura de Pastas

```
src/
├── components/       # Componentes React
│   ├── brand/        # Logo e marca
│   ├── common/       # Componentes compartilhados
│   ├── navigation/   # Navbar, Footer, Menu
│   ├── home/         # Seções da homepage
│   ├── jobs/         # Componentes de vagas
│   └── forms/        # Formulários validados
├── pages/            # Páginas principais
├── hooks/            # React hooks customizados
├── lib/              # Utilitários
├── services/         # Integração Supabase
├── data/             # Dados estáticos
└── styles/           # CSS global
```

## 🔐 Segurança

- RLS (Row Level Security) ativado no Supabase
- Formulários com honeypot
- Rate limiting básico
- Sanitização de entrada
- Sem exposição de chaves de API

## 🚢 Dados Reais

Antes de publicar, substituir:

- [ ] Empresa e contatos
- [ ] Telefone e WhatsApp
- [ ] Endereço e horários
- [ ] Logotipo
- [ ] Fotografia e vídeos
- [ ] Depoimentos (se fictícios, marcar como tal)
- [ ] Cases (se demonstrativos, marcar como tal)
- [ ] SEO e meta tags

## 📄 Páginas

- `/` — Homepage com todas as seções
- `/empresas` — Soluções para empresas
- `/candidatos` — Busca de vagas e cadastro
- `/vagas` — Listagem de vagas com filtros
- `/vagas/:slug` — Detalhes da vaga
- `/sobre` — Sobre a PILAR
- `/conteudos` — Blog e insights
- `/contato` — Formulário de contato
- `/privacidade` — Política de privacidade
- `/termos` — Termos de uso

## 🛠 Troubleshooting

### Supabase não funciona

- Verificar chaves em `.env.local`
- Certificar que as tabelas foram criadas
- Verificar RLS policies

### Imagens não carregam

- Executar `npm run media:fetch`
- Verificar se `public/media` existe
- Verificar permissões do Supabase Storage

### Build fail

```bash
# Limpar cache
rm -rf node_modules .next dist
npm install
npm run build
```

## 📝 Licença

Proprietary © 2026 PILAR Recursos Humanos

## 👥 Suporte

contato@pilarrh.com.br | (11) 3000-0000
