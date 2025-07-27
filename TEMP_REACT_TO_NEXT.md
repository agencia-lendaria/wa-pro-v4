# ● Plano de Migração Final: React (Vite) → Next.js (App Router)

> ✅ **Análise Concluída:** A migração é viável e trará benefícios significativos em SEO, performance e experiência de desenvolvimento (DX).

---

## 📊 Benefícios da Migração

- **SEO Otimizado:** Com Server-Side Rendering (SSR) e Server Components.
- **Performance Superior:** Graças ao code-splitting automático, otimização de imagens (`<Image>`), fontes (`next/font`) e menor quantidade de JavaScript enviado ao cliente.
- **Backend Integrado:** Facilidade para criar endpoints de API com as API Routes.
- **Melhor DX:** Roteamento intuitivo baseado em arquivos e recarregamento rápido (Fast Refresh).
- **Deploy Simplificado:** Plataformas como a Vercel são otimizadas para projetos Next.js.

---

## 📋 Plano de Ação Detalhado

### Fase 1: Preparação e Análise ✅ (⏱️ ~2h)
- [ ] **Avaliar a aplicação atual:**
    - [ ] Listar todas as dependências do projeto e verificar sua compatibilidade com SSR.
    - [ ] Mapear todas as rotas existentes no React Router.
    - [ ] Identificar todas as chamadas de API, gerenciamento de estado (hooks, context, etc.) e o uso de variáveis de ambiente.
- [ ] **Planejamento e Segurança:**
    - [ ] Fazer um backup completo do projeto.
    - [ ] Criar uma nova `branch` no Git exclusiva para a migração (ex: `feat/migration-nextjs`).
    - [ ] Documentar a arquitetura atual para referência futura.

### Fase 2: Configuração Inicial do Next.js 🛠️ (⏱️ ~1h)
- [ ] **Criar um novo projeto Next.js 14** (recomendado):
  ```bash
  npx create-next-app@latest meu-app-next --typescript --tailwind --eslint
  ```
