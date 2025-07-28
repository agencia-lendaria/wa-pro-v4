'use client'

import React, { useState, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { Campaign, CampaignForm, CampaignWizardStep } from '../types/campaign';
import { useCampaigns } from '../hooks/useCampaigns';
import { useApiConfigurations } from '../hooks/useApiConfigurations';
import { CampaignBasicInfo } from './campaign/CampaignBasicInfo';
import { CampaignContactImport } from './campaign/CampaignContactImport';
import { CampaignMessageEditor } from './campaign/CampaignMessageEditor';
import { CampaignSendingConfig } from './campaign/CampaignSendingConfig';
import { CampaignReview } from './campaign/CampaignReview';

interface CampaignWizardProps {
  campaign?: Campaign | null;
  onClose: () => void;
}

export const CampaignWizard: React.FC<CampaignWizardProps> = ({ campaign, onClose }) => {
  const { createCampaign, updateCampaign } = useCampaigns();
  const { configurations } = useApiConfigurations();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados do wizard
  const [wizardData, setWizardData] = useState({
    basic: {
      name: '',
      api_config_id: '',
      google_sheets_url: '',
      sheet_id_column: 'ID',
      scheduled_at: ''
    },
    contacts: [],
    messages: [],
    sendingConfig: {
      min_delay_seconds: 5,
      max_delay_seconds: 10,
      pause_after_messages: 50,
      pause_duration_seconds: 300,
      daily_limit: undefined,
      allowed_hours_start: '',
      allowed_hours_end: ''
    }
  });

  // Definir os steps do wizard
  const steps: CampaignWizardStep[] = [
    {
      id: 'basic',
      title: 'Informações Básicas',
      description: 'Configure os dados principais da campanha',
      completed: false,
      current: false
    },
    {
      id: 'contacts',
      title: 'Importar Contatos',
      description: 'Adicione os contatos que receberão as mensagens',
      completed: false,
      current: false
    },
    {
      id: 'messages',
      title: 'Criar Mensagens',
      description: 'Componha as mensagens da campanha',
      completed: false,
      current: false
    },
    {
      id: 'sending',
      title: 'Configurações de Envio',
      description: 'Defina delays, pausas e limites',
      completed: false,
      current: false
    },
    {
      id: 'review',
      title: 'Revisão e Confirmação',
      description: 'Revise todos os dados antes de criar',
      completed: false,
      current: false
    }
  ];

  // Atualizar steps com base no step atual
  const [wizardSteps, setWizardSteps] = useState(steps);

  useEffect(() => {
    setWizardSteps(prevSteps => 
      prevSteps.map((step, index) => ({
        ...step,
        current: index === currentStep,
        completed: index < currentStep
      }))
    );
  }, [currentStep]);

  // Inicializar dados se editando campanha existente
  useEffect(() => {
    if (campaign) {
      setWizardData(prev => ({
        ...prev,
        basic: {
          name: campaign.name,
          api_config_id: campaign.api_config_id,
          google_sheets_url: campaign.google_sheets_url || '',
          sheet_id_column: campaign.sheet_id_column || 'ID',
          scheduled_at: campaign.scheduled_at || ''
        }
      }));
    }
  }, [campaign]);

  const handleStepData = (stepId: string, data: any) => {
    setWizardData(prev => ({
      ...prev,
      [stepId]: data
    }));
    setError(null);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Basic Info
        if (!wizardData.basic.name.trim()) {
          setError('Nome da campanha é obrigatório');
          return false;
        }
        if (!wizardData.basic.api_config_id) {
          setError('Selecione uma configuração de API');
          return false;
        }
        break;
      
      case 1: // Contacts
        if (wizardData.contacts.length === 0) {
          setError('Adicione pelo menos um contato');
          return false;
        }
        break;
      
      case 2: // Messages
        if (wizardData.messages.length === 0) {
          setError('Adicione pelo menos uma mensagem');
          return false;
        }
        break;
      
      case 3: // Sending Config
        if (wizardData.sendingConfig.min_delay_seconds < 1) {
          setError('Delay mínimo deve ser pelo menos 1 segundo');
          return false;
        }
        if (wizardData.sendingConfig.max_delay_seconds < wizardData.sendingConfig.min_delay_seconds) {
          setError('Delay máximo deve ser maior que o mínimo');
          return false;
        }
        break;
    }
    
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      setError(null);

      const campaignData: CampaignForm = {
        name: wizardData.basic.name,
        api_config_id: wizardData.basic.api_config_id,
        google_sheets_url: wizardData.basic.google_sheets_url || undefined,
        sheet_id_column: wizardData.basic.sheet_id_column || undefined,
        scheduled_at: wizardData.basic.scheduled_at || undefined
      };

      let newCampaign: Campaign;
      
      if (campaign) {
        newCampaign = await updateCampaign(campaign.id, campaignData);
      } else {
        newCampaign = await createCampaign(campaignData);
      }

      // TODO: Implementar salvamento de contatos, mensagens e configurações
      // Isso será feito nos próximos componentes

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar campanha');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CampaignBasicInfo
            data={wizardData.basic}
            apiConfigurations={configurations}
            onChange={(data) => handleStepData('basic', data)}
          />
        );
      case 1:
        return (
          <CampaignContactImport
            data={wizardData.contacts}
            onChange={(data) => handleStepData('contacts', data)}
          />
        );
      case 2:
        return (
          <CampaignMessageEditor
            data={wizardData.messages}
            contacts={wizardData.contacts}
            onChange={(data) => handleStepData('messages', data)}
          />
        );
      case 3:
        return (
          <CampaignSendingConfig
            data={wizardData.sendingConfig}
            onChange={(data) => handleStepData('sendingConfig', data)}
          />
        );
      case 4:
        return (
          <CampaignReview
            basicData={wizardData.basic}
            contacts={wizardData.contacts}
            messages={wizardData.messages}
            sendingConfig={wizardData.sendingConfig}
            apiConfigurations={configurations}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {campaign ? 'Editar Campanha' : 'Nova Campanha'}
            </h2>
            <p className="text-gray-600 mt-1">
              {wizardSteps[currentStep]?.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.current 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    step.current ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < wizardSteps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                <span>{loading ? 'Salvando...' : (campaign ? 'Atualizar' : 'Criar Campanha')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};