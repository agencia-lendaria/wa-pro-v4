# Product Requirements Document (PRD)
## WhatsApp Message Dispatcher Application

### 1. **Visão Geral do Produto**

#### **1.1. Objetivo**
Desenvolver uma aplicação web para disparo automatizado de mensagens via WhatsApp, similar ao "WA Workflow", com foco em facilitar campanhas de marketing e comunicação em massa para equipes internas.

#### **1.2. Público-Alvo**
- Equipes internas de marketing e vendas
- Profissionais que necessitam enviar mensagens em massa via WhatsApp
- Empresas que precisam automatizar comunicação com clientes

#### **1.3. Proposta de Valor**
- **Flexibilidade de APIs**: Suporte a múltiplas APIs (Evolution API v2, Meta Cloud API)
- **Automação Inteligente**: Sistema de pausas e controles para evitar bloqueios
- **Integração com Google Sheets**: Atualização automática de planilhas
- **Interface Intuitiva**: Dashboard completo com métricas e controles

---

### 2. **Funcionalidades Principais**

#### **2.1. Sistema de Autenticação**
- **Login/Cadastro**: Sistema baseado em email e senha
- **Backend**: Supabase Auth (sem verificação de email)
- **Segurança**: Controle de acesso baseado em usuário

#### **2.2. Configuração de APIs**
- **Tipos Suportados**:
  - Evolution API v2 (Nome da Instância, Token, Número de Telefone, URL Base)
  - Meta Cloud API (Nome da Instância, Access Token, Phone Number ID, Business Account ID)
- **Gerenciamento**: CRUD completo com status ativo/inativo
- **Múltiplas Configurações**: Possibilidade de salvar várias configurações

#### **2.3. Sistema de Campanhas**
- **Criação de Campanhas**: Interface para configurar disparos em massa
- **Tipos de Mensagem**: Suporte a texto, imagens, vídeos, áudios e documentos
- **Controle de Envio**:
  - Atraso configurável entre mensagens (min/max em segundos)
  - Pausas automáticas após X envios
  - Sistema de variações de mensagens para evitar spam
- **Status de Campanha**: Draft, Agendada, Em Andamento, Pausada, Concluída, Cancelada

#### **2.4. Sistema de Agendamentos**
- **CRON Jobs do Supabase**: Para execução automática
- **Interface de Agendamento**: Calendário interativo
- **Recorrência**: Suporte a agendamentos repetitivos
- **Controles**: Pausar, retomar, cancelar agendamentos

#### **2.5. Gerenciamento de Contatos**
- **Importação**: Upload de arquivos CSV/Excel
- **Organização**: Sistema de tags e categorias
- **Filtros**: Seleção por critérios específicos
- **Exportação**: Download de listas de contatos

#### **2.6. Integração com Google Sheets**
- **URL Pública**: Entrada para link da planilha
- **Atualização Automática**: Identificação por coluna ID
- **Status de Entrega**: Atualização do status de envio na planilha

#### **2.7. Sistema de Filas (Queue)**
- **Supabase Queues**: Para controle de disparos
- **Controles em Tempo Real**: Pausar, retomar, parar campanhas
- **Monitoramento**: Status de execução em tempo real

#### **2.8. Dashboard e Relatórios**
- **Métricas Principais**: Total de envios, taxa de entrega, contatos ativos
- **Gráficos**: Visualização de dados com Recharts
- **Relatórios Detalhados**: Histórico de campanhas e performance

---

### 3. **Requisitos Técnicos**

#### **3.1. Frontend**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

#### **3.2. Backend**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (para arquivos de contatos)
- **Edge Functions**: Para integrações com APIs externas

#### **3.3. Integrações**
- **WhatsApp APIs**:
  - Evolution API v2
  - Meta Cloud API
- **Google Sheets API**: Para atualização de planilhas
- **CRON Jobs**: Supabase Cron para agendamentos

---

### 4. **Arquitetura do Sistema**

#### **4.1. Estrutura do Banco de Dados**

```sql
-- Usuários (gerenciado pelo Supabase Auth)
auth.users

-- Configurações de API
api_configs (
  id, user_id, name, type, config, is_active, created_at, updated_at
)

-- Campanhas
campaigns (
  id, user_id, name, description, api_config_id, message_template, 
  status, scheduled_at, settings, created_at, updated_at
)

-- Contatos
contacts (
  id, user_id, name, phone, tags, custom_fields, created_at
)

-- Execuções de Campanha
campaign_executions (
  id, campaign_id, contact_id, status, sent_at, error_message, 
  google_sheets_updated
)

-- Agendamentos
schedules (
  id, user_id, campaign_id, cron_expression, is_active, 
  last_run, next_run, created_at
)

-- Filas de Processamento
message_queue (
  id, campaign_id, contact_id, message_data, status, 
  scheduled_for, attempts, created_at
)
```

#### **4.2. Fluxo de Execução**

1. **Criação de Campanha**: Usuário configura mensagem, seleciona contatos e API
2. **Agendamento**: Sistema cria CRON job ou executa imediatamente
3. **Processamento**: Fila processa mensagens com controles de delay
4. **Envio**: API escolhida envia mensagem
5. **Atualização**: Status atualizado no banco e Google Sheets
6. **Monitoramento**: Dashboard exibe progresso em tempo real

---

### 5. **Interface do Usuário**

#### **5.1. Navegação Principal**
- **Sidebar**: Menu lateral com todas as seções
- **Header**: Informações do usuário e notificações
- **Breadcrumbs**: Navegação contextual

