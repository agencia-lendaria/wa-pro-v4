// Types para as configurações de API
export interface ApiConfiguration {
  id: string;
  user_id: string;
  name: string;
  api_type: 'evolution_web' | 'evolution_cloud' | 'meta_cloud';
  instance_name?: string;
  access_token: string;
  phone_number?: string;
  phone_number_id?: string;
  base_url?: string;
  is_active: boolean;
  connection_status: 'connected' | 'disconnected' | 'unknown' | 'error';
  last_tested_at?: string;
  created_at: string;
  updated_at: string;
}

// Formulário para criar/editar API
export interface ApiConfigurationForm {
  name: string;
  api_type: 'evolution_web' | 'evolution_cloud' | 'meta_cloud';
  instance_name?: string;
  access_token: string;
  phone_number?: string;
  phone_number_id?: string;
  base_url?: string;
}

// Response da função de teste de conexão
export interface ApiTestResponse {
  success: boolean;
  message: string;
  details?: any;
}

// Input para teste de conexão
export interface ApiTestRequest {
  api_type: 'evolution_web' | 'evolution_cloud' | 'meta_cloud';
  base_url: string;
  access_token: string;
  instance_name?: string;
  phone_number_id?: string;
}