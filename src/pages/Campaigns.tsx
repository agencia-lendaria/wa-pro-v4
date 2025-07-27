'use client'

import React, { useState } from 'react';
import { Plus, Play, Pause, Store as Stop, Edit2, Trash2, Users, Clock, CheckCircle } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  contacts: number;
  sent: number;
  delivered: number;
  scheduled_at?: string;
  created_at: string;
}

export const Campaigns: React.FC = () => {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Promoção Black Friday',
      status: 'completed',
      contacts: 1500,
      sent: 1500,
      delivered: 1420,
      created_at: '2024-01-20'
    },
    {
      id: '2',
      name: 'Follow-up Clientes',
      status: 'running',
      contacts: 500,
      sent: 200,
      delivered: 195,
      created_at: '2024-01-22'
    },
    {
      id: '3',
      name: 'Newsletter Semanal',
      status: 'scheduled',
      contacts: 800,
      sent: 0,
      delivered: 0,
      scheduled_at: '2024-01-25T10:00:00',
      created_at: '2024-01-22'
    }
  ]);

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'scheduled': return 'Agendada';
      case 'running': return 'Em Andamento';
      case 'paused': return 'Pausada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas campanhas de mensagens</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Nova Campanha</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Em Andamento</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {campaigns.filter(c => c.status === 'running').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Agendadas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {campaigns.filter(c => c.status === 'scheduled').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Concluídas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {campaigns.filter(c => c.status === 'completed').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{campaigns.length}</p>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Todas as Campanhas</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{campaign.name}</h3>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium self-start ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      <span>{getStatusText(campaign.status)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{campaign.contacts} contatos</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{campaign.sent}</span> enviadas
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{campaign.delivered}</span> entregues
                    </div>
                    <div className="text-sm text-gray-600">
                      {campaign.scheduled_at ? (
                        <span className="block truncate">Agendada: {new Date(campaign.scheduled_at).toLocaleString('pt-BR')}</span>
                      ) : (
                        <span>Criada: {new Date(campaign.created_at).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {campaign.status === 'running' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(campaign.sent / campaign.contacts) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2 lg:ml-4 flex-shrink-0">
                  {campaign.status === 'running' && (
                    <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Pausar">
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  
                  {campaign.status === 'paused' && (
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Retomar">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  {(campaign.status === 'running' || campaign.status === 'paused') && (
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Parar">
                      <Stop className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};