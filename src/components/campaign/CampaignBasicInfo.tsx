'use client'

import React from 'react';
import { Calendar, Globe, Hash, Zap } from 'lucide-react';
import { ApiConfiguration } from '../../types/api';

interface CampaignBasicInfoProps {
  data: {
    name: string;
    api_config_id: string;
    google_sheets_url: string;
    sheet_id_column: string;
    scheduled_at: string;
  };
  apiConfigurations: ApiConfiguration[];
  onChange: (data: any) => void;
}

export const CampaignBasicInfo: React.FC<CampaignBasicInfoProps> = ({ 
  data, 
  apiConfigurations, 
  onChange 
}) => {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

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

  const activeConfigs = apiConfigurations.filter(config => config.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuração Básica da Campanha
        </h3>
        <p className="text-gray-600 mb-6">
          Defina as informações principais da sua campanha de mensagens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome da Campanha */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Campanha *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Promoção Black Friday 2024"
          />
          <p className="text-sm text-gray-500 mt-1">
            Escolha um nome descritivo para identificar facilmente a campanha
          </p>
        </div>

        {/* Configuração de API */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Configuração de API *
          </label>
          <div className="space-y-3">
            {activeConfigs.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Nenhuma configuração de API ativa encontrada. 
                    <a href="/apis" className="font-medium underline ml-1">
                      Configure uma API primeiro
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {activeConfigs.map((config) => (
                  <div key={config.id}>
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="api_config"
                        value={config.id}
                        checked={data.api_config_id === config.id}
                        onChange={(e) => handleChange('api_config_id', e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          config.api_type.includes('evolution') ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <Zap className={`w-5 h-5 ${
                            config.api_type.includes('evolution') ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{config.name}</h4>
                          <p className="text-sm text-gray-600">
                            {getApiTypeLabel(config.api_type)}
                            {config.connection_status === 'connected' && (
                              <span className="ml-2 text-green-600">• Conectada</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Google Sheets URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            URL do Google Sheets (Opcional)
          </label>
          <input
            type="url"
            value={data.google_sheets_url}
            onChange={(e) => handleChange('google_sheets_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
          <p className="text-sm text-gray-500 mt-1">
            URL pública do Google Sheets para sincronizar status de envios
          </p>
        </div>

        {/* Coluna ID */}
        {data.google_sheets_url && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Nome da Coluna ID
            </label>
            <input
              type="text"
              value={data.sheet_id_column}
              onChange={(e) => handleChange('sheet_id_column', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ID"
            />
            <p className="text-sm text-gray-500 mt-1">
              Nome da coluna que contém o ID único de cada contato
            </p>
          </div>
        )}

        {/* Agendamento */}
        <div className={data.google_sheets_url ? '' : 'md:col-span-2'}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Agendamento (Opcional)
          </label>
          <input
            type="datetime-local"
            value={data.scheduled_at}
            onChange={(e) => handleChange('scheduled_at', e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Deixe vazio para iniciar a campanha imediatamente
          </p>
        </div>
      </div>

      {/* Resumo */}
      {data.name && data.api_config_id && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Resumo da Configuração</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p><strong>Campanha:</strong> {data.name}</p>
            <p><strong>API:</strong> {activeConfigs.find(c => c.id === data.api_config_id)?.name}</p>
            {data.google_sheets_url && (
              <p><strong>Google Sheets:</strong> Integração ativa</p>
            )}
            {data.scheduled_at && (
              <p><strong>Agendamento:</strong> {new Date(data.scheduled_at).toLocaleString('pt-BR')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};