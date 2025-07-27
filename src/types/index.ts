export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface ApiConfig {
  id: string;
  user_id: string;
  name: string;
  type: 'evolution_v2' | 'meta_cloud';
  config: EvolutionConfig | MetaCloudConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EvolutionConfig {
  instance_name: string;
  token: string;
  phone_number: string;
  base_url: string;
}

export interface MetaCloudConfig {
  instance_name: string;
  access_token: string;
  phone_number_id: string;
  business_account_id: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  api_config_id: string;
  message_template: MessageTemplate;
  contacts: Contact[];
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  scheduled_at?: string;
  settings: CampaignSettings;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  text?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio' | 'document';
  variations?: string[];
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface CampaignSettings {
  delay_min: number; // seconds
  delay_max: number; // seconds
  pause_after: number; // messages
  pause_duration: number; // seconds
  google_sheets_url?: string;
  update_column?: string;
}

export interface CampaignExecution {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sent_at?: string;
  error_message?: string;
  google_sheets_updated: boolean;
}

export interface Schedule {
  id: string;
  user_id: string;
  campaign_id: string;
  cron_expression: string;
  is_active: boolean;
  last_run?: string;
  next_run: string;
  created_at: string;
}