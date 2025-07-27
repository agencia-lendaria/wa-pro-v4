# Checklist de Desenvolvimento - WhatsApp Dispatcher

## 📋 **FASE 1: Fundação (Semana 1-2)**

### Setup Inicial
- [x] Criar projeto Vite + React + TypeScript
- [x] Configurar Tailwind CSS
- [x] Instalar dependências principais (Supabase, React Router, etc.)
- [x] Configurar ESLint e Prettier
- [ ] Configurar variáveis de ambiente (.env)

### Supabase Setup  
- [ ] Criar projeto no Supabase
- [ ] Configurar autenticação (desabilitar confirmação de email)
- [ ] Criar tabelas iniciais do banco de dados
- [ ] Configurar Row Level Security (RLS)
- [ ] Testar conexão com o banco

### Sistema de Autenticação
- [x] Criar hook useAuth
- [x] Implementar componente LoginForm
- [x] Configurar rotas protegidas
- [x] Implementar logout
- [ ] Testes de autenticação

### Layout Base
- [x] Criar componente Layout
- [x] Implementar Sidebar com navegação
- [x] Criar Header com informações do usuário
- [x] Implementar responsividade
- [x] Configurar React Router

### Páginas Básicas
- [x] Criar página Dashboard (estrutura inicial)
- [x] Criar página Campanhas (estrutura inicial)
- [x] Criar página APIs (estrutura inicial)
- [x] Criar páginas placeholder (Agendamentos, Contatos, Relatórios, Configurações)

---

## 📊 **FASE 2: APIs e Configurações (Semana 3-4)**

### Modelo de Dados - APIs
- [ ] Criar tabela `api_configs` no Supabase
- [ ] Definir tipos TypeScript para configurações
- [ ] Implementar políticas RLS para api_configs
- [ ] Criar migração SQL

### Interface de APIs
- [x] Implementar listagem de configurações de API
- [x] Modal de criação/edição de APIs
- [x] Formulários específicos (Evolution vs Meta Cloud)
- [ ] Validação de formulários com Zod
- [ ] Funcionalidade de salvar/editar/excluir

### Conectividade e Validação
- [ ] Implementar testes de conectividade
- [ ] Validação de credenciais em tempo real
- [ ] Indicadores de status (ativo/inativo)
- [ ] Tratamento de erros de conexão

### Segurança
- [ ] Criptografia de tokens e credenciais
- [ ] Mascaramento de dados sensíveis na UI
- [ ] Auditoria de mudanças de configuração

---

## 🚀 **FASE 3: Sistema de Campanhas (Semana 5-7)**

### Modelo de Dados - Campanhas
- [ ] Criar tabela `campaigns` no Supabase
- [ ] Criar tabela `contacts` no Supabase
- [ ] Definir tipos TypeScript para campanhas
- [ ] Implementar RLS para campanhas e contatos

### Interface de Campanhas
- [x] Dashboard de campanhas com estatísticas
- [x] Listagem de campanhas com status
- [x] Cards de métricas (em andamento, agendadas, etc.)
- [ ] Modal de criação de campanha
- [ ] Formulário de configuração de mensagem
- [ ] Seleção de API para envio

### Gerenciamento de Contatos
- [ ] Interface de upload de contatos (CSV/Excel)
- [ ] Parser de arquivos de contatos
- [ ] Sistema de validação de números
- [ ] Filtros e busca de contatos
- [ ] Sistema de tags/categorias

### Templates de Mensagens
- [ ] Editor de mensagens de texto
- [ ] Upload de mídia (imagens, vídeos, áudios)
- [ ] Sistema de variações de mensagem
- [ ] Preview de mensagens

### Configurações de Envio
- [ ] Configuração de delays (min/max)
- [ ] Sistema de pausas automáticas
- [ ] Configuração de horários de envio
- [ ] Validação de configurações

---

## ⚙️ **FASE 4: Sistema de Filas e Execução (Semana 8-9)**

### Sistema de Filas
- [ ] Criar tabela `message_queue` no Supabase
- [ ] Implementar processador de filas
- [ ] Sistema de retry para falhas
- [ ] Monitoramento de performance da fila

### Processamento de Mensagens
- [ ] Lógica de processamento sequencial
- [ ] Implementação de delays configuráveis
- [ ] Sistema de pausas automáticas
- [ ] Tratamento de erros de envio

### Integração com APIs WhatsApp
- [ ] Integração com Evolution API v2
- [ ] Integração com Meta Cloud API
- [ ] Padronização de respostas das APIs
- [ ] Tratamento de rate limits

### Controles de Execução
- [x] Botões de controle (play, pause, stop) na UI
- [ ] Implementação de pausa em tempo real
- [ ] Funcionalidade de retomar campanha
- [ ] Cancelamento de campanhas
- [ ] Atualização de status em tempo real

### Monitoramento
- [ ] Progress bars para campanhas ativas
- [ ] Logs de execução
- [ ] Métricas de performance
- [ ] Alertas para falhas

---

## 📅 **FASE 5: Agendamentos (Semana 10)**

### Sistema de CRON
- [ ] Configurar Supabase Cron Jobs
- [ ] Criar tabela `schedules` no Supabase
- [ ] Interface para criar agendamentos
- [ ] Validação de expressões CRON

