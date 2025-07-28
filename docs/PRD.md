# **Product Requirements Document (PRD)**
## **WhatsApp Message Dispatcher**

### **1. Visão Geral do Produto**

#### **1.1 Objetivo**
Desenvolver uma plataforma de disparo de mensagens em massa para WhatsApp que permita aos usuários escolher entre diferentes APIs (Evolution API v2 e Cloud API da Meta), com recursos avançados de automação, personalização e controle de envios.

#### **1.2 Proposta de Valor**
- Interface unificada para múltiplas APIs do WhatsApp
- Controle avançado de disparos com anti-spam
- Integração com Google Sheets para tracking
- Sistema de agendamento e automação
- Gerenciamento centralizado de configurações de API

#### **1.3 Stakeholders**
- **Usuários Primários:** Equipe interna de marketing e vendas
- **Administradores:** Equipe técnica responsável pela manutenção

### **2. Requisitos Funcionais**

#### **2.1 Gestão de APIs e Configurações**

##### **2.1.1 Configuração de APIs**
- **Seleção de API:**
  - Evolution API v2
  - WhatsApp Cloud API (Meta)
  
- **Evolution API - WhatsApp Web:**
  - Nome da Instância (obrigatório)
  - Token de Acesso (obrigatório)
  - Número do WhatsApp (formato: +DDI DDD 9XXXX-XXXX)
  - URL Base
  
- **Evolution API - Cloud API Meta:**
  - Nome da Instância (obrigatório)
  - Token de Acesso (obrigatório)
  - Phone Number ID (fornecido pela Meta)
  - URL Base

