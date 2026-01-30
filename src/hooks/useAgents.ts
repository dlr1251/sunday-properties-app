import { useState, useEffect, useCallback } from 'react';
import { agentsRepository, AgentProfile, AgentFilters, CreateAgentInput, UpdateAgentInput } from '../lib/db/repositories/agents.repo';
import { Result, isOk, isErr } from '../lib/utils/result';
import { AppError, toUserMessage } from '../lib/utils/errors';
import { logError } from '../lib/utils/logger';
import { toast } from 'sonner';

interface UseAgentsOptions {
  filters?: AgentFilters;
  autoFetch?: boolean;
}

interface UseAgentsReturn {
  agents: AgentProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateAgent: (input: UpdateAgentInput) => Promise<boolean>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  createAgent: (input: CreateAgentInput) => Promise<boolean>;
  stats: {
    total: number;
    verified: number;
    pending: number;
    active_properties: number;
    sold_properties: number;
    total_sales_value: number;
    average_rating: number;
    top_specializations: Array<{ specialization: string; count: number }>;
  } | null;
}

export function useAgents({
  filters = {},
  autoFetch = true
}: UseAgentsOptions = {}): UseAgentsReturn {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseAgentsReturn['stats']>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await agentsRepository.getAgents(filters);

      if (isOk(result)) {
        setAgents(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch agents', { filters, error: result.error });
      }
    } catch (err: any) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch agents', { filters, error: err });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await agentsRepository.getAgentStats();

      if (isOk(result)) {
        setStats(result.data);
      }
    } catch (err) {
      logError('Failed to fetch agent stats', { error: err });
    }
  }, []);

  const updateAgent = useCallback(async (input: UpdateAgentInput): Promise<boolean> => {
    try {
      const result = await agentsRepository.updateAgent(input);

      if (isOk(result)) {
        // Update local state
        setAgents(prev => prev.map(agent =>
          agent.id === input.id
            ? { ...agent, ...input }
            : agent
        ));

        // Update stats
        await fetchStats();

        toast.success('Agente actualizado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to update agent', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update agent', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const deleteAgent = useCallback(async (agentId: string): Promise<boolean> => {
    try {
      const result = await agentsRepository.deleteAgent(agentId);

      if (isOk(result)) {
        // Remove agent from local state
        setAgents(prev => prev.filter(agent => agent.id !== agentId));

        // Update stats
        await fetchStats();

        toast.success('Agente eliminado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to delete agent', { agentId, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to delete agent', { agentId, error: err });
      return false;
    }
  }, [fetchStats]);

  const createAgent = useCallback(async (input: CreateAgentInput): Promise<boolean> => {
    try {
      const result = await agentsRepository.createAgent(input);

      if (isOk(result)) {
        // Add new agent to local state
        setAgents(prev => [result.data, ...prev]);

        // Update stats
        await fetchStats();

        toast.success('Agente creado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to create agent', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to create agent', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchAgents(), fetchStats()]);
  }, [fetchAgents, fetchStats]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [refetch, autoFetch]);

  return {
    agents,
    loading,
    error,
    refetch,
    updateAgent,
    deleteAgent,
    createAgent,
    stats
  };
}

// Hook for agent profile management
export function useAgentProfile(agentId: string) {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = useCallback(async () => {
    if (!agentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await agentsRepository.getAgentById(agentId);

      if (isOk(result)) {
        setAgent(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch agent profile', { agentId, error: result.error });
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch agent profile', { agentId, error: err });
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const updateProfile = useCallback(async (data: Partial<AgentProfile>): Promise<boolean> => {
    try {
      if (!agent) return false;

      const result = await agentsRepository.updateAgent({
        id: agent.id,
        ...data
      } as UpdateAgentInput);

      if (isOk(result)) {
        setAgent(prev => prev ? { ...prev, ...data } : null);
        toast.success('Perfil actualizado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update agent profile', { agentId, data, error: err });
      return false;
    }
  }, [agent, agentId]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  return {
    agent,
    loading,
    error,
    refetch: fetchAgent,
    updateProfile
  };
}
