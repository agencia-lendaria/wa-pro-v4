# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatsApp Dispatcher Pro v4 - A Next.js 15 TypeScript application for managing WhatsApp campaigns via multiple APIs. Built with Next.js App Router, Supabase backend, and Tailwind CSS.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Next.js
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run lint:es` - Run ESLint checks

### Testing
No test framework is currently configured. When adding tests, update this file with the test commands.

## Technology Stack

### Frontend
- **Next.js 15** with TypeScript and App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **next-themes** for dark mode support

### Backend & Services
- **Supabase** for authentication, database, and realtime features
- **React Hook Form** with Zod validation for forms
- **Recharts** for data visualization
- **Date-fns** for date utilities

### Configuration
- **ESLint** with Next.js and TypeScript plugins
- **PostCSS** with Tailwind CSS and Autoprefixer
- **TypeScript** with strict configuration

## Architecture

### Application Structure
```
app/                     # Next.js App Router pages
├── api/                 # API routes (future use)
├── apis/               # APIs management page
├── campaigns/          # Campaign management page
├── contacts/           # Contact management page
├── reports/            # Reports page
├── schedules/          # Scheduling page
├── settings/           # Settings page
├── globals.css         # Global styles
├── layout.tsx          # Root layout with providers
├── page.tsx            # Main page (auth + dashboard)
└── providers.tsx       # Theme and context providers

src/                     # Legacy structure (being migrated)
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication forms
│   ├── Layout/         # Layout components (Header, Sidebar, Layout)
│   └── ThemeToggle.tsx # Dark mode toggle
├── hooks/              # Custom React hooks
├── lib/                # Library configurations and utilities
├── pages/              # Route components (legacy)
├── types/              # TypeScript type definitions
└── main.tsx           # Legacy entry point
```

### Key Components
- **Layout System**: Header, Sidebar, and main Layout wrapper in src/components/Layout/
- **Authentication**: LoginForm component with Supabase auth
- **Theme Management**: ThemeProvider with next-themes for dark mode
- **Pages**: Dashboard, Campaigns, APIs, and feature pages

### Data Flow
- **Authentication**: Custom `useAuth` hook manages user state via Supabase
- **Routing**: Next.js App Router with file-based routing
- **State Management**: Local component state and React hooks (no global state library)
- **Client Components**: Components using hooks marked with `"use client"` directive

### API Integration
The application interfaces with multiple WhatsApp APIs:
- Evolution API v2 (Web and Cloud variants)
- Meta Cloud API
- API configurations stored in Supabase with encrypted tokens

### Database Design
Comprehensive workflow documentation exists in:
- `WORKFLOW_API.md` - Complete API workflow documentation
- `WORKFLOW_CAMPANHAS.md` - Campaign management workflow

Key tables include:
- `wa_dispatcher_v4_api_configurations` - WhatsApp API credentials and settings
- `wa_dispatcher_v4_campaigns` - Campaign definitions and status
- `wa_dispatcher_v4_campaign_messages` - Message templates for campaigns
- `wa_dispatcher_v4_campaign_contacts` - Contact lists for campaigns
- `wa_dispatcher_v4_message_queue` - Processing queue for message delivery

## Environment Variables

Required Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development Patterns

### Component Structure
- Functional components with TypeScript
- Server Components by default, Client Components when needed (hooks, browser APIs)
- Use `"use client"` directive for components requiring client-side features
- Custom hooks for stateful logic
- Props interfaces defined inline or in types/

### Authentication Flow
- Protected routes requiring user authentication
- Automatic redirection to login when unauthenticated
- Loading states during auth verification
- Supabase Auth integration

### Error Handling
- Try-catch blocks for async operations
- User-friendly alert messages for errors
- Form validation with Zod schemas

### Styling Approach
- Tailwind CSS utility classes
- Dark mode support with next-themes
- Responsive design patterns
- Loading spinners and interactive states

## Key Files

### Configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint with Next.js and TypeScript rules
- `tsconfig.json` - TypeScript configuration

### Core Application
- `app/layout.tsx` - Root layout with providers and metadata
- `app/page.tsx` - Main page with auth logic and dashboard
- `app/providers.tsx` - Theme provider setup
- `src/lib/supabase.ts` - Supabase client and auth helpers
- `src/hooks/useAuth.ts` - Authentication state management
- `src/types/index.ts` - TypeScript type definitions

### Business Logic Documentation
- `WORKFLOW_API.md` - Complete API configuration and testing workflows
- `WORKFLOW_CAMPANHAS.md` - Campaign creation and execution workflows
- `PRD.md` - Complete product requirements document

## Database Schema Notes

The application uses a sophisticated database schema with:
- Row Level Security (RLS) for data isolation
- Encrypted token storage for API credentials
- Message queuing system for campaign execution
- Comprehensive audit logging and health monitoring
- All backend (table names, functions, CRON, and triggers) are prefixed with: wa_dispatcher_v4

Refer to the workflow documentation for complete database implementation details.

# Security prompt:

Please check through all the code you just wrote and make sure it follows security best practices. make sure there are no sensitive information in the front and and there are no vulnerabilities that can be exploited

# MCP
Utilize os MCPs (Model Context Protocol) abaixo para determinadas tarefas.
supabase -> Utilizar para implementar soluções completas de backend incluindo:
    - Banco de dados PostgreSQL com RLS (Row Level Security)
    - Sistema de autenticação (GoTrue) com JWT
    - API RESTful automática via PostgREST
    - Armazenamento de arquivos (Storage)
    - Funcionalidades Realtime para colaboração
    - Edge Functions para lógica serverless
    - Seguir convenções snake_case para tabelas e campos
context7 -> Utilizar para acessar documentação oficial sempre atualizada de bibliotecas e frameworks.
Ref-suportebemstar -> Use a ferramenta Ref quando seu código precisar de informações ou documentação técnica atualizada sobre APIs, bibliotecas ou frameworks. A ferramenta é ideal para buscar e ler documentações de forma rápida e eficiente em termos de tokens, tanto em fontes públicas quanto privadas. Ela também contém a documentação oficial sempre atualizada de bibliotecas e frameworks e é mais otimizada para buscar exatamente o que precisa.
@magicuidesign/mcp -> Utilizar para criar e implementar componentes modernos de UI, seguindo boas práticas de design, acessibilidade e responsividade. Priorizar componentes reutilizáveis e consistência visual.
playwright -> Use esta ferramenta para automatizar interações com navegadores web, incluindo navegação, preenchimento de formulários, cliques em elementos, captura de screenshots e extração de dados de páginas web. O Playwright suporta múltiplos navegadores (Chrome, Firefox, Safari) e pode executar operações tanto em modo headless quanto com interface gráfica. Essa ferramenta é fundamental para realizar testes, ver os erros que aparecem no console para criar planos de ação para corrigir.
shadcn-ui -> Utilizar a ferramenta MCP para construir interfaces com componentes estilizados via Tailwind CSS.
  - Importar componentes
  - Customizar via `components.json` e arquivo de temas
  - Priorizar composição de componentes pequenos e reutilizáveis
  - Usar `data-testid` para testes com Playwright
  - Seguir padrões de acessibilidade (aria-label, roles)

## LOGIN
Para fazer login na página e realizar testes (arquivo "TEST_CREDENTIALS.md"):
  - Login: tuan.medeiros@gmail.com
  - Senha: 123456@Test

# CHANGELOGS

At the end of each task, create a file in the "changelog" folder with the details of the task execution to be used as a reference for future implementations.
