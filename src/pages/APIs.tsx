'use client'

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Zap, Check, X, TestTube, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useApiConfigurations } from '../hooks/useApiConfigurations';
import { ApiConfiguration, ApiConfigurationForm } from '../types/api';

export const APIs: React.FC = () => {
  const {
    configurations,
    loading,
    error,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    toggleStatus,
    testConnection
  } = useApiConfigurations();

  const [showModal, setShowModal] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiConfiguration | null>(null);
  const [formData, setFormData] = useState<ApiConfigurationForm>({
    name: '',
    api_type: 'evolution_web',
    instance_name: '',
    access_token: '',
    phone_number: '',
    phone_number_id: '',
    base_url: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ApiConfigurationForm>>({});
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      api_type: 'evolution_web',
      instance_name: '',
      access_token: '',
      phone_number: '',
      phone_number_id: '',
      base_url: ''
    });
    setFormErrors({});
  };

  const handleAddNew = () => {
    setEditingApi(null);
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (api: ApiConfiguration) => {
    setEditingApi(api);
    setFormData({
      name: api.name,
      api_type: api.api_type,
      instance_name: api.instance_name || '',
      access_token: '', // Não preencher por segurança
      phone_number: api.phone_number || '',
      phone_number_id: api.phone_number_id || '',
      base_url: api.base_url || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<ApiConfigurationForm> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.access_token.trim() && !editingApi) {
      errors.access_token = 'Token de acesso é obrigatório';
    }

    if (formData.api_type === 'evolution_web' || formData.api_type === 'evolution_cloud') {
      if (!formData.instance_name?.trim()) {
        errors.instance_name = 'Nome da instância é obrigatório';
      }
      if (!formData.base_url?.trim()) {
        errors.base_url = 'URL base é obrigatória';
      }
    }

    if (formData.api_type === 'meta_cloud') {
      if (!formData.phone_number_id?.trim()) {
        errors.phone_number_id = 'Phone Number ID é obrigatório';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      if (editingApi) {
        // Não enviar token vazio na atualização
        const updateData = { ...formData };
        if (!updateData.access_token.trim()) {
          delete updateData.access_token;
        }
        await updateConfiguration(editingApi.id, updateData);
      } else {
        await createConfiguration(formData);
      }
      
      setShowModal(false);
      resetForm();
    } catch (err) {
      // Erro já é tratado pelo hook
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a configuração "${name}"?`)) {
      try {
        await deleteConfiguration(id);
      } catch (err) {
        // Erro já é tratado pelo hook
      }
    }
  };

  const handleToggleStatus = async (api: ApiConfiguration) => {
    try {
      await toggleStatus(api.id, !api.is_active);
    } catch (err) {
      // Erro já é tratado pelo hook
    }
  };

  const handleTestConnection = async (api: ApiConfiguration) => {
    try {
      setTestingConnection(api.id);
      const result = await testConnection(api.id);
      
      if (result.success) {
        alert(`✅ Conexão bem-sucedida!\n${result.message}`);
      } else {
        alert(`❌ Falha na conexão:\n${result.message}`);
      }
    } catch (err) {
      alert(`❌ Erro ao testar conexão:\n${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setTestingConnection(null);
    }
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'unknown':
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações de API</h1>
          <p className="text-gray-600 mt-1">Gerencie suas conexões com as APIs do WhatsApp</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova API</span>
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

      {/* API Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configurations.map((api) => (
          <div key={api.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  api.api_type.includes('evolution') ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  <Zap className={`w-5 h-5 ${
                    api.api_type.includes('evolution') ? 'text-purple-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{api.name}</h3>
                  <p className="text-sm text-gray-500">
                    {getApiTypeLabel(api.api_type)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getConnectionStatusIcon(api.connection_status)}
                <div className={`w-3 h-3 rounded-full ${
                  api.is_active ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  api.is_active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {api.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Conexão:</span>
                <span className={`font-medium capitalize ${
                  api.connection_status === 'connected' ? 'text-green-600' : 
                  api.connection_status === 'error' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {api.connection_status === 'connected' ? 'Conectada' :
                   api.connection_status === 'error' ? 'Erro' : 'Não testada'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Criada em:</span>
                <span className="text-gray-900">
                  {new Date(api.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(api)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md font-medium hover:bg-gray-200 flex items-center justify-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleTestConnection(api)}
                  disabled={testingConnection === api.id}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                  title="Testar Conexão"
                >
                  {testingConnection === api.id ? (
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(api.id, api.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => handleToggleStatus(api)}
                className={`w-full px-3 py-2 rounded-md text-sm font-medium ${
                  api.is_active 
                    ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {api.is_active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <div
          onClick={handleAddNew}
          className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
        >
          <div className="text-center">
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Adicionar Nova API</h3>
            <p className="text-sm text-gray-600">
              Configure uma nova conexão com WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingApi ? 'Editar API' : 'Nova Configuração de API'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Configuração
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Evolution Principal"
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de API
                  </label>
                  <select
                    value={formData.api_type}
                    onChange={(e) => setFormData({ ...formData, api_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="evolution_web">Evolution API (WhatsApp Web)</option>
                    <option value="evolution_cloud">Evolution API (Cloud Meta)</option>
                    <option value="meta_cloud">Meta Cloud API</option>
                  </select>
                </div>

                {/* Evolution API Fields */}
                {(formData.api_type === 'evolution_web' || formData.api_type === 'evolution_cloud') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Base
                      </label>
                      <input
                        type="url"
                        value={formData.base_url}
                        onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.base_url ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="https://evo.api.com"
                      />
                      {formErrors.base_url && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.base_url}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Instância
                      </label>
                      <input
                        type="text"
                        value={formData.instance_name}
                        onChange={(e) => setFormData({ ...formData, instance_name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.instance_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="nome_da_instancia"
                      />
                      {formErrors.instance_name && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.instance_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Token de Acesso (API Key)
                      </label>
                      <input
                        type="password"
                        value={formData.access_token}
                        onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.access_token ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={editingApi ? 'Deixe vazio para manter o atual' : '12345-ABCD'}
                      />
                      {formErrors.access_token && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.access_token}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Telefone
                      </label>
                      <input
                        type="text"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5511912345678"
                      />
                    </div>
                  </>
                )}

                {/* Meta Cloud API Fields */}
                {formData.api_type === 'meta_cloud' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={formData.access_token}
                        onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.access_token ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={editingApi ? 'Deixe vazio para manter o atual' : 'EAAxxxxxxxxx'}
                      />
                      {formErrors.access_token && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.access_token}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number ID
                      </label>
                      <input
                        type="text"
                        value={formData.phone_number_id}
                        onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.phone_number_id ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="1234567890123456"
                      />
                      {formErrors.phone_number_id && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.phone_number_id}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {saving && (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    )}
                    <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};