- **Gerenciamento de Configurações:**
  - Salvar múltiplas configurações com nomes personalizados
  - Editar configurações existentes
  - Excluir configurações
  - Botão para Testar conexão antes de salvar (Endpoint da Evolution v2 para testar conexão -> [Connection State](https://doc.evolution-api.com/v2/api-reference/instance-controller/connection-state))
  - Botão para testar a conexão em cada configuração existente

#### **2.2 Sistema de Disparo de Mensagens**

##### **2.2.1 Importação de Contatos**
- **Fontes de Dados:**
  - Upload de arquivo CSV/Excel
  - Integração com Google Sheets (link público)
  - Entrada manual
  - Importação de grupos do WhatsApp (via Evolution API)

- **Campos Obrigatórios:**
  - ID único (para tracking)
  - Número do WhatsApp
  - Nome (para personalização)

##### **2.2.2 Composição de Mensagens**
- **Tipos de Conteúdo:**
  - Texto simples
  - Texto com variáveis ({{nome}}, {{campo_personalizado}})
  - Texto reservado (placeholders) para as variáveis ({{nome}}, {{campo_personalizado}})
  - Imagens
  - Vídeos
  - Áudios
  - Documentos
  - Botões interativos (quando suportado pela API)

- **Recursos Avançados:**
  - Preview da mensagem
  - Múltiplas mensagens em sequência
  - Variações de mensagem (A/B testing)
  - Templates salvos

##### **2.2.3 Controle de Envio**
- **Configurações Anti-Spam:**
  - Intervalo entre mensagens (mín/máx em segundos)
  - Pausa após X mensagens
  - Limite diário de envios
  - Horário permitido para envios

- **Controles em Tempo Real:**
  - Iniciar disparo
  - Pausar disparo
  - Retomar disparo
  - Cancelar disparo
  - Visualizar progresso em tempo real

#### **2.3 Agendamento e Automação**

##### **2.3.1 Agendamento de Campanhas**
- Agendar disparo único (data/hora)
- Disparos recorrentes (diário, semanal, mensal)
- Fuso horário configurável
- Notificações de status

##### **2.3.2 Filas de Processamento**
- Sistema de filas para gerenciar disparos
- Priorização de campanhas
- Retry automático em caso de falha
- Logs detalhados de execução

#### **2.4 Integração com Google Sheets**

##### **2.4.1 Atualização de Status**
- Atualizar planilha após cada envio
- Campos atualizados:
  - Status do envio (Enviado/Falha/Pendente)
  - Timestamp do envio
  - Motivo da falha (se aplicável)
  - ID da mensagem

##### **2.4.2 Configuração**
- Input do link público do Google Sheets
- Mapeamento de colunas
- Validação de permissões
- Sincronização em tempo real

#### **2.5 Relatórios e Analytics**

##### **2.5.1 Dashboard**
- Total de mensagens enviadas
- Taxa de sucesso/falha
- Campanhas ativas
- Histórico de disparos

##### **2.5.2 Relatórios Detalhados**
- Exportar relatórios (CSV/PDF)
- Filtros por período
- Análise por campanha
- Logs de erro detalhados

### **3. Requisitos Não-Funcionais**

#### **3.1 Performance**
- Suportar até 1000 mensagens por minuto (respeitando limites da API)
- Interface responsiva com tempo de resposta < 2s
- Processamento assíncrono de disparos

#### **3.2 Segurança**
- Criptografia de tokens e credenciais
- Autenticação via Supabase Auth
- Logs de auditoria
- Rate limiting por usuário

#### **3.3 Usabilidade**
- Interface intuitiva e moderna
- Suporte a dark mode
- Mensagens de erro claras
- Documentação integrada

#### **3.4 Escalabilidade**
- Arquitetura preparada para múltiplos usuários
- Sistema de filas escalável
- Cache de configurações frequentes

### **4. Arquitetura Técnica**

#### **4.1 Stack Tecnológico**
- **Frontend:** Next.js 14+ com TypeScript
- **UI Components:** Shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Queue System:** Supabase Queue ([pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) para agendamentos. Link adicionais: [pg_cron Guide](https://supabase.com/docs/guides/cron), [pg_cron GitHub](https://github.com/citusdata/pg_cron))
- **APIs Externas:** Evolution API v2, WhatsApp Cloud API, Google Sheets API

#### **4.2 Estrutura do Banco de Dados**

```sql
-- Tabela de configurações de API
CREATE TABLE api_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  api_type VARCHAR(50) NOT NULL, -- 'evolution_web', 'evolution_cloud', 'meta_cloud'
  instance_name VARCHAR(255),
  access_token TEXT ENCRYPTED,
  phone_number VARCHAR(50),
  phone_number_id VARCHAR(255), -- Para Meta Cloud API
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de campanhas
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  api_config_id UUID REFERENCES api_configurations(id),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, running, paused, completed, failed
  google_sheets_url TEXT,
  sheet_id_column VARCHAR(50),
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de mensagens da campanha
CREATE TABLE campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  content_type VARCHAR(50), -- text, image, video, audio, document
  content TEXT,
  media_url TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contatos da campanha
CREATE TABLE campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  external_id VARCHAR(255), -- ID da planilha
  phone_number VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  custom_fields JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configurações de envio
CREATE TABLE sending_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  min_delay_seconds INTEGER DEFAULT 5,
  max_delay_seconds INTEGER DEFAULT 10,
  pause_after_messages INTEGER DEFAULT 50,
  pause_duration_seconds INTEGER DEFAULT 300,
  daily_limit INTEGER,
  allowed_hours_start TIME,
  allowed_hours_end TIME,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **5. Fluxos Principais**

#### **5.1 Fluxo de Configuração de API**
1. Usuário acessa configurações
2. Seleciona tipo de API
3. Preenche credenciais necessárias
4. Sistema testa conexão
5. Salva configuração se bem-sucedida

#### **5.2 Fluxo de Criação de Campanha**
1. Usuário cria nova campanha
2. Seleciona configuração de API
3. Importa contatos
4. Compõe mensagens
5. Define configurações de envio
6. Agenda ou inicia imediatamente

#### **5.3 Fluxo de Execução de Disparo**
1. Sistema inicia job de processamento
2. Para cada contato:
   - Aplica delay configurado
   - Envia mensagem via API selecionada
   - Atualiza status no banco
   - Atualiza Google Sheets (se configurado)
3. Gerencia pausas e limites
4. Finaliza e gera relatório

---

# **Plano de Desenvolvimento com Checklist**

## **Fase 1: Setup e Infraestrutura (Semana 1)** ✅ **CONCLUÍDA**

### Backend - Supabase
- [x] Criar projeto no Supabase *(Projeto `qgjxlkralenekdkpzqqw` configurado)*
- [x] Configurar autenticação (desabilitar verificação de email) *(Sistema GoTrue ativo com usuário de teste)*
- [x] Criar schema do banco de dados *(Todas as 8 tabelas criadas com prefixo `wa_dispatcher_v4`)*
- [x] Configurar RLS (Row Level Security) policies *(Políticas implementadas para todas as tabelas)*
- [x] Implementar funções de criptografia para tokens *(Funções PostgreSQL para encrypt/decrypt)*
- [x] Configurar pg_cron para agendamentos *(Jobs configurados para processar campanhas e fila)*
- [x] Criar Edge Functions base *(Functions `test-api-connection` e `send-message` deployadas)*

### Frontend - Next.js
- [x] Inicializar projeto Next.js 14 com TypeScript *(Next.js 15.4.4 configurado)*
- [x] Configurar Tailwind CSS *(Configurado e funcionando)*
- [x] Instalar e configurar Shadcn/ui *(Interface moderna implementada)*
- [x] Configurar cliente Supabase *(Cliente configurado em `src/lib/supabase.ts`)*
- [x] Criar layout base com navegação *(Layout responsivo com sidebar implementado)*
- [x] Implementar páginas de autenticação *(Login/signup funcionais com dados de teste)*

## **Fase 2: Gestão de APIs (Semana 2)** ✅ **CONCLUÍDA**

### Interface de Configuração
- [x] Criar página de configurações de API *(Página `/apis` implementada com interface completa)*
- [x] Formulário de adição de API com validação *(Modal responsivo com validação em tempo real)*
- [x] Componente de seleção de tipo de API *(Suport para Evolution Web/Cloud e Meta Cloud)*
- [x] Campos dinâmicos baseados no tipo selecionado *(Interface adaptável por tipo de API)*
- [x] Função de teste de conexão *(Teste em tempo real com feedback visual)*

### Backend - APIs
- [x] Implementar cliente Evolution API v2 *(ApiService com métodos CRUD completos)*
- [x] Implementar cliente WhatsApp Cloud API *(Suporte para Meta Cloud API)*
- [x] Criar endpoints de teste de conexão *(Edge Function `test-api-connection` corrigida)*
- [x] Sistema de criptografia/descriptografia de tokens *(Funções PostgreSQL seguras)*
- [x] CRUD de configurações de API *(Create, Read, Update, Delete, Toggle Status funcionais)*

### Funcionalidades Implementadas
- [x] **Hook personalizado** `useApiConfigurations` para gerenciamento de estado
- [x] **Service layer** `ApiService` com todas as operações do banco
- [x] **Interface TypeScript** completa com tipos `ApiConfiguration` e `ApiConfigurationForm`
- [x] **Validação de formulários** com mensagens de erro específicas
- [x] **Teste de conexão real** com Evolution API e status visual
- [x] **Criptografia de tokens** no banco de dados
- [x] **Mascaramento de dados sensíveis** nos placeholders da interface
- [x] **Estados de loading** e tratamento de erros
- [x] **CRUD completo** testado com dados reais do Supabase

### Componentes Criados
- **`src/types/api.ts`** - Interfaces TypeScript para todas as operações de API
- **`src/services/apiService.ts`** - Service layer com integração Supabase completa
- **`src/hooks/useApiConfigurations.ts`** - Hook React para gerenciamento de estado
- **`src/pages/APIs.tsx`** - Interface completa substituindo dados mockados

### Testes Realizados
- [x] **Login e navegação** para página de APIs funcionais
- [x] **Criação de API** com dados reais do TEST_CREDENTIALS.md
- [x] **Teste de conexão** bem-sucedido com Evolution API (estado: "open")
- [x] **Interface responsiva** com status visual (Ativa/Conectada)
- [x] **Validação de formulários** funcionando corretamente
- [x] **Operações CRUD** testadas e validadas

### Edge Functions Corrigidas
- **`test-api-connection`** - Corrigido header `apikey` para Evolution API
- Logs detalhados para debugging
- Suporte completo para Evolution Web/Cloud e Meta Cloud APIs

## **Fase 3: Sistema de Campanhas (Semanas 3-4)**

### Interface de Campanhas
- [ ] Lista de campanhas com filtros
- [ ] Formulário de criação de campanha
- [ ] Wizard de configuração (steps)
- [ ] Componente de importação de contatos
- [ ] Editor de mensagens com preview
- [ ] Configurações de envio (delays, pausas)

### Importação de Dados
- [ ] Upload de CSV/Excel
- [ ] Parser de arquivos
- [ ] Validação de números de telefone
- [ ] Interface de mapeamento de colunas
- [ ] Integração com Google Sheets API
- [ ] Preview de dados importados

### Composição de Mensagens
- [ ] Editor de texto com variáveis
- [ ] Upload de mídia (imagens, vídeos, áudios)
- [ ] Sistema de templates
- [ ] Preview em tempo real
- [ ] Suporte a múltiplas mensagens

## **Fase 4: Sistema de Disparo (Semanas 5-6)**

### Queue System
- [ ] Implementar sistema de filas com Supabase
- [ ] Worker para processar disparos
- [ ] Sistema de retry para falhas
- [ ] Controle de rate limiting
- [ ] Logs de execução

### Controles de Disparo
- [ ] Botões de controle (iniciar, pausar, parar)
- [ ] Progress bar em tempo real
- [ ] WebSocket/Realtime para atualizações
- [ ] Sistema de notificações
- [ ] Dashboard de monitoramento

### Integração com APIs
- [ ] Implementar envio via Evolution API
- [ ] Implementar envio via Cloud API
- [ ] Tratamento de erros específicos
- [ ] Fallback e retry logic
- [ ] Validação de respostas

## **Fase 5: Agendamento e Automação (Semana 7)**

### Sistema de Agendamento
- [ ] Interface de agendamento com calendário
- [ ] Configuração de disparos recorrentes
- [ ] Integração com pg_cron
- [ ] Sistema de notificações de agendamento
- [ ] Validação de conflitos

### Google Sheets Integration
- [ ] Autenticação com Google Sheets API
- [ ] Parser de URL de planilha
- [ ] Sistema de atualização em batch
- [ ] Mapeamento de colunas
- [ ] Tratamento de erros de sincronização

## **Fase 6: Relatórios e Analytics (Semana 8)**

### Dashboard
- [ ] Widgets de estatísticas principais
- [ ] Gráficos de desempenho
- [ ] Lista de campanhas recentes
- [ ] Status em tempo real

### Relatórios
- [ ] Relatório detalhado por campanha
- [ ] Exportação para CSV/PDF
- [ ] Histórico de disparos
- [ ] Logs de erro com filtros
- [ ] Analytics de engajamento

## **Fase 7: Testes e Refinamentos (Semana 9)**

### Testes
- [ ] Testes unitários dos componentes principais
- [ ] Testes de integração com APIs
- [ ] Testes de carga do sistema de filas
- [ ] Testes E2E dos fluxos principais
- [ ] Testes de segurança

### Otimizações
- [ ] Otimização de queries do banco
- [ ] Implementar cache onde necessário
- [ ] Melhorias de UX baseadas em feedback
- [ ] Documentação de código
- [ ] Preparar guias de uso

## **Fase 8: Deploy e Monitoramento (Semana 10)**

### Deploy
- [ ] Configurar ambiente de produção
- [ ] Deploy do frontend (Vercel/Netlify)
- [ ] Configurar variáveis de ambiente
- [ ] Setup de monitoramento
- [ ] Configurar backups automáticos

### Documentação
- [ ] Documentação técnica
- [ ] Guia do usuário
- [ ] Troubleshooting guide
- [ ] Vídeos tutoriais
- [ ] FAQ

---

## **Considerações sobre as Sugestões**

### **Queue System com Supabase**
✅ **Viável e Recomendado**

O Supabase oferece suporte para implementar filas através de:
- [Supabase Queue](https://supabase.com/docs/guides/database/extensions/pg_cron) usando PostgreSQL
- Triggers e Functions para processamento assíncrono
- Realtime subscriptions para atualizações de status

**Implementação sugerida:**
- Usar uma tabela `message_queue` com status
- Edge Functions para processar a fila
- pg_notify para eventos em tempo real

### **CRON Jobs para Agendamento**
✅ **Viável e Recomendado**

O Supabase suporta [pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) nativamente:
- Agendamento de tarefas recorrentes
- Execução de funções em horários específicos
- Ideal para verificar campanhas agendadas

**Implementação sugerida:**
```sql
-- Exemplo de CRON job para verificar campanhas agendadas
SELECT cron.schedule(
  'check-scheduled-campaigns',
  '* * * * *', -- A cada minuto
  $$
  SELECT process_scheduled_campaigns();
  $$
);
```

Ambas as sugestões são não apenas viáveis, mas altamente recomendadas para garantir a robustez e escalabilidade do sistema. O Supabase fornece todas as ferramentas necessárias para implementar essas funcionalidades de forma eficiente.

---

## **✅ Status de Implementação - Fase 1 Concluída**

### **Resumo da Implementação**
A **Fase 1: Setup e Infraestrutura** foi completamente implementada em 28 de Janeiro de 2025, estabelecendo uma base sólida e segura para o WhatsApp Message Dispatcher Pro v4.

### **Infraestrutura Backend Implementada**

#### **🗄️ Banco de Dados PostgreSQL**
- **8 tabelas principais** criadas com prefixo `wa_dispatcher_v4`:
  - `api_configurations` - Configurações de APIs com tokens criptografados
  - `campaigns` - Campanhas de disparo com controle de status
  - `campaign_messages` - Mensagens das campanhas com suporte a mídia
  - `campaign_contacts` - Contatos com campos personalizados (JSONB)
  - `sending_configurations` - Configurações anti-spam e horários
  - `message_queue` - Fila de processamento com retry automático
  - `system_logs` - Logs categorizados do sistema
  - `daily_stats` - Estatísticas diárias por usuário

#### **🔒 Segurança Implementada**
- **Row Level Security (RLS)** ativado em todas as tabelas
- **Políticas de acesso** granulares por usuário
- **Criptografia de tokens** com funções PostgreSQL personalizadas
- **Triggers automáticos** para atualização de timestamps

#### **⚙️ Automação e Processamento**
- **pg_cron configurado** com 3 jobs ativos:
  - Processamento de campanhas agendadas (a cada minuto)
  - Processamento da fila de mensagens (a cada 30 segundos)
  - Limpeza automática de logs antigos (diariamente)

#### **🚀 Edge Functions Deployadas**
- **test-api-connection**: Testa conectividade com Evolution API v2 e Meta Cloud API
- **send-message**: Processa envio de mensagens com substituição de variáveis

### **Frontend Validado**
- **Autenticação funcional** com dados de teste (`tuan.medeiros@gmail.com`)
- **Interface moderna** com Shadcn/ui e Tailwind CSS
- **Layout responsivo** com sidebar e navegação
- **Cliente Supabase** configurado e testado
- **Páginas principais** implementadas (Dashboard, Campanhas, APIs, etc.)

### **🎯 Próximos Passos**
Com a infraestrutura completa, a **Fase 2: Gestão de APIs** pode ser iniciada, focando em:
1. Conectar frontend com dados reais do banco
2. Implementar CRUD completo de configurações de API
3. Substituir dados mockados por queries do Supabase
4. Testar conectividade real com APIs do WhatsApp

### **📊 Métricas de Implementação**
- **100% das tarefas da Fase 1** concluídas
- **8 tabelas** com relacionamentos e constraints
- **16 políticas RLS** implementadas
- **2 Edge Functions** deployadas e testadas
- **3 CRON jobs** configurados
- **Interface 100% funcional** com dados de teste

A base está sólida e pronta para o desenvolvimento das funcionalidades principais! 🚀