export interface Campaign {
  id: string;
  user_id: string;
  api_config_id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
  google_sheets_url?: string;
  sheet_id_column?: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignMessage {
  id: string;
  campaign_id: string;
  content_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  media_url?: string;
  order_index: number;
  created_at: string;
}

export interface CampaignContact {
  id: string;
  campaign_id: string;
  external_id?: string;
  phone_number: string;
  name?: string;
  custom_fields?: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SendingConfiguration {
  id: string;
  campaign_id: string;
  min_delay_seconds: number;
  max_delay_seconds: number;
  pause_after_messages: number;
  pause_duration_seconds: number;
  daily_limit?: number;
  allowed_hours_start?: string;
  allowed_hours_end?: string;
  created_at: string;
}

export interface CampaignForm {
  name: string;
  api_config_id: string;
  google_sheets_url?: string;
  sheet_id_column?: string;
  scheduled_at?: string;
}

export interface CampaignMessageForm {
  content_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  media_url?: string;
  order_index: number;
}

export interface CampaignContactForm {
  external_id?: string;
  phone_number: string;
  name?: string;
  custom_fields?: Record<string, any>;
}

export interface SendingConfigurationForm {
  min_delay_seconds: number;
  max_delay_seconds: number;
  pause_after_messages: number;
  pause_duration_seconds: number;
  daily_limit?: number;
  allowed_hours_start?: string;
  allowed_hours_end?: string;
}

export interface CampaignWithDetails extends Campaign {
  messages: CampaignMessage[];
  contacts: CampaignContact[];
  sending_configuration?: SendingConfiguration;
  api_configuration?: {
    id: string;
    name: string;
    api_type: string;
    is_active: boolean;
  };
}

export interface CampaignStats {
  total_contacts: number;
  contacts_sent: number;
  contacts_failed: number;
  contacts_pending: number;
  success_rate: number;
  estimated_completion?: string;
}

export interface ContactImportResult {
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  preview: CampaignContactForm[];
}

export interface CampaignWizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface MessageVariable {
  key: string;
  label: string;
  example: string;
}