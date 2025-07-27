# Documentação da Arquitetura Atual (React + Vite)

## Estrutura do Projeto

```
src/
├── components/
│   ├── Auth/
│   │   └── LoginForm.tsx          # Form de login com Supabase
│   └── Layout/
│       ├── Layout.tsx             # Layout principal da aplicação
│       ├── Header.tsx             # Cabeçalho com navegação
│       └── Sidebar.tsx            # Menu lateral
├── hooks/
│   └── useAuth.ts                 # Hook customizado para autenticação
├── lib/
│   └── supabase.ts               # Cliente Supabase e helpers auth
├── pages/
│   ├── Dashboard.tsx             # Página principal com stats e charts
│   ├── Campaigns.tsx             # Gerenciamento de campanhas
│   └── APIs.tsx                  # Configuração de APIs
├── types/
│   └── index.ts                  # Definições TypeScript
├── App.tsx                       # Componente raiz com routing
└── main.tsx                      # Entry point da aplicação
```

## Roteamento Atual (React Router)

- `/` → Dashboard
- `/campaigns` → Campanhas  
- `/schedules` → Agendamentos (placeholder)
- `/contacts` → Contatos (placeholder)
- `/apis` → APIs
- `/reports` → Relatórios (placeholder)
- `/settings` → Configurações (placeholder)

## Estado e Gerenciamento de Dados

### Autenticação
- **Hook**: `useAuth()`
- **Estado**: `user`, `loading`
- **Persistência**: Supabase Auth (JWT)

### Páginas com Estado Local
- **Campaigns**: `useState` para mock data
- **Dashboard**: Dados estáticos hardcoded

## Integrações

### Supabase
- **Auth**: Login/logout com email/senha
- **Configuração**: Variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### UI/Styling
- **CSS Framework**: Tailwind CSS
- **Ícones**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Dependências Principais

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1", 
  "@supabase/supabase-js": "^2.52.1",
  "react-hook-form": "^7.61.1",
  "recharts": "^2.15.4",
  "lucide-react": "^0.344.0",
  "date-fns": "^3.6.0",
  "zod": "^3.25.76"
}
```

## Build e Deploy
- **Dev Server**: Vite (`npm run dev`)
- **Build**: Vite (`npm run build`)
- **Linting**: ESLint (`npm run lint`)

## Componentes que Requerem Client-Side
- LoginForm (forms, interações)
- Dashboard (Recharts)
- Campaigns (useState)
- useAuth hook
- Todos os componentes com useState/useEffect

## Variáveis de Ambiente
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`
- `VITE_PROJECT_PREFIX`