import { useState, useEffect, useCallback } from 'react';
import { CampaignService } from '../services/campaignService';
import { 
  Campaign, 
  CampaignForm, 
  CampaignWithDetails,
  CampaignStats
} from '../types/campaign';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CampaignService.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar campanhas';
      setError(errorMessage);
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = useCallback(async (formData: CampaignForm): Promise<Campaign> => {
    try {
      setError(null);
      const newCampaign = await CampaignService.createCampaign(formData);
      setCampaigns(prev => [newCampaign, ...prev]);
      return newCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar campanha';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, formData: Partial<CampaignForm>): Promise<Campaign> => {
    try {
      setError(null);
      const updatedCampaign = await CampaignService.updateCampaign(id, formData);
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id ? updatedCampaign : campaign
        )
      );
      return updatedCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar campanha';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await CampaignService.deleteCampaign(id);
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar campanha';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateCampaignStatus = useCallback(async (id: string, status: Campaign['status']): Promise<void> => {
    try {
      setError(null);
      const updatedCampaign = await CampaignService.updateCampaignStatus(id, status);
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id ? updatedCampaign : campaign
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status da campanha';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateCampaignStatus
  };
};

export const useCampaignDetails = (campaignId: string | null) => {
  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaignDetails = useCallback(async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      setError(null);
      
      const [campaignData, statsData] = await Promise.all([
        CampaignService.getCampaignById(campaignId),
        CampaignService.getCampaignStats(campaignId)
      ]);
      
      setCampaign(campaignData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar detalhes da campanha';
      setError(errorMessage);
      console.error('Error fetching campaign details:', err);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  const refreshStats = useCallback(async () => {
    if (!campaignId) return;

    try {
      const statsData = await CampaignService.getCampaignStats(campaignId);
      setStats(statsData);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaignDetails();
  }, [fetchCampaignDetails]);

  return {
    campaign,
    stats,
    loading,
    error,
    fetchCampaignDetails,
    refreshStats
  };
};