#### **5.2. Páginas Principais**

1. **Dashboard**
   - Cards com métricas principais
   - Gráficos de performance
   - Lista de campanhas recentes
   - Notificações e alertas

2. **Campanhas**
   - Lista de todas as campanhas
   - Controles de execução (play, pause, stop)
   - Modal de criação/edição
   - Progress bars para campanhas ativas

3. **Agendamentos**
   - Calendário visual
   - Lista de agendamentos ativos
   - Configuração de CRON expressions
   - Histórico de execuções

4. **Contatos**
   - Tabela com filtros e busca
   - Upload de arquivos
   - Sistema de tags
   - Exportação de dados

5. **APIs**
   - Cards de configurações
   - Formulários específicos por tipo
   - Status de conexão
   - Testes de conectividade

6. **Relatórios**
   - Filtros por período
   - Métricas detalhadas
   - Exportação de relatórios
   - Gráficos de análise

---

### 6. **Cronograma de Desenvolvimento**

#### **Fase 1 - Fundação (Semana 1-2)**
- [ ] Setup do projeto (Vite + React + TypeScript)
- [ ] Configuração do Supabase
- [ ] Sistema de autenticação
- [ ] Layout base com sidebar e header
- [ ] Páginas básicas (rotas)

#### **Fase 2 - APIs e Configurações (Semana 3-4)**
- [ ] Modelo de dados para configurações de API
- [ ] Interface de configuração de APIs
- [ ] Validação e testes de conectividade
- [ ] Armazenamento seguro de credenciais

#### **Fase 3 - Sistema de Campanhas (Semana 5-7)**
- [ ] Modelo de dados para campanhas
- [ ] Interface de criação de campanhas
- [ ] Sistema de upload e gerenciamento de contatos
- [ ] Templates de mensagens
- [ ] Configurações de delay e pausas

#### **Fase 4 - Sistema de Filas e Execução (Semana 8-9)**
- [ ] Implementação do sistema de filas
- [ ] Processador de mensagens
- [ ] Integração com APIs do WhatsApp
- [ ] Controles de execução (pause/resume/stop)

#### **Fase 5 - Agendamentos (Semana 10)**
- [ ] Sistema de CRON jobs
- [ ] Interface de agendamento
- [ ] Execução automática de campanhas

#### **Fase 6 - Integrações (Semana 11)**
- [ ] Integração com Google Sheets
- [ ] Atualização automática de planilhas
- [ ] Logs e auditoria

#### **Fase 7 - Dashboard e Relatórios (Semana 12)**
- [ ] Dashboard com métricas
- [ ] Gráficos de performance
- [ ] Sistema de relatórios
- [ ] Exportação de dados

#### **Fase 8 - Testes e Refinamentos (Semana 13-14)**
- [ ] Testes de integração
- [ ] Otimizações de performance
- [ ] Ajustes de UX/UI
- [ ] Documentação

---

### 7. **Considerações de Segurança**

#### **7.1. Proteção de Dados**
- **Criptografia**: Tokens e credenciais criptografados
- **RLS**: Row Level Security no Supabase
- **Auditoria**: Logs de todas as operações críticas

#### **7.2. Prevenção de Bloqueios**
- **Rate Limiting**: Controles de velocidade configuráveis
- **Randomização**: Delays aleatórios entre envios
- **Monitoramento**: Detecção de falhas e bloqueios

#### **7.3. Conformidade**
- **LGPD**: Proteção de dados pessoais
- **WhatsApp Business Policy**: Conformidade com políticas oficiais
- **Backup**: Estratégia de backup e recuperação

---

### 8. **Métricas de Sucesso**

#### **8.1. Métricas Técnicas**
- **Uptime**: > 99.5%
- **Latência**: < 2s para operações CRUD
- **Taxa de Entrega**: > 95% das mensagens enviadas

#### **8.2. Métricas de Produto**
- **Facilidade de Uso**: Setup completo em < 10 minutos
- **Eficiência**: Redução de 80% no tempo de disparo manual
- **Confiabilidade**: < 1% de falhas de envio por problemas técnicos

#### **8.3. Métricas de Negócio**
- **Adoção**: 100% da equipe interna utilizando
- **ROI**: Redução de custos operacionais em 50%
- **Satisfação**: NPS > 8 da equipe interna

---

### 9. **Riscos e Mitigações**

#### **9.1. Riscos Técnicos**
- **Bloqueio de APIs**: Mitigação com múltiplas APIs e controles inteligentes
- **Performance**: Otimização de queries e uso de cache
- **Integração**: Testes extensivos com APIs externas

#### **9.2. Riscos de Negócio**
- **WhatsApp Policy**: Acompanhamento constante das políticas
- **Dependência de APIs**: Múltiplas opções de fornecedores
- **Escalabilidade**: Arquitetura preparada para crescimento

#### **9.3. Riscos de Segurança**
- **Vazamento de Dados**: Criptografia e auditoria
- **Acesso Não Autorizado**: Sistema robusto de autenticação
- **Ataques**: Monitoramento e proteção contra ameaças

---

### 10. **Conclusão**

Este PRD define uma aplicação robusta e completa para disparo automatizado de mensagens WhatsApp, com foco em usabilidade, segurança e eficiência. A arquitetura proposta permite escalabilidade e manutenibilidade, enquanto as funcionalidades atendem às necessidades específicas do público-alvo.

A implementação seguirá metodologia ágil com entregas incrementais, permitindo feedback contínuo e ajustes durante o desenvolvimento.