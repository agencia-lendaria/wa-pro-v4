import { supabase } from '../lib/supabase';
import { 
  Campaign, 
  CampaignForm, 
  CampaignMessage, 
  CampaignMessageForm,
  CampaignContact,
  CampaignContactForm,
  SendingConfiguration,
  SendingConfigurationForm,
  CampaignWithDetails,
  CampaignStats,
  ContactImportResult
} from '../types/campaign';

export class CampaignService {
  // Buscar todas as campanhas do usuário
  static async getCampaigns(): Promise<Campaign[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar campanha por ID com detalhes completos
  static async getCampaignById(id: string): Promise<CampaignWithDetails | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Buscar campanha principal
    const { data: campaign, error: campaignError } = await supabase
      .from('wa_dispatcher_v4_campaigns')
      .select(`
        *,
        wa_dispatcher_v4_api_configurations!inner(
          id,
          name,
          api_type,
          is_active
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (campaignError) throw campaignError;
    if (!campaign) return null;

    // Buscar mensagens
    const { data: messages, error: messagesError } = await supabase
      .from('wa_dispatcher_v4_campaign_messages')
      .select('*')
      .eq('campaign_id', id)
      .order('order_index', { ascending: true });

    if (messagesError) throw messagesError;

    // Buscar contatos
    const { data: contacts, error: contactsError } = await supabase
      .from('wa_dispatcher_v4_campaign_contacts')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: true });

    if (contactsError) throw contactsError;

    // Buscar configuração de envio
    const { data: sendingConfig, error: sendingError } = await supabase
      .from('wa_dispatcher_v4_sending_configurations')
      .select('*')
      .eq('campaign_id', id)
      .single();

    if (sendingError && sendingError.code !== 'PGRST116') throw sendingError;

    return {
      ...campaign,
      messages: messages || [],
      contacts: contacts || [],
      sending_configuration: sendingConfig,
      api_configuration: campaign.wa_dispatcher_v4_api_configurations
    };
  }

  // Criar nova campanha
  static async createCampaign(formData: CampaignForm): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const campaignData = {
      user_id: user.id,
      api_config_id: formData.api_config_id,
      name: formData.name,
      status: 'draft' as const,
      google_sheets_url: formData.google_sheets_url || null,
      sheet_id_column: formData.sheet_id_column || null,
      scheduled_at: formData.scheduled_at || null
    };

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Atualizar campanha
  static async updateCampaign(id: string, formData: Partial<CampaignForm>): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const updateData = {
      ...formData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_campaigns')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Deletar campanha e dados relacionados
  static async deleteCampaign(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se campanha não está rodando
    const { data: campaign } = await supabase
      .from('wa_dispatcher_v4_campaigns')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (campaign?.status === 'running') {
      throw new Error('Não é possível deletar uma campanha em execução');
    }

    const { error } = await supabase
      .from('wa_dispatcher_v4_campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Atualizar status da campanha
  static async updateCampaignStatus(id: string, status: Campaign['status']): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Definir timestamps baseado no status
    if (status === 'running' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_campaigns')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Operações com mensagens da campanha
  static async addCampaignMessage(campaignId: string, messageData: CampaignMessageForm): Promise<CampaignMessage> {
    const { data, error } = await supabase
      .from('wa_dispatcher_v4_campaign_messages')
      .insert({
        campaign_id: campaignId,
        ...messageData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCampaignMessage(messageId: string, messageData: Partial<CampaignMessageForm>): Promise<CampaignMessage> {
    const { data, error } = await supabase
      .from('wa_dispatcher_v4_campaign_messages')
      .update(messageData)
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCampaignMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('wa_dispatcher_v4_campaign_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  }

  // Operações com contatos da campanha
  static async addCampaignContacts(campaignId: string, contacts: CampaignContactForm[]): Promise<CampaignContact[]> {
    const contactsData = contacts.map(contact => ({
      campaign_id: campaignId,
      ...contact
    }));

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_campaign_contacts')
      .insert(contactsData)
      .select();

    if (error) throw error;
    return data || [];
  }

  static async updateCampaignContact(contactId: string, contactData: Partial<CampaignContactForm>): Promise<CampaignContact> {
    const updateData = {
      ...contactData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_campaign_contacts')
      .update(updateData)
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCampaignContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('wa_dispatcher_v4_campaign_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  }

  // Configuração de envio
  static async setSendingConfiguration(campaignId: string, config: SendingConfigurationForm): Promise<SendingConfiguration> {
    // Verificar se já existe uma configuração
    const { data: existing } = await supabase
      .from('wa_dispatcher_v4_sending_configurations')
      .select('id')
      .eq('campaign_id', campaignId)
      .single();

    if (existing) {
      // Atualizar existente
      const { data, error } = await supabase
        .from('wa_dispatcher_v4_sending_configurations')
        .update(config)
        .eq('campaign_id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Criar nova
      const { data, error } = await supabase
        .from('wa_dispatcher_v4_sending_configurations')
        .insert({
          campaign_id: campaignId,
          ...config
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // Obter estatísticas da campanha
  static async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    const { data: contacts, error } = await supabase
      .from('wa_dispatcher_v4_campaign_contacts')
      .select('status')
      .eq('campaign_id', campaignId);

    if (error) throw error;

    const stats = contacts?.reduce((acc, contact) => {
      acc.total_contacts++;
      switch (contact.status) {
        case 'sent':
          acc.contacts_sent++;
          break;
        case 'failed':
          acc.contacts_failed++;
          break;
        case 'pending':
        default:
          acc.contacts_pending++;
          break;
      }
      return acc;
    }, {
      total_contacts: 0,
      contacts_sent: 0,
      contacts_failed: 0,
      contacts_pending: 0,
      success_rate: 0
    }) || {
      total_contacts: 0,
      contacts_sent: 0,
      contacts_failed: 0,
      contacts_pending: 0,
      success_rate: 0
    };

    // Calcular taxa de sucesso
    if (stats.total_contacts > 0) {
      stats.success_rate = Math.round((stats.contacts_sent / stats.total_contacts) * 100);
    }

    return stats;
  }

  // Importar contatos de CSV
  static parseCSVContacts(csvText: string): ContactImportResult {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const result: ContactImportResult = {
      success_count: 0,
      error_count: 0,
      errors: [],
      preview: []
    };

    // Mapear colunas necessárias
    const phoneIndex = headers.findIndex(h => h.includes('telefone') || h.includes('phone') || h.includes('numero'));
    const nameIndex = headers.findIndex(h => h.includes('nome') || h.includes('name'));
    const idIndex = headers.findIndex(h => h.includes('id'));

    if (phoneIndex === -1) {
      result.errors.push({
        row: 0,
        field: 'telefone',
        message: 'Coluna de telefone não encontrada (telefone, phone, numero)'
      });
      return result;
    }

    // Processar linhas de dados
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        result.errors.push({
          row: i + 1,
          field: 'geral',
          message: 'Número de colunas não confere com o cabeçalho'
        });
        result.error_count++;
        continue;
      }

      const phoneNumber = values[phoneIndex]?.replace(/\D/g, '');
      
      if (!phoneNumber || phoneNumber.length < 10) {
        result.errors.push({
          row: i + 1,
          field: 'telefone',
          message: 'Número de telefone inválido'
        });
        result.error_count++;
        continue;
      }

      const contact: CampaignContactForm = {
        phone_number: phoneNumber,
        name: nameIndex >= 0 ? values[nameIndex] : undefined,
        external_id: idIndex >= 0 ? values[idIndex] : undefined,
        custom_fields: {}
      };

      // Adicionar campos customizados
      headers.forEach((header, index) => {
        if (index !== phoneIndex && index !== nameIndex && index !== idIndex && values[index]) {
          contact.custom_fields![header] = values[index];
        }
      });

      result.preview.push(contact);
      result.success_count++;
    }

    return result;
  }

  // Substituir variáveis na mensagem
  static processMessageVariables(message: string, contact: CampaignContact): string {
    let processedMessage = message;

    // Substituir variáveis básicas
    processedMessage = processedMessage.replace(/\{\{nome\}\}/gi, contact.name || 'Cliente');
    processedMessage = processedMessage.replace(/\{\{telefone\}\}/gi, contact.phone_number);
    processedMessage = processedMessage.replace(/\{\{id\}\}/gi, contact.external_id || '');

    // Substituir campos customizados
    if (contact.custom_fields) {
      Object.entries(contact.custom_fields).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
        processedMessage = processedMessage.replace(regex, String(value || ''));
      });
    }

    return processedMessage;
  }
}