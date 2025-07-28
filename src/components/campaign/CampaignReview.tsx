'use client'

import React from 'react';
import { CheckCircle, Users, MessageSquare, Clock, Settings, Zap, Globe } from 'lucide-react';
import { ApiConfiguration } from '../../types/api';
import { CampaignContactForm, CampaignMessageForm, SendingConfigurationForm } from '../../types/campaign';

interface CampaignReviewProps {
  basicData: {
    name: string;
    api_config_id: string;
    google_sheets_url: string;
    sheet_id_column: string;
    scheduled_at: string;
  };
  contacts: CampaignContactForm[];
  messages: CampaignMessageForm[];
  sendingConfig: SendingConfigurationForm;
  apiConfigurations: ApiConfiguration[];
}

export const CampaignReview: React.FC<CampaignReviewProps> = ({ 
  basicData,
  contacts,
  messages,
  sendingConfig,
  apiConfigurations
}) => {
  const selectedApi = apiConfigurations.find(api => api.id === basicData.api_config_id);
  
  const getApiTypeLabel = (type: string) => {
    switch (type) {
      case 'evolution_web':
        return 'Evolution Web';
      case 'evolution_cloud':
        return 'Evolution Cloud';
      case 'meta_cloud':
        return 'Meta Cloud';
      default:
        return type;
    }
  };

  const calculateEstimatedTime = () => {
    if (contacts.length === 0) return '0 min';
    
    const totalMessages = contacts.length * messages.length;
    const averageDelay = (sendingConfig.min_delay_seconds + sendingConfig.max_delay_seconds) / 2;
    const totalSeconds = totalMessages * averageDelay;
    
    // Adicionar tempo de pausas
    const numberOfPauses = Math.floor(totalMessages / sendingConfig.pause_after_messages);
    const pauseTime = numberOfPauses * sendingConfig.pause_duration_seconds;
    
    const totalTimeSeconds = totalSeconds + pauseTime;
    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revisão e Confirmação
        </h3>
        <p className="text-gray-600 mb-6">
          Revise todos os dados da campanha antes de criar. Verifique se tudo está correto.
        </p>
      </div>

      {/* Resumo Geral */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Resumo da Campanha</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
              <p className="text-sm text-gray-600">Contatos</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
              <p className="text-sm text-gray-600">Mensagens</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{calculateEstimatedTime()}</p>
              <p className="text-sm text-gray-600">Tempo Estimado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <span>Informações Básicas</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome da Campanha</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {basicData.name}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Configuração de API</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>{selectedApi?.name} ({getApiTypeLabel(selectedApi?.api_type || '')})</span>
            </p>
          </div>
          
          {basicData.google_sheets_url && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>Google Sheets</span>
              </label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md break-all">
                {basicData.google_sheets_url}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Coluna ID: {basicData.sheet_id_column}
              </p>
            </div>
          )}
          
          {basicData.scheduled_at && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Agendamento</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {new Date(basicData.scheduled_at).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contatos */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span>Contatos ({contacts.length})</span>
        </h4>
        
        {contacts.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Com nome:</span>
                <span className="ml-2 text-gray-900">
                  {contacts.filter(c => c.name).length}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Com ID externo:</span>
                <span className="ml-2 text-gray-900">
                  {contacts.filter(c => c.external_id).length}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Com campos personalizados:</span>
                <span className="ml-2 text-gray-900">
                  {contacts.filter(c => c.custom_fields && Object.keys(c.custom_fields).length > 0).length}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Primeiros 5 contatos:</p>
              <div className="space-y-1">
                {contacts.slice(0, 5).map((contact, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <span className="font-medium">{contact.phone_number}</span>
                    {contact.name && <span className="ml-2">- {contact.name}</span>}
                    {contact.external_id && <span className="ml-2">(ID: {contact.external_id})</span>}
                  </div>
                ))}
                {contacts.length > 5 && (
                  <p className="text-sm text-gray-500 italic">
                    ... e mais {contacts.length - 5} contatos
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhum contato adicionado</p>
        )}
      </div>

      {/* Mensagens */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <span>Mensagens ({messages.length})</span>
        </h4>
        
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                    Mensagem {index + 1}
                  </span>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded capitalize">
                    {message.content_type}
                  </span>
                </div>
                
                {message.media_url && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-700">Mídia:</p>
                    <p className="text-xs text-blue-600 break-all">{message.media_url}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Conteúdo:</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma mensagem criada</p>
        )}
      </div>

      {/* Configurações de Envio */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span>Configurações de Envio</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Delay entre mensagens:</span>
            <span className="ml-2 text-gray-900">
              {sendingConfig.min_delay_seconds}s - {sendingConfig.max_delay_seconds}s
            </span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Pausa automática:</span>
            <span className="ml-2 text-gray-900">
              A cada {sendingConfig.pause_after_messages} mensagens por {Math.round(sendingConfig.pause_duration_seconds / 60)}min
            </span>
          </div>
          
          {sendingConfig.daily_limit && (
            <div>
              <span className="font-medium text-gray-700">Limite diário:</span>
              <span className="ml-2 text-gray-900">{sendingConfig.daily_limit} mensagens</span>
            </div>
          )}
          
          {sendingConfig.allowed_hours_start && sendingConfig.allowed_hours_end && (
            <div>
              <span className="font-medium text-gray-700">Horário permitido:</span>
              <span className="ml-2 text-gray-900">
                {sendingConfig.allowed_hours_start} às {sendingConfig.allowed_hours_end}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas Finais */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-4">Estatísticas da Campanha</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-green-700">Total de envios:</span>
            <span className="ml-2 text-green-900 font-bold">
              {contacts.length * messages.length}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-green-700">Tempo estimado:</span>
            <span className="ml-2 text-green-900 font-bold">
              {calculateEstimatedTime()}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-green-700">Pausas previstas:</span>
            <span className="ml-2 text-green-900 font-bold">
              {Math.floor((contacts.length * messages.length) / sendingConfig.pause_after_messages)}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-green-700">Status:</span>
            <span className="ml-2 text-green-900 font-bold">
              {basicData.scheduled_at ? 'Agendada' : 'Pronta para envio'}
            </span>
          </div>
        </div>
      </div>

      {/* Aviso Final */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h5 className="font-medium text-yellow-900 mb-2">⚠️ Importante</h5>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Verifique se todos os dados estão corretos antes de criar a campanha</li>
          <li>• A campanha não poderá ser editada após o início do envio</li>
          <li>• Certifique-se de que sua API está funcionando corretamente</li>
          <li>• Monitore a campanha após o início para verificar a taxa de entrega</li>
        </ul>
      </div>
    </div>
  );
};