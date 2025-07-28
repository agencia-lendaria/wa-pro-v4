'use client'

import React, { useState } from 'react';
import { Plus, Play, Pause, Square, Edit2, Trash2, Users, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';
import { Campaign } from '../types/campaign';
import { CampaignWizard } from '../components/CampaignWizard';

export const Campaigns: React.FC = () => {
  const { campaigns, loading, error, deleteCampaign, updateCampaignStatus } = useCampaigns();
  const [showWizard, setShowWizard] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
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
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(campaignId);
      await updateCampaignStatus(campaignId, newStatus);
    } catch (err) {
      alert(`Erro ao atualizar status: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    if (actionLoading) return;
    
    if (campaign.status === 'running') {
      alert('Não é possível deletar uma campanha em execução');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir a campanha "${campaign.name}"?`)) {
      return;
    }

    try {
      setActionLoading(campaign.id);
      await deleteCampaign(campaign.id);
    } catch (err) {
      alert(`Erro ao deletar campanha: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNewCampaign = () => {
    setEditingCampaign(null);
    setShowWizard(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowWizard(true);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    setEditingCampaign(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas campanhas de mensagens</p>
        </div>
        <button 
          onClick={handleNewCampaign}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Campanha</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

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
        
        {campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha criada</h3>
            <p className="text-gray-600 mb-4">Comece criando sua primeira campanha de mensagens</p>
            <button
              onClick={handleNewCampaign}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeira Campanha</span>
            </button>
          </div>
        ) : (
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">API:</span> {campaign.api_config_id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {campaign.scheduled_at ? (
                          <span><span className="font-medium">Agendada:</span> {new Date(campaign.scheduled_at).toLocaleString('pt-BR')}</span>
                        ) : (
                          <span><span className="font-medium">Criada:</span> {new Date(campaign.created_at).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                      {campaign.google_sheets_url && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Google Sheets:</span> Integrado
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2 lg:ml-4 flex-shrink-0">
                    {/* Botão Ver Detalhes */}
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                      title="Ver Detalhes"
                      onClick={() => alert('Funcionalidade de detalhes será implementada na próxima fase')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Controles de Status */}
                    {campaign.status === 'draft' && (
                      <button 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50" 
                        title="Iniciar Campanha"
                        disabled={actionLoading === campaign.id}
                        onClick={() => handleStatusChange(campaign.id, 'running')}
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    {campaign.status === 'running' && (
                      <button 
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors disabled:opacity-50" 
                        title="Pausar"
                        disabled={actionLoading === campaign.id}
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    
                    {campaign.status === 'paused' && (
                      <button 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50" 
                        title="Retomar"
                        disabled={actionLoading === campaign.id}
                        onClick={() => handleStatusChange(campaign.id, 'running')}
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    {(campaign.status === 'running' || campaign.status === 'paused') && (
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50" 
                        title="Parar"
                        disabled={actionLoading === campaign.id}
                        onClick={() => handleStatusChange(campaign.id, 'failed')}
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Editar (apenas para rascunhos) */}
                    {campaign.status === 'draft' && (
                      <button 
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors" 
                        title="Editar"
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Excluir (não permitido para campanhas em execução) */}
                    <button 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50" 
                      title={campaign.status === 'running' ? 'Não é possível excluir campanha em execução' : 'Excluir'}
                      disabled={campaign.status === 'running' || actionLoading === campaign.id}
                      onClick={() => handleDelete(campaign)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Wizard Modal */}
      {showWizard && (
        <CampaignWizard
          campaign={editingCampaign}
          onClose={handleWizardClose}
        />
      )}
    </div>
  );
};