- [ ] **Atualizar o `package.json`** com os scripts do Next.js:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
  ```
- [ ] **Criar a estrutura de pastas base:**
    - [ ] Confirmar a existência da pasta `app/` para o App Router.
    - [ ] Criar a pasta `components/` na raiz para componentes reutilizáveis.
    - [ ] Criar as pastas `lib/`, `hooks/`, `types/` conforme a necessidade.
    - [ ] Mover todos os arquivos estáticos (imagens, fontes) para a pasta `public/`.
- [ ] **Migrar variáveis de ambiente:** Converter o `.env` para o padrão Next.js (prefixar variáveis expostas ao cliente com `NEXT_PUBLIC_`).

### Fase 3: Migração de Estrutura e Roteamento 🔄 (⏱️ ~4h)
- [ ] **Implementar `layout.tsx` e `page.tsx` globais:**
    - [ ] Migrar o conteúdo de `App.tsx` e `index.html` para `app/layout.tsx` (incluindo `<html>`, `<body>`, provedores de contexto globais e importação de CSS global).
    - [ ] A página principal (`/`) será `app/page.tsx`.
- [ ] **Converter Rotas do React Router para o App Router:**
    - [ ] Mapear cada rota para a estrutura de pastas do Next.js. Ex: `/settings` se torna `app/settings/page.tsx`.
    - [ ] Converter parâmetros de rota: `/user/:id` se torna `app/user/[id]/page.tsx`.
    - [ ] Migrar rotas aninhadas usando layouts aninhados (`layout.tsx` dentro de subpastas).
- [ ] **Substituir `NavLink`/`Link` do React Router pelo `<Link>` do Next.js** para navegação otimizada.

### Fase 4: Migração de Componentes e UI 🧩 (⏱️ ~4h)
- [ ] **Copiar todos os componentes** para a nova pasta `components/`.
- [ ] **Ajustar todos os caminhos de importação** (`import`).
- [ ] **Identificar e adaptar Componentes Client-Side:**
    - [ ] Adicionar a diretiva `"use client";` no topo de qualquer componente que utilize hooks (`useState`, `useEffect`) ou APIs do navegador (`window`, `localStorage`).
- [ ] **Migrar `Layout`, `Header`, `Sidebar` e outros componentes de UI.**
- [ ] **Configurar Estilização:**
    - [ ] Migrar CSS global para `app/globals.css`.
    - [ ] Garantir que a configuração do Tailwind CSS (`tailwind.config.ts`) esteja correta.

### Fase 5: Gerenciamento de Estado e APIs (Supabase) 🔌 (⏱️ ~3h)
- [ ] **Refatorar o Data Fetching:**
    - [ ] Mover a lógica de busca de dados (queries Supabase) para dentro de **React Server Components (RSC)** sempre que possível, usando `async/await`. Isso remove a necessidade de `useEffect` para fetching.
    - [ ] Para dados que precisam ser buscados no cliente, manter a lógica dentro de componentes `"use client"`.
- [ ] **Adaptar a integração com o Supabase:**
    - [ ] Configurar o cliente Supabase para funcionar tanto no servidor (RSC, API Routes) quanto no cliente.
    - [ ] Implementar a lógica de autenticação usando o `middleware.ts` do Next.js para proteger rotas.
    - [ ] Migrar o `LoginForm` e adaptar o hook `useAuth` para o novo ambiente.

### Fase 6: Otimizações Específicas do Next.js ⚡ (⏱️ ~2h)
- [ ] **Otimização de Imagens:** Substituir todas as tags `<img>` por `<Image>` de `next/image` para otimização automática.
- [ ] **Otimização de Fontes:** Configurar fontes locais ou do Google Fonts com `next/font` para evitar "layout shift".
- [ ] **Lazy Loading:** Utilizar `next/dynamic` para carregar componentes pesados ou bibliotecas client-side de forma dinâmica, apenas quando forem necessários.

### Fase 7: Testes e Validação 🧪 (⏱️ ~3h)
- [ ] **Testes Funcionais:** Verificar se todas as rotas estão acessíveis e renderizando corretamente.
- [ ] **Testes de Navegação:** Garantir que todos os `<Link>`s e redirects funcionam.
- [ ] **Validação de APIs e Dados:** Confirmar que a integração com o Supabase e as APIs do WhatsApp estão funcionando.
- [ ] **Testes de Autenticação:** Testar o fluxo completo de login, logout e acesso a rotas protegidas.
- [ ] **Verificar performance** com o Lighthouse e Core Web Vitals.
- [ ] **Adaptar testes automatizados (Jest/React Testing Library)** para o ambiente Next.js.

### Fase 8: Deploy e Monitoramento 🚀 (⏱️ ~2h)
- [ ] **Preparar para Produção:** Executar `npm run build` e corrigir quaisquer erros.
- [ ] **Testar o Build de Produção:** Rodar `npm run start` para testar a versão de produção localmente.
- [ ] **Configurar a Plataforma de Deploy:** Configurar o projeto na Vercel (recomendado), Netlify ou outra plataforma.
- [ ] **Configurar CI/CD** se necessário.

---

### ⏰ Estimativa de Tempo Total

A estimativa de ~21 horas é otimista e adequada para uma **aplicação pequena**. Uma estimativa mais realista, dependendo da complexidade, seria:
- **Aplicação Pequena (< 10 páginas):** 1-2 semanas
- **Aplicação Média (10-50 páginas):** 2-4 semanas
- **Aplicação Grande (> 50 páginas):** 1-2 meses

---

### 💡 Dicas Importantes

- **Migre Incrementalmente:** Não tente fazer tudo de uma vez. Comece pelas páginas mais simples.
- **Abrace o "Server-First":** Pense primeiro em como fazer algo no servidor (Server Component). Use `"use client"` apenas quando for estritamente necessário.
- **Documente as Mudanças:** Mantenha um registro das decisões tomadas para alinhar a equipe.

