import { useState, useEffect, useCallback } from 'react';
import { ApiConfiguration, ApiConfigurationForm, ApiTestResponse } from '../types/api';
import { ApiService } from '../services/apiService';

export const useApiConfigurations = () => {
  const [configurations, setConfigurations] = useState<ApiConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações
  const loadConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getApiConfigurations();
      setConfigurations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova configuração
  const createConfiguration = useCallback(async (formData: ApiConfigurationForm): Promise<ApiConfiguration> => {
    try {
      setError(null);
      const newConfig = await ApiService.createApiConfiguration(formData);
      setConfigurations(prev => [newConfig, ...prev]);
      return newConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar configuração';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Atualizar configuração
  const updateConfiguration = useCallback(async (id: string, formData: Partial<ApiConfigurationForm>): Promise<ApiConfiguration> => {
    try {
      setError(null);
      const updatedConfig = await ApiService.updateApiConfiguration(id, formData);
      setConfigurations(prev => 
        prev.map(config => config.id === id ? updatedConfig : config)
      );
      return updatedConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Deletar configuração
  const deleteConfiguration = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await ApiService.deleteApiConfiguration(id);
      setConfigurations(prev => prev.filter(config => config.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar configuração';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Alternar status
  const toggleStatus = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    try {
      setError(null);
      const updatedConfig = await ApiService.toggleApiStatus(id, isActive);
      setConfigurations(prev => 
        prev.map(config => config.id === id ? updatedConfig : config)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Testar conexão
  const testConnection = useCallback(async (id: string): Promise<ApiTestResponse> => {
    try {
      setError(null);
      const result = await ApiService.testApiConnection(id);
      
      // Atualizar o status local
      setConfigurations(prev => 
        prev.map(config => 
          config.id === id 
            ? { 
                ...config, 
                connection_status: result.success ? 'connected' : 'error',
                last_tested_at: new Date().toISOString()
              }
            : config
        )
      );
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao testar conexão';
      setError(errorMessage);
      
      // Atualizar status para erro
      setConfigurations(prev => 
        prev.map(config => 
          config.id === id 
            ? { 
                ...config, 
                connection_status: 'error',
                last_tested_at: new Date().toISOString()
              }
            : config
        )
      );
      
      throw new Error(errorMessage);
    }
  }, []);

  // Carregar ao montar o componente
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  return {
    configurations,
    loading,
    error,
    loadConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    toggleStatus,
    testConnection
  };
};