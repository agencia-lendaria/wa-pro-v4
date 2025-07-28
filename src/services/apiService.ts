import { supabase } from '../lib/supabase';
import { ApiConfiguration, ApiConfigurationForm, ApiTestResponse, ApiTestRequest } from '../types/api';

export class ApiService {
  // Buscar todas as configurações de API do usuário
  static async getApiConfigurations(): Promise<ApiConfiguration[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_api_configurations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar configurações ativas
  static async getActiveApiConfigurations(): Promise<ApiConfiguration[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_api_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Criar nova configuração de API
  static async createApiConfiguration(formData: ApiConfigurationForm): Promise<ApiConfiguration> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Usar a função de inserção com criptografia
    const { data, error } = await supabase.rpc('wa_dispatcher_v4_insert_api_config', {
      p_user_id: user.id,
      p_name: formData.name,
      p_api_type: formData.api_type,
      p_instance_name: formData.instance_name || null,
      p_access_token: formData.access_token,
      p_phone_number: formData.phone_number || null,
      p_phone_number_id: formData.phone_number_id || null,
      p_base_url: formData.base_url || null
    });

    if (error) throw error;

    // Buscar a configuração criada
    const { data: newConfig, error: fetchError } = await supabase
      .from('wa_dispatcher_v4_api_configurations')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) throw fetchError;
    return newConfig;
  }

  // Atualizar configuração de API
  static async updateApiConfiguration(id: string, formData: Partial<ApiConfigurationForm>): Promise<ApiConfiguration> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const updateData: any = {
      name: formData.name,
      api_type: formData.api_type,
      instance_name: formData.instance_name || null,
      phone_number: formData.phone_number || null,
      phone_number_id: formData.phone_number_id || null,
      base_url: formData.base_url || null,
      updated_at: new Date().toISOString()
    };

    // Se tem novo token, criptografar
    if (formData.access_token) {
      const { data: encryptedToken, error: encryptError } = await supabase
        .rpc('wa_dispatcher_v4_encrypt_token', { token: formData.access_token });
      
      if (encryptError) throw encryptError;
      updateData.access_token = encryptedToken;
    }

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_api_configurations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Deletar configuração de API
  static async deleteApiConfiguration(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('wa_dispatcher_v4_api_configurations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Alternar status ativo/inativo
  static async toggleApiStatus(id: string, isActive: boolean): Promise<ApiConfiguration> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('wa_dispatcher_v4_api_configurations')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Testar conexão com a API
  static async testApiConnection(id: string): Promise<ApiTestResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Buscar configuração com token descriptografado
    const { data: config, error: configError } = await supabase
      .rpc('wa_dispatcher_v4_get_api_config_with_token', { config_id: id });

    if (configError || !config || config.length === 0) {
      throw new Error('Configuração não encontrada');
    }

    const apiConfig = config[0];

    // Preparar dados para o teste
    const testData: ApiTestRequest = {
      api_type: apiConfig.api_type,
      base_url: apiConfig.base_url || '',
      access_token: apiConfig.access_token || '',
      instance_name: apiConfig.instance_name || undefined,
      phone_number_id: apiConfig.phone_number_id || undefined
    };

    // Chamar a Edge Function de teste
    const { data, error } = await supabase.functions.invoke('test-api-connection', {
      body: testData
    });

    if (error) throw error;

    // Atualizar status da conexão no banco
    const newStatus = data.success ? 'connected' : 'error';
    await supabase
      .from('wa_dispatcher_v4_api_configurations')
      .update({
        connection_status: newStatus,
        last_tested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    return data;
  }

  // Buscar configuração com token para uso interno
  static async getApiConfigurationWithToken(id: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .rpc('wa_dispatcher_v4_get_api_config_with_token', { config_id: id });

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }
}