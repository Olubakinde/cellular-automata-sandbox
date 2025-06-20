import { useState, useEffect, useCallback } from 'react';
import { RuleSet, MarketplaceState } from '../types';
import { marketplaceAPI } from '../utils/marketplaceAPI';

export function useMarketplace() {
  const [state, setState] = useState<MarketplaceState>({
    rules: [],
    loading: false,
    error: null
  });

  // Load rules from API
  const loadRules = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const rules = await marketplaceAPI.getRules();
      setState(prev => ({ ...prev, rules, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load rules' 
      }));
    }
  }, []);

  // Subscribe to a rule
  const subscribeToRule = useCallback(async (rule: RuleSet) => {
    try {
      await marketplaceAPI.subscribeToRule(rule.id);
      return rule;
    } catch (error) {
      console.error('Failed to subscribe to rule:', error);
      throw error;
    }
  }, []);

  // Submit a new rule
  const submitRule = useCallback(async (ruleData: Omit<RuleSet, 'id' | 'votes' | 'createdAt'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newRule = await marketplaceAPI.addRule(ruleData);
      setState(prev => ({ 
        ...prev, 
        rules: [newRule, ...prev.rules],
        loading: false 
      }));
      return newRule;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to submit rule' 
      }));
      throw error;
    }
  }, []);

  // Vote on a rule
  const voteRule = useCallback(async (ruleId: string, vote: 1 | -1) => {
    try {
      await marketplaceAPI.voteRule(ruleId, vote);
      
      // Update local state
      setState(prev => ({
        ...prev,
        rules: prev.rules.map(rule => 
          rule.id === ruleId 
            ? { ...rule, votes: rule.votes + vote }
            : rule
        )
      }));
    } catch (error) {
      console.error('Failed to vote on rule:', error);
    }
  }, []);

  // Search rules
  const searchRules = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadRules();
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const rules = await marketplaceAPI.searchRules(query);
      setState(prev => ({ ...prev, rules, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Search failed' 
      }));
    }
  }, [loadRules]);

  // Get rules by tag
  const getRulesByTag = useCallback(async (tag: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const rules = await marketplaceAPI.getRulesByTag(tag);
      setState(prev => ({ ...prev, rules, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to filter by tag' 
      }));
    }
  }, []);

  // Get popular rules
  const getPopularRules = useCallback(async (limit?: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const rules = await marketplaceAPI.getPopularRules(limit);
      setState(prev => ({ ...prev, rules, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load popular rules' 
      }));
    }
  }, []);

  // Get recent rules
  const getRecentRules = useCallback(async (limit?: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const rules = await marketplaceAPI.getRecentRules(limit);
      setState(prev => ({ ...prev, rules, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load recent rules' 
      }));
    }
  }, []);

  // Reset to sample data
  const resetToSample = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await marketplaceAPI.resetToSample();
      await loadRules();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to reset data' 
      }));
    }
  }, [loadRules]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load rules on mount
  useEffect(() => {
    loadRules();
  }, [loadRules]);

  return {
    ...state,
    loadRules,
    subscribeToRule,
    submitRule,
    voteRule,
    searchRules,
    getRulesByTag,
    getPopularRules,
    getRecentRules,
    resetToSample,
    clearError
  };
} 