### Interface de Agendamento
- [ ] Calendário interativo
- [ ] Seletor de data/hora
- [ ] Configuração de recorrência
- [ ] Lista de agendamentos ativos

### Execução Automática
- [ ] Trigger automático de campanhas agendadas
- [ ] Verificação de condições de execução
- [ ] Logs de execuções automáticas
- [ ] Tratamento de falhas de agendamento

### Gerenciamento
- [ ] Editar agendamentos existentes
- [ ] Cancelar agendamentos
- [ ] Histórico de execuções
- [ ] Notificações de agendamentos

---

## 📊 **FASE 6: Integrações (Semana 11)**

### Google Sheets Integration
- [ ] Configuração de URL de planilha pública
- [ ] Leitura de dados da planilha
- [ ] Identificação por coluna ID
- [ ] Atualização de status na planilha

### Sistema de Atualização
- [ ] Mapping de colunas
- [ ] Atualização em lote
- [ ] Tratamento de erros de escrita
- [ ] Logs de atualizações

### Outras Integrações
- [ ] Webhook para receber status de entrega
- [ ] API para integrações externas
- [ ] Export/Import de dados
- [ ] Backup automático

---

## 📈 **FASE 7: Dashboard e Relatórios (Semana 12)**

### Dashboard Principal
- [x] Cards de métricas principais
- [x] Gráficos com Recharts (envios vs entregas)
- [x] Lista de campanhas recentes
- [ ] Notificações e alertas
- [ ] Dados em tempo real

### Sistema de Relatórios
- [ ] Filtros por período
- [ ] Relatório de performance de campanhas
- [ ] Análise de taxa de entrega
- [ ] Relatório de contatos

### Visualizações
- [x] Gráfico de barras (envios vs entregas)
- [ ] Gráfico de linha (evolução temporal)
- [ ] Gráfico de pizza (status de campanhas)
- [ ] Heatmap de horários de envio

### Exportação
- [ ] Export de relatórios em PDF
- [ ] Export de dados em CSV/Excel
- [ ] Agendamento de relatórios
- [ ] Compartilhamento de relatórios

---

## 🧪 **FASE 8: Testes e Refinamentos (Semana 13-14)**

### Testes de Funcionalidade
- [ ] Testes de autenticação
- [ ] Testes de CRUD de campanhas
- [ ] Testes de execução de campanhas
- [ ] Testes de integrações

### Testes de Performance
- [ ] Teste de carga do sistema de filas
- [ ] Otimização de queries do banco
- [ ] Teste de envio em massa
- [ ] Monitoramento de memory leaks

### Testes de Segurança
- [ ] Validação de RLS
- [ ] Teste de injeção SQL
- [ ] Validação de autenticação
- [ ] Teste de exposição de dados

### Refinamentos de UX/UI
- [ ] Melhoria na responsividade
- [ ] Otimização de carregamento
- [ ] Feedback visual para ações
- [ ] Mensagens de erro mais claras

### Documentação
- [ ] Documentação de API
- [ ] Manual do usuário
- [ ] Guia de instalação
- [ ] Documentação técnica

---

## 🚀 **TAREFAS CRÍTICAS PRIORITÁRIAS**

### Alta Prioridade (Fazer Primeiro)
- [ ] **Configurar Supabase e variáveis de ambiente**
- [ ] **Criar estrutura do banco de dados completa**
- [ ] **Implementar CRUD de configurações de API**
- [ ] **Sistema básico de campanhas funcionando**
- [ ] **Integração com pelo menos uma API (Evolution)**

### Média Prioridade 
- [ ] **Sistema de filas funcionando**
- [ ] **Controles de pausa/resume**
- [ ] **Integração com Google Sheets**
- [ ] **Dashboard com métricas básicas**

### Baixa Prioridade (Pode ser feito depois)
- [ ] Agendamentos avançados
- [ ] Relatórios detalhados
- [ ] Exportações
- [ ] Otimizações de performance

---

## 🔍 **CHECKLIST DE QUALIDADE**

### Antes de Cada Deploy
- [ ] Todos os formulários têm validação
- [ ] Tratamento de erros implementado
- [ ] Loading states em operações assíncronas
- [ ] Responsividade testada
- [ ] Performance aceitável (< 3s carregamento)

### Antes do Release Final
- [ ] Todos os dados sensíveis estão criptografados
- [ ] RLS configurado corretamente
- [ ] Backup strategy implementada
- [ ] Logs de auditoria funcionando
- [ ] Documentação completa
- [ ] Testes de carga realizados

---

## 📱 **CHECKLIST DE RESPONSIVIDADE**

### Mobile (< 768px)
- [x] Sidebar colapsável
- [x] Menu hamburger funcional
- [x] Cards empilhados
- [ ] Formulários otimizados para mobile
- [ ] Tabelas com scroll horizontal

### Tablet (768px - 1024px)
- [x] Layout adaptado
- [x] Sidebar visível
- [ ] Grids responsivos
- [ ] Modais centrados

### Desktop (> 1024px)
- [x] Layout completo
- [x] Sidebar fixa
- [x] Múltiplas colunas
- [x] Hover states

---

Este checklist serve como guia de desenvolvimento e deve ser atualizado conforme o progresso do projeto. Cada item marcado representa uma funcionalidade testada e validada.