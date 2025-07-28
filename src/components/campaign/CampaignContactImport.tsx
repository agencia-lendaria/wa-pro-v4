'use client'

import React, { useState } from 'react';
import { Upload, Users, Plus, Trash2, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { CampaignService } from '../../services/campaignService';
import { CampaignContactForm, ContactImportResult } from '../../types/campaign';

interface CampaignContactImportProps {
  data: CampaignContactForm[];
  onChange: (data: CampaignContactForm[]) => void;
}

export const CampaignContactImport: React.FC<CampaignContactImportProps> = ({ 
  data, 
  onChange 
}) => {
  const [importMethod, setImportMethod] = useState<'csv' | 'manual'>('csv');
  const [csvText, setCsvText] = useState('');
  const [importResult, setImportResult] = useState<ContactImportResult | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Para adicionar contato manual
  const [manualContact, setManualContact] = useState({
    phone_number: '',
    name: '',
    external_id: ''
  });

  const handleCSVImport = async () => {
    if (!csvText.trim()) return;

    try {
      setProcessing(true);
      const result = CampaignService.parseCSVContacts(csvText);
      setImportResult(result);
      
      if (result.success_count > 0) {
        onChange([...data, ...result.preview]);
      }
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleManualAdd = () => {
    if (!manualContact.phone_number.trim()) return;

    const phoneNumber = manualContact.phone_number.replace(/\D/g, '');
    if (phoneNumber.length < 10) {
      alert('Número de telefone deve ter pelo menos 10 dígitos');
      return;
    }

    // Verificar se o número já existe
    const existingContact = data.find(contact => 
      contact.phone_number.replace(/\D/g, '') === phoneNumber
    );

    if (existingContact) {
      alert('Este número já foi adicionado');
      return;
    }

    const newContact: CampaignContactForm = {
      phone_number: phoneNumber,
      name: manualContact.name.trim() || undefined,
      external_id: manualContact.external_id.trim() || undefined
    };

    onChange([...data, newContact]);
    
    // Limpar formulário
    setManualContact({
      phone_number: '',
      name: '',
      external_id: ''
    });
  };

  const handleRemoveContact = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja remover todos os contatos?')) {
      onChange([]);
      setImportResult(null);
    }
  };

  const downloadTemplate = () => {
    const template = 'ID,Telefone,Nome,Empresa\n1,5511912345678,João Silva,Empresa ABC\n2,5511987654321,Maria Santos,Empresa XYZ';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_contatos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Importar Contatos
        </h3>
        <p className="text-gray-600 mb-6">
          Adicione os contatos que receberão as mensagens da campanha.
        </p>
      </div>

      {/* Método de Importação */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Como deseja adicionar os contatos?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="importMethod"
              value="csv"
              checked={importMethod === 'csv'}
              onChange={(e) => setImportMethod(e.target.value as 'csv')}
              className="mr-3"
            />
            <div className="flex items-center space-x-3">
              <Upload className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Importar CSV</h4>
                <p className="text-sm text-gray-600">Cole ou digite dados em formato CSV</p>
              </div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="importMethod"
              value="manual"
              checked={importMethod === 'manual'}
              onChange={(e) => setImportMethod(e.target.value as 'manual')}
              className="mr-3"
            />
            <div className="flex items-center space-x-3">
              <Plus className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Adicionar Manual</h4>
                <p className="text-sm text-gray-600">Adicione contatos um por vez</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Importação CSV */}
      {importMethod === 'csv' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Dados CSV
            </label>
            <button
              onClick={downloadTemplate}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Template</span>
            </button>
          </div>
          
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ID,Telefone,Nome,Empresa&#10;1,5511912345678,João Silva,Empresa ABC&#10;2,5511987654321,Maria Santos,Empresa XYZ"
          />
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCSVImport}
              disabled={!csvText.trim() || processing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {processing ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{processing ? 'Processando...' : 'Importar CSV'}</span>
            </button>
          </div>

          {/* Resultado da Importação */}
          {importResult && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Resultado da Importação</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-600">{importResult.success_count}</span> contatos importados
                </div>
                <div>
                  <span className="font-medium text-red-600">{importResult.error_count}</span> erros encontrados
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-red-900 mb-1">Erros:</h5>
                  <div className="space-y-1">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        Linha {error.row}: {error.message}
                      </p>
                    ))}
                    {importResult.errors.length > 5 && (
                      <p className="text-sm text-red-600">
                        ... e mais {importResult.errors.length - 5} erros
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Adição Manual */}
      {importMethod === 'manual' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                value={manualContact.phone_number}
                onChange={(e) => setManualContact(prev => ({ ...prev, phone_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5511912345678"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={manualContact.name}
                onChange={(e) => setManualContact(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="João Silva"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Externo
              </label>
              <input
                type="text"
                value={manualContact.external_id}
                onChange={(e) => setManualContact(prev => ({ ...prev, external_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123"
              />
            </div>
          </div>
          
          <button
            onClick={handleManualAdd}
            disabled={!manualContact.phone_number.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Contato</span>
          </button>
        </div>
      )}

      {/* Lista de Contatos */}
      {data.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Contatos Adicionados ({data.length})</span>
            </h4>
            
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Todos</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((contact, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {contact.phone_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {contact.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {contact.external_id || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleRemoveContact(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Estado Vazio */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contato adicionado</h3>
          <p className="text-gray-600">
            Adicione pelo menos um contato para prosseguir com a campanha
          </p>
        </div>
      )}
    </div>
  );
};