import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Zap, Check, X } from 'lucide-react';

interface ApiConfig {
  id: string;
  name: string;
  type: 'evolution_v2' | 'meta_cloud';
  status: boolean;
  created_at: string;
}

export const APIs: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null);
  const [apiType, setApiType] = useState<'evolution_v2' | 'meta_cloud'>('evolution_v2');
  
  const [apis] = useState<ApiConfig[]>([
    {
      id: '1',
      name: 'Evolution Principal',
      type: 'evolution_v2',
      status: true,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Meta Cloud Backup',
      type: 'meta_cloud',
      status: false,
      created_at: '2024-01-10'
    }
  ]);

  const handleAddNew = () => {
    setEditingApi(null);
    setShowModal(true);
  };

  const handleEdit = (api: ApiConfig) => {
    setEditingApi(api);
    setApiType(api.type);
    setShowModal(true);
  };

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

      {/* API Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apis.map((api) => (
          <div key={api.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  api.type === 'evolution_v2' ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  <Zap className={`w-5 h-5 ${
                    api.type === 'evolution_v2' ? 'text-purple-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{api.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {api.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                api.status ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  api.status ? 'text-green-600' : 'text-red-600'
                }`}>
                  {api.status ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Criada em:</span>
                <span className="text-gray-900">
                  {new Date(api.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(api)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md font-medium hover:bg-gray-200 flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                <Trash2 className="w-4 h-4" />
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

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Configuração
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Evolution Principal"
                    defaultValue={editingApi?.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de API
                  </label>
                  <select
                    value={apiType}
                    onChange={(e) => setApiType(e.target.value as 'evolution_v2' | 'meta_cloud')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="evolution_v2">Evolution API v2</option>
                    <option value="meta_cloud">Meta Cloud API</option>
                  </select>
                </div>

                {/* Evolution API Fields */}
                {apiType === 'evolution_v2' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Instância
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="minha-instancia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Token de Acesso
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="seu-token-aqui"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Telefone
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+5511999999999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Base
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://api.evolution.com"
                      />
                    </div>
                  </>
                )}

                {/* Meta Cloud API Fields */}
                {apiType === 'meta_cloud' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Instância
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="minha-instancia-meta"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="EAAxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234567890123456"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Account ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234567890123456"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
                  >
                    Salvar
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