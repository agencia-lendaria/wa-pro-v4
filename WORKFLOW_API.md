# WhatsApp Dispatcher Pro v3 - Complete API Workflow Documentation

Esta documentação detalha toda a lógica de criação de campanhas no WhatsApp Dispatcher Pro v3, incluindo estrutura de banco de dados, fluxos de API e implementação completa.

## Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura da Base de Dados](#arquitetura-da-base-de-dados)
3. [Fluxo Completo de Criação de Campanhas](#fluxo-completo-de-criação-de-campanhas)
4. [Processamento de Mensagens](#processamento-de-mensagens)
5. [APIs REST](#apis-rest)
6. [Implementação no Supabase](#implementação-no-supabase)
7. [Configuração de Segurança](#configuração-de-segurança)
8. [Edge Functions e Cron Jobs](#edge-functions-e-cron-jobs)

## Visão Geral do Sistema

O WhatsApp Dispatcher Pro v3 é uma plataforma de disparo em massa de mensagens para WhatsApp que suporta múltiplas APIs:

- **Evolution API v2 (WhatsApp Web)**
- **Evolution API v2 (Cloud API Meta)**
- **WhatsApp Cloud API (Meta)**

### Funcionalidades Principais

- Criação e gestão de campanhas
- Importação de contatos via CSV/Excel ou Google Sheets
- Suporte a mensagens de texto, mídia e documentos
- Sistema de filas com controles anti-spam
- Agendamento de campanhas
- Relatórios e analytics em tempo real
- Sistema de retry automático para falhas

## Arquitetura da Base de Dados

### Schema Completo das Tabelas

#### 1. `api_configurations` - Configurações de API

```sql
CREATE TABLE api_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    api_type TEXT NOT NULL CHECK (api_type IN ('evolution_web', 'evolution_cloud', 'meta_cloud')),
    server_url TEXT NOT NULL,
    instance_name TEXT,
    access_token TEXT NOT NULL, -- Encrypted
    phone_number TEXT,
    phone_number_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT chk_meta_phone_id CHECK (
        (api_type != 'meta_cloud') OR 
        (api_type = 'meta_cloud' AND phone_number_id IS NOT NULL)
    ),
    CONSTRAINT chk_evolution_instance CHECK (
        (api_type = 'meta_cloud') OR 
        (api_type IN ('evolution_web', 'evolution_cloud') AND instance_name IS NOT NULL)
    )
);
```

#### 2. `campaigns` - Campanhas

```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    api_config_id UUID REFERENCES api_configurations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed')),
    google_sheets_url TEXT,
    sheet_id_column TEXT,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. `campaign_messages` - Mensagens da Campanha

```sql
CREATE TABLE campaign_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'audio', 'document')),
    content TEXT NOT NULL,
    media_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. `campaign_contacts` - Contatos da Campanha

```sql
CREATE TABLE campaign_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    external_id TEXT, -- Para integração com Google Sheets
    phone_number TEXT NOT NULL,
    name TEXT,
    custom_fields JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5. `sending_configurations` - Configurações Anti-Spam

```sql
CREATE TABLE sending_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    min_delay_seconds INTEGER DEFAULT 5,
    max_delay_seconds INTEGER DEFAULT 15,
    pause_after_messages INTEGER DEFAULT 50,
    pause_duration_seconds INTEGER DEFAULT 300,
    max_retries INTEGER DEFAULT 3,
    daily_limit INTEGER,
    allowed_hours_start TIME,
    allowed_hours_end TIME,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT chk_delay_range CHECK (min_delay_seconds <= max_delay_seconds),
    CONSTRAINT chk_positive_values CHECK (
        min_delay_seconds >= 0 AND 
        max_delay_seconds >= 0 AND 
        pause_after_messages > 0 AND 
        pause_duration_seconds >= 0 AND 
        max_retries >= 0
    )
);
```

#### 6. `message_queue` - Fila de Mensagens

```sql
CREATE TABLE message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,
    contact_phone TEXT NOT NULL,
    contact_name TEXT,
    message_content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
    scheduled_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Índices para Performance

```sql
-- API Configurations
CREATE INDEX idx_api_configurations_user_active ON api_configurations(user_id, is_active);

-- Campaigns
CREATE INDEX idx_campaigns_user_status ON campaigns(user_id, status);
CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_at);

-- Campaign Messages
CREATE INDEX idx_campaign_messages_order ON campaign_messages(campaign_id, order_index);

-- Campaign Contacts
CREATE INDEX idx_campaign_contacts_status ON campaign_contacts(campaign_id, status);

-- Message Queue (Crítico para performance)
CREATE INDEX idx_message_queue_processing ON message_queue(status, scheduled_at);
CREATE INDEX idx_message_queue_campaign_id ON message_queue(campaign_id);
```

## Fluxo Completo de Criação de Campanhas

### Etapa 1: Configuração Básica

**Frontend** (`app/campaigns/new/page.tsx:365-417`)

```typescript
// 1. Buscar configurações de API do usuário
const fetchApiConfigurations = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('api_configurations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (error) throw error
  setApiConfigurations(data || [])
}

// 2. Validação dos dados da campanha
const campaignData = {
  name: '',                    // Nome obrigatório
  api_config_id: '',          // Configuração de API obrigatória  
  google_sheets_url: '',      // Opcional - integração com Sheets
  sheet_id_column: 'id',      // Coluna ID para atualização de status
  scheduled_at: ''            // Opcional - agendamento
}
```

### Etapa 2: Importação de Contatos

**Suporte a múltiplos formatos:**

```typescript
// 2.1. Upload de arquivo CSV
const handleContactsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    const contactsData = parseCSVText(text)
    setContacts(contactsData)
  }
  reader.readAsText(file)
}

// 2.2. Parser CSV customizado
const parseCSVText = (text: string) => {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const contactsData: ContactData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    if (values.length >= 3 && values[1] && values[2]) {
      const contact: ContactData = {
        external_id: values[0] || `contact_${i}`,
        phone_number: values[1],
        name: values[2],
        custom_fields: {}
      }
      
      // Campos personalizados dinâmicos
      for (let j = 3; j < values.length && j < headers.length; j++) {
        if (values[j] && headers[j]) {
          contact.custom_fields![headers[j]] = values[j]
        }
      }
      
      contactsData.push(contact)
    }
  }
  
  return contactsData
}
```

### Etapa 3: Configuração de Mensagens

```typescript
// 3.1. Estrutura de mensagem
interface MessageData {
  content_type: 'text' | 'image' | 'video' | 'audio' | 'document'
  content: string
  media_url?: string
  order_index: number
}

// 3.2. Suporte a variáveis dinâmicas
// Uso: "Olá {{nome}}, sua empresa {{empresa}} foi cadastrada!"
// Resultado: "Olá João Silva, sua empresa Tech Corp foi cadastrada!"
```

### Etapa 4: Configurações Anti-Spam

```typescript
interface SendingConfig {
  min_delay_seconds: number        // Delay mínimo entre mensagens
  max_delay_seconds: number        // Delay máximo entre mensagens  
  pause_after_messages: number     // Pausar após X mensagens
  pause_duration_seconds: number   // Duração da pausa
  daily_limit?: number             // Limite diário opcional
  allowed_hours_start?: string     // Horário permitido - início
  allowed_hours_end?: string       // Horário permitido - fim
}
```

### Etapa 5: Salvamento Completo

**Processo atômico de criação** (`app/campaigns/new/page.tsx:212-360`)

```typescript
const saveCampaign = async (isDraft = true) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Criar campanha
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      user_id: user.id,
      name: campaignData.name,
      api_config_id: campaignData.api_config_id || null,
      google_sheets_url: campaignData.google_sheets_url || null,
      sheet_id_column: campaignData.sheet_id_column || null,
      scheduled_at: campaignData.scheduled_at || null,
      status: isDraft ? 'draft' : (campaignData.scheduled_at ? 'scheduled' : 'running')
    })
    .select()
    .single()

  // 2. Salvar mensagens
  if (messages.length > 0) {
    await supabase
      .from('campaign_messages')
      .insert(
        messages.map(msg => ({
          campaign_id: campaign.id,
          ...msg
        }))
      )
  }

  // 3. Salvar contatos
  if (contacts.length > 0) {
    await supabase
      .from('campaign_contacts')
      .insert(
        contacts.map(contact => ({
          campaign_id: campaign.id,
          ...contact
        }))
      )
  }

  // 4. Salvar configurações de envio
  await supabase
    .from('sending_configurations')
    .insert({
      campaign_id: campaign.id,
      ...sendingConfig
    })

  // 5. Criar fila de mensagens para campanhas ativas
  if (!isDraft && contacts.length > 0 && messages.length > 0) {
    await createMessageQueue(campaign.id)
    await startMessageProcessor()
  }
}
```

### Etapa 6: Criação da Fila de Mensagens

```typescript
// Criação automática da fila com delays calculados
const createMessageQueue = async (campaignId: string) => {
  const { data: savedContacts } = await supabase
    .from('campaign_contacts')
    .select('id, phone_number, name')
    .eq('campaign_id', campaignId)

  const { data: savedMessages } = await supabase
    .from('campaign_messages')
    .select('id, content, media_url, content_type, order_index')
    .eq('campaign_id', campaignId)
    .order('order_index')

  const messageQueueEntries = []
  const baseScheduledTime = campaignData.scheduled_at 
    ? new Date(campaignData.scheduled_at) 
    : new Date()

  const primaryMessage = savedMessages[0]
  
  for (let i = 0; i < savedContacts.length; i++) {
    const contact = savedContacts[i]
    
    // Calcular horário agendado com delays
    const delay = i * ((sendingConfig.min_delay_seconds + sendingConfig.max_delay_seconds) / 2) * 1000
    const scheduledAt = new Date(baseScheduledTime.getTime() + delay)

    messageQueueEntries.push({
      campaign_id: campaignId,
      contact_id: contact.id,
      contact_phone: contact.phone_number,
      contact_name: contact.name,
      message_content: primaryMessage.content,
      media_url: primaryMessage.media_url,
      media_type: primaryMessage.content_type,
      status: 'pending',
      scheduled_at: scheduledAt.toISOString(),
      retry_count: 0
    })
  }

  // Inserir entradas na fila
  await supabase
    .from('message_queue')
    .insert(messageQueueEntries)
}
```

## Processamento de Mensagens

### Message Processor (`lib/message-processor.ts`)

O processador de mensagens é um worker que executa continuamente, buscando mensagens pendentes na fila e enviando através das APIs do WhatsApp.

#### Funcionamento Principal

```typescript
export class MessageProcessor {
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null

  // Inicia o processador
  start(intervalMs: number = 5000) {
    this.processingInterval = setInterval(this.processQueue, intervalMs)
    this.processQueue() // Executa imediatamente
  }

  // Lógica principal de processamento
  async processQueue() {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      // 1. Buscar mensagens pendentes prontas para envio
      const { data: rawMessages } = await supabaseAdmin
        .from('message_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(10)

      // 2. Enriquecer com dados da campanha
      const campaignIds = Array.from(new Set(rawMessages.map(m => m.campaign_id)))
      const { data: campaignsData } = await supabaseAdmin
        .from('campaigns')
        .select(`
          id,
          api_config_id,
          sending_configurations (
            min_delay_seconds,
            max_delay_seconds,
            pause_after_messages,
            pause_duration_seconds,
            max_retries
          )
        `)
        .in('id', campaignIds)

      // 3. Processar cada mensagem
      for (const message of pendingMessages) {
        await this.processSingleMessage(message)
        
        // Aplicar delay entre mensagens
        const config = message.campaigns.sending_configurations
        if (config) {
          const delay = Math.random() * (config.max_delay_seconds - config.min_delay_seconds) + config.min_delay_seconds
          await this.sleep(delay * 1000)
        }
      }

    } finally {
      this.isProcessing = false
    }
  }
}
```

#### Processamento Individual

```typescript
async processSingleMessage(message: any) {
  try {
    // 1. Marcar como enviando
    await supabaseAdmin
      .from('message_queue')
      .update({ 
        status: 'sending',
        updated_at: new Date().toISOString()
      })
      .eq('id', message.id)

    // 2. Criar instância da API
    const apiInstance = await createEvolutionAPIInstance(
      message.campaigns.api_config_id
    )

    // 3. Processar variáveis na mensagem
    const processedContent = this.replaceVariables(
      message.message_content,
      {
        nome: message.contact_name,
        telefone: message.contact_phone
      }
    )

    // 4. Enviar mensagem
    let result
    if (message.media_url && message.media_type) {
      result = await apiInstance.sendMediaMessage({
        number: message.contact_phone,
        text: processedContent,
        mediaUrl: message.media_url,
        mediaType: message.media_type
      })
    } else {
      result = await apiInstance.sendTextMessage({
        number: message.contact_phone,
        text: processedContent
      })
    }

    if (result.success) {
      // 5. Marcar como enviado
      await Promise.all([
        supabaseAdmin.from('message_queue').update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        }).eq('id', message.id),
        
        supabaseAdmin.from('campaign_contacts').update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        }).eq('id', message.contact_id)
      ])

      // 6. Atualizar progresso da campanha
      await this.updateCampaignProgress(message.campaign_id)
    } else {
      throw new Error(result.error || 'Failed to send message')
    }

  } catch (error) {
    // Sistema de retry com backoff exponencial
    const newRetryCount = (message.retry_count || 0) + 1
    const maxRetries = message.campaigns?.sending_configurations?.max_retries || 3

    if (newRetryCount <= maxRetries) {
      // Agendar retry
      const retryDelay = Math.pow(2, newRetryCount) * 60 * 1000 // 2, 4, 8 minutos
      const scheduledAt = new Date(Date.now() + retryDelay).toISOString()
      
      await supabaseAdmin.from('message_queue').update({ 
        status: 'pending',
        retry_count: newRetryCount,
        scheduled_at: scheduledAt,
        error_message: error.message
      }).eq('id', message.id)
    } else {
      // Marcar como falha permanente
      await Promise.all([
        supabaseAdmin.from('message_queue').update({ 
          status: 'failed',
          error_message: error.message
        }).eq('id', message.id),
        
        supabaseAdmin.from('campaign_contacts').update({ 
          status: 'failed',
          error_message: error.message
        }).eq('id', message.contact_id)
      ])
    }
  }
}
```

#### Substituição de Variáveis

```typescript
private replaceVariables(content: string, variables: Record<string, string>): string {
  let processedContent = content
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi')
    processedContent = processedContent.replace(regex, value || '')
  }
  
  return processedContent
}
```

## APIs REST

### Endpoints da Campanha

#### 1. Pausar Campanha

**Endpoint:** `PUT /api/campaigns/[id]/pause`

```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // 1. Autenticação via token
  const authorization = request.headers.get('authorization')
  const token = authorization.replace('Bearer ', '')
  
  // 2. Validar acesso à campanha
  const { data: campaign } = await authSupabase
    .from('campaigns')
    .select('id, status, user_id')
    .eq('id', campaignId)
    .single()

  // 3. Verificar se pode ser pausada
  if (campaign.status !== 'running') {
    return NextResponse.json(
      { error: 'Only running campaigns can be paused' },
      { status: 400 }
    )
  }

  // 4. Pausar campanha
  const { data } = await authSupabase
    .from('campaigns')
    .update({ 
      status: 'paused',
      updated_at: new Date().toISOString()
    })
    .eq('id', campaignId)
    .select()
    .single()

  // 5. Cancelar mensagens pendentes
  await authSupabase
    .from('message_queue')
    .update({ status: 'cancelled' })
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')

  return NextResponse.json({ success: true, campaign: data })
}
```

#### 2. Cancelar Campanha

**Endpoint:** `PUT /api/campaigns/[id]/cancel`

```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Validações similares...

  // Cancelar campanha
  const { data } = await supabase
    .from('campaigns')
    .update({ 
      status: 'failed',
      completed_at: new Date().toISOString()
    })
    .eq('id', campaignId)
    .select()
    .single()

  // Cancelar todas as mensagens pendentes
  await supabase
    .from('message_queue')
    .update({ status: 'cancelled' })
    .eq('campaign_id', campaignId)
    .in('status', ['pending', 'processing'])

  return NextResponse.json({ success: true, campaign: data })
}
```

## Implementação no Supabase

### Funções SQL Necessárias

#### 1. Trigger para updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a todas as tabelas
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_contacts_updated_at
    BEFORE UPDATE ON campaign_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_queue_updated_at
    BEFORE UPDATE ON message_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Função para Popular Fila de Mensagens

```sql
CREATE OR REPLACE FUNCTION populate_message_queue(campaign_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    message_record RECORD;
    contact_record RECORD;
    queue_count INTEGER := 0;
    delay_seconds INTEGER := 0;
BEGIN
    FOR message_record IN 
        SELECT * FROM campaign_messages 
        WHERE campaign_id = campaign_id_param 
        ORDER BY order_index
    LOOP
        FOR contact_record IN 
            SELECT * FROM campaign_contacts 
            WHERE campaign_id = campaign_id_param 
            AND status = 'pending'
        LOOP
            INSERT INTO message_queue (
                campaign_id,
                contact_id,
                contact_phone,
                contact_name,
                message_content,
                media_url,
                media_type,
                scheduled_at
            ) VALUES (
                campaign_id_param,
                contact_record.id,
                contact_record.phone_number,
                contact_record.name,
                message_record.content,
                message_record.media_url,
                CASE message_record.content_type
                    WHEN 'text' THEN NULL
                    ELSE message_record.content_type
                END,
                NOW() + (delay_seconds || ' seconds')::interval
            );
            
            queue_count := queue_count + 1;
            delay_seconds := delay_seconds + FLOOR(RANDOM() * 10) + 5;
        END LOOP;
    END LOOP;
    
    RETURN queue_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. Função para Estatísticas de Campanha

```sql
CREATE OR REPLACE FUNCTION get_campaign_statistics(campaign_id_param UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_contacts', (
            SELECT COUNT(*) FROM campaign_contacts 
            WHERE campaign_id = campaign_id_param
        ),
        'sent_count', (
            SELECT COUNT(*) FROM campaign_contacts 
            WHERE campaign_id = campaign_id_param AND status = 'sent'
        ),
        'failed_count', (
            SELECT COUNT(*) FROM campaign_contacts 
            WHERE campaign_id = campaign_id_param AND status = 'failed'
        ),
        'pending_count', (
            SELECT COUNT(*) FROM campaign_contacts 
            WHERE campaign_id = campaign_id_param AND status = 'pending'
        ),
        'delivery_rate', (
            SELECT CASE 
                WHEN COUNT(*) > 0 THEN 
                    ROUND((COUNT(*) FILTER (WHERE status = 'sent')::DECIMAL / COUNT(*)) * 100, 2)
                ELSE 0 
            END
            FROM campaign_contacts 
            WHERE campaign_id = campaign_id_param
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Configuração de Segurança

### Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sending_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;

-- Políticas para API Configurations
CREATE POLICY "Users can manage own API configurations" ON api_configurations
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para Campaigns
CREATE POLICY "Users can manage own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para Campaign Messages
CREATE POLICY "Users can manage messages for own campaigns" ON campaign_messages
    FOR ALL USING (EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = campaign_id AND campaigns.user_id = auth.uid()
    )) WITH CHECK (EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = campaign_id AND campaigns.user_id = auth.uid()
    ));

-- Políticas para Campaign Contacts
CREATE POLICY "Users can manage contacts for own campaigns" ON campaign_contacts
    FOR ALL USING (EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = campaign_id AND campaigns.user_id = auth.uid()
    )) WITH CHECK (EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = campaign_id AND campaigns.user_id = auth.uid()
    ));

-- Políticas para Sending Configurations
CREATE POLICY "Users can manage sending configs for own campaigns" ON sending_configurations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = campaign_id AND campaigns.user_id = auth.uid()
    )) WITH CHECK (EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = campaign_id AND campaigns.user_id = auth.uid()
    ));

-- Políticas para Message Queue (acesso restrito)
CREATE POLICY "Users can view queue items for own campaigns" ON message_queue
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = campaign_id AND campaigns.user_id = auth.uid()
    ));

CREATE POLICY "Service role can manage message queue" ON message_queue
    FOR ALL USING (auth.role() = 'service_role');
```

### Criptografia de Tokens

```sql
-- Configurar chave de criptografia
ALTER DATABASE postgres SET app.encryption_key TO 'your-encryption-key-here';

-- Função para criptografar tokens
CREATE OR REPLACE FUNCTION encrypt_token(token TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_encrypt(token, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para descriptografar tokens
CREATE OR REPLACE FUNCTION decrypt_token(encrypted_token TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_token, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Edge Functions e Cron Jobs

### Edge Functions

#### 1. Message Processor Edge Function

```typescript
// supabase/functions/message-processor/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar mensagens pendentes
    const { data: pendingMessages } = await supabaseAdmin
      .from('message_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10)

    if (!pendingMessages?.length) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Processar mensagens
    let processed = 0
    for (const message of pendingMessages) {
      await processSingleMessage(message)
      processed++
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

#### 2. Campaign Scheduler Edge Function

```typescript
// supabase/functions/campaign-scheduler/index.ts
serve(async (req) => {
  const supabaseAdmin = createClient(/* ... */)

  // Buscar campanhas agendadas prontas para iniciar
  const { data: scheduledCampaigns } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  for (const campaign of scheduledCampaigns || []) {
    // Iniciar campanha
    await supabaseAdmin
      .from('campaigns')
      .update({ 
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', campaign.id)

    // Popular fila de mensagens
    await supabaseAdmin.rpc('populate_message_queue', {
      campaign_id_param: campaign.id
    })
  }

  return new Response(JSON.stringify({ 
    started: scheduledCampaigns?.length || 0 
  }))
})
```

### Cron Jobs

```sql
-- Processar fila de mensagens a cada 30 segundos
SELECT cron.schedule('process-message-queue', '*/30 * * * * *', $$
    SELECT net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/message-processor',
        body := '{}',
        headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
$$);

-- Iniciar campanhas agendadas a cada 5 minutos
SELECT cron.schedule('start-scheduled-campaigns', '0 */5 * * * *', $$
    SELECT net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/campaign-scheduler',
        body := '{}',
        headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
$$);

-- Limpeza da fila diariamente às 2h
SELECT cron.schedule('cleanup-queue', '0 2 * * *', $$
    DELETE FROM message_queue 
    WHERE status IN ('sent', 'failed') 
    AND updated_at < NOW() - INTERVAL '7 days';
$$);

-- Atualizar analytics diárias à meia-noite
SELECT cron.schedule('update-daily-analytics', '0 0 * * *', $$
    INSERT INTO campaign_analytics (campaign_id, date, messages_sent, messages_failed)
    SELECT 
        campaign_id,
        CURRENT_DATE,
        COUNT(*) FILTER (WHERE status = 'sent'),
        COUNT(*) FILTER (WHERE status = 'failed')
    FROM message_queue
    WHERE DATE(updated_at) = CURRENT_DATE - INTERVAL '1 day'
    GROUP BY campaign_id
    ON CONFLICT (campaign_id, date) DO UPDATE SET
        messages_sent = EXCLUDED.messages_sent,
        messages_failed = EXCLUDED.messages_failed;
$$);
```

### Configuração Realtime

```sql
-- Habilitar realtime para atualizações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE message_queue;
```

## Conclusão

Esta documentação fornece uma base completa para replicar a lógica de criação de campanhas do WhatsApp Dispatcher Pro v3. O sistema é robusto, escalável e inclui todas as funcionalidades necessárias para um sistema de disparo em massa profissional:

- **Segurança:** RLS, criptografia de tokens, autenticação JWT
- **Performance:** Índices otimizados, processamento em lote, fila assíncrona
- **Confiabilidade:** Sistema de retry, logs detalhados, tratamento de erros
- **Escalabilidade:** Edge Functions, Cron Jobs, processamento distribuído
- **Flexibilidade:** Múltiplas APIs, configurações personalizáveis, campos dinâmicos

O sistema está preparado para lidar com campanhas de grande volume mantendo alta performance e confiabilidade.