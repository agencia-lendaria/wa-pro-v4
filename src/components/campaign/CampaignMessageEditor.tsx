'use client'

import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Eye, AlertCircle } from 'lucide-react';
import { CampaignMessageForm, CampaignContactForm, MessageVariable } from '../../types/campaign';
import { CampaignService } from '../../services/campaignService';

interface CampaignMessageEditorProps {
  data: CampaignMessageForm[];
  contacts: CampaignContactForm[];
  onChange: (data: CampaignMessageForm[]) => void;
}

export const CampaignMessageEditor: React.FC<CampaignMessageEditorProps> = ({ 
  data, 
  contacts,
  onChange 
}) => {
  const [newMessage, setNewMessage] = useState({
    content_type: 'text' as const,
    content: '',
    media_url: '',
    order_index: data.length
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewContact, setPreviewContact] = useState<CampaignContactForm | null>(null);

  // Variáveis disponíveis para uso nas mensagens
  const availableVariables: MessageVariable[] = [
    { key: 'nome', label: 'Nome', example: 'João Silva' },
    { key: 'telefone', label: 'Telefone', example: '5511912345678' },
    { key: 'id', label: 'ID', example: '123' },
  ];

  // Adicionar variáveis de campos customizados baseadas nos contatos
  const customFields = new Set<string>();
  contacts.forEach(contact => {
    if (contact.custom_fields) {
      Object.keys(contact.custom_fields).forEach(field => customFields.add(field));
    }
  });

  customFields.forEach(field => {
    availableVariables.push({
      key: field,
      label: field,
      example: 'Valor exemplo'
    });
  });

  const handleAddMessage = () => {
    if (!newMessage.content.trim()) return;

    const message: CampaignMessageForm = {
      ...newMessage,
      order_index: data.length
    };

    onChange([...data, message]);
    
    // Limpar formulário
    setNewMessage({
      content_type: 'text',
      content: '',
      media_url: '',
      order_index: data.length + 1
    });
  };

  const handleRemoveMessage = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    // Reordenar índices
    const reorderedData = newData.map((msg, i) => ({ ...msg, order_index: i }));
    onChange(reorderedData);
  };

  const handleUpdateMessage = (index: number, field: string, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const insertVariable = (messageIndex: number, variable: string) => {
    const newData = [...data];
    const message = newData[messageIndex];
    const cursorPos = 0; // Simplified - in real implementation would get cursor position
    const newContent = message.content + `{{${variable}}}`;
    newData[messageIndex] = { ...message, content: newContent };
    onChange(newData);
  };

  const getPreviewMessage = (message: CampaignMessageForm, contact: CampaignContactForm): string => {
    if (!contact) return message.content;
    return CampaignService.processMessageVariables(message.content, {
      ...contact,
      id: contact.external_id || '',
      campaign_id: '',
      status: 'pending',
      created_at: '',
      updated_at: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Criar Mensagens
        </h3>
        <p className="text-gray-600 mb-6">
          Componha as mensagens que serão enviadas na campanha. Use variáveis para personalizar.
        </p>
      </div>

      {/* Variáveis Disponíveis */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Variáveis Disponíveis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableVariables.map((variable) => (
            <div
              key={variable.key}
              className="bg-white px-3 py-2 rounded-md border border-blue-200 text-sm"
            >
              <code className="text-blue-800 font-mono">
                {`{{${variable.key}}}`}
              </code>
              <p className="text-blue-600 text-xs mt-1">{variable.label}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Clique em "Inserir" ao lado de cada mensagem para adicionar variáveis facilmente.
        </p>
      </div>

      {/* Adicionar Nova Mensagem */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Adicionar Nova Mensagem</h4>
        
        <div className="space-y-4">
          {/* Tipo de Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conteúdo
            </label>
            <select
              value={newMessage.content_type}
              onChange={(e) => setNewMessage(prev => ({ ...prev, content_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">Texto</option>
              <option value="image">Imagem</option>
              <option value="video">Vídeo</option>
              <option value="audio">Áudio</option>
              <option value="document">Documento</option>
            </select>
          </div>

          {/* URL da Mídia (se não for texto) */}
          {newMessage.content_type !== 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Mídia
              </label>
              <input
                type="url"
                value={newMessage.media_url}
                onChange={(e) => setNewMessage(prev => ({ ...prev, media_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://exemplo.com/arquivo.jpg"
              />
            </div>
          )}

          {/* Conteúdo da Mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {newMessage.content_type === 'text' ? 'Texto da Mensagem' : 'Legenda (opcional)'}
            </label>
            <textarea
              value={newMessage.content}
              onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua mensagem aqui... Use {{nome}}, {{telefone}}, etc."
            />
          </div>

          <button
            onClick={handleAddMessage}
            disabled={!newMessage.content.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Mensagem</span>
          </button>
        </div>
      </div>

      {/* Lista de Mensagens */}
      {data.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Mensagens da Campanha ({data.length})</span>
            </h4>

            {contacts.length > 0 && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Ocultar' : 'Mostrar'} Preview</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {data.map((message, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      Mensagem {index + 1}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded capitalize">
                      {message.content_type}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveMessage(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {message.media_url && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Mídia:</p>
                    <p className="text-sm text-blue-600 break-all">{message.media_url}</p>
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo:
                  </label>
                  <textarea
                    value={message.content}
                    onChange={(e) => handleUpdateMessage(index, 'content', e.target.value)}
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Botões de Variáveis */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableVariables.slice(0, 4).map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(index, variable.key)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    >
                      Inserir {variable.label}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                {showPreview && contacts.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview (usando primeiro contato):
                    </p>
                    <p className="text-sm text-gray-900">
                      {getPreviewMessage(message, contacts[0])}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mensagem criada</h3>
          <p className="text-gray-600">
            Adicione pelo menos uma mensagem para prosseguir com a campanha
          </p>
        </div>
      )}

      {/* Alerta se não há contatos */}
      {contacts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Adicione contatos na etapa anterior para visualizar o preview das mensagens personalizadas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};