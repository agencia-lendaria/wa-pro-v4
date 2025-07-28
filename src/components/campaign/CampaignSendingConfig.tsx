'use client'

import React from 'react';
import { Clock, Pause, Users, Calendar } from 'lucide-react';
import { SendingConfigurationForm } from '../../types/campaign';

interface CampaignSendingConfigProps {
  data: SendingConfigurationForm;
  onChange: (data: SendingConfigurationForm) => void;
}

export const CampaignSendingConfig: React.FC<CampaignSendingConfigProps> = ({ 
  data, 
  onChange 
}) => {
  const handleChange = (field: string, value: string | number) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configurações de Envio
        </h3>
        <p className="text-gray-600 mb-6">
          Configure delays, pausas e limites para evitar bloqueios e otimizar a entrega.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delays entre Mensagens */}
        <div className="md:col-span-2">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Intervalo entre Mensagens</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Mínimo (segundos) *
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={data.min_delay_seconds}
                onChange={(e) => handleChange('min_delay_seconds', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo mínimo entre cada envio (recomendado: 5s)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Máximo (segundos) *
              </label>
              <input
                type="number"
                min={data.min_delay_seconds}
                max="300"
                value={data.max_delay_seconds}
                onChange={(e) => handleChange('max_delay_seconds', parseInt(e.target.value) || data.min_delay_seconds)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo máximo entre cada envio (recomendado: 10s)
              </p>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> O sistema escolherá aleatoriamente um tempo entre o mínimo e máximo 
              para cada mensagem, simulando comportamento mais natural.
            </p>
          </div>
        </div>

        {/* Configurações de Pausa */}
        <div className="md:col-span-2">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Pause className="w-5 h-5 text-orange-600" />
            <span>Pausas Automáticas</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pausar após X mensagens *
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={data.pause_after_messages}
                onChange={(e) => handleChange('pause_after_messages', parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de mensagens antes de pausar (recomendado: 50)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração da pausa (segundos) *
              </label>
              <input
                type="number"
                min="60"
                max="3600"
                value={data.pause_duration_seconds}
                onChange={(e) => handleChange('pause_duration_seconds', parseInt(e.target.value) || 300)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo de pausa em segundos (recomendado: 300s = 5min)
              </p>
            </div>
          </div>
        </div>

        {/* Limite Diário */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-600" />
            <span>Limite Diário</span>
          </h4>
          <input
            type="number"
            min="1"
            max="10000"
            value={data.daily_limit || ''}
            onChange={(e) => handleChange('daily_limit', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Opcional (ex: 1000)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo de mensagens por dia (deixe vazio para ilimitado)
          </p>
        </div>

        {/* Horários Permitidos */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Horários Permitidos</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Início</label>
              <input
                type="time"
                value={data.allowed_hours_start || ''}
                onChange={(e) => handleChange('allowed_hours_start', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Fim</label>
              <input
                type="time"
                value={data.allowed_hours_end || ''}
                onChange={(e) => handleChange('allowed_hours_end', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Opcional: Horário para envio (ex: 09:00 às 18:00)
          </p>
        </div>
      </div>

      {/* Resumo das Configurações */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Resumo das Configurações</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Delay:</span>
            <span className="font-medium text-gray-900 ml-2">
              {data.min_delay_seconds}s - {data.max_delay_seconds}s
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Pausa:</span>
            <span className="font-medium text-gray-900 ml-2">
              A cada {data.pause_after_messages} mensagens por {Math.round(data.pause_duration_seconds / 60)}min
            </span>
          </div>
          
          {data.daily_limit && (
            <div>
              <span className="text-gray-600">Limite diário:</span>
              <span className="font-medium text-gray-900 ml-2">
                {data.daily_limit} mensagens
              </span>
            </div>
          )}
          
          {data.allowed_hours_start && data.allowed_hours_end && (
            <div>
              <span className="text-gray-600">Horário:</span>
              <span className="font-medium text-gray-900 ml-2">
                {data.allowed_hours_start} às {data.allowed_hours_end}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Alertas e Dicas */}
      <div className="space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h5 className="font-medium text-yellow-900 mb-1">⚠️ Dicas Importantes</h5>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Delays muito baixos podem causar bloqueios pelo WhatsApp</li>
            <li>• Pausas regulares ajudam a manter a conta segura</li>
            <li>• Respeite horários comerciais para melhor engajamento</li>
            <li>• Teste com poucos contatos antes de grandes campanhas</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-900 mb-1">✅ Configurações Recomendadas</h5>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• <strong>Delay:</strong> 5-10 segundos (configuração atual)</li>
            <li>• <strong>Pausa:</strong> A cada 50 mensagens por 5 minutos</li>
            <li>• <strong>Horário:</strong> 09:00 às 18:00 em dias úteis</li>
            <li>• <strong>Limite:</strong> Máximo 1000 mensagens por dia</li>
          </ul>
        </div>
      </div>
    </div>
  );
};