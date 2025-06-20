import { RuleSet } from '../types';

// Sample initial rules
const SAMPLE_RULES: RuleSet[] = [
  {
    id: '1',
    name: "Conway's Game of Life",
    description: 'The classic cellular automaton that creates complex patterns from simple rules.',
    rule: { birth: [3], survival: [2, 3] },
    author: 'John Conway',
    votes: 150,
    createdAt: '2024-01-01T00:00:00Z',
    tags: ['classic', 'life', 'stable']
  },
  {
    id: '2',
    name: 'HighLife',
    description: 'A variant of Conway\'s Game of Life that produces replicators.',
    rule: { birth: [3, 6], survival: [2, 3] },
    author: 'Brian Silverman',
    votes: 89,
    createdAt: '2024-01-15T00:00:00Z',
    tags: ['replicator', 'variant', 'interesting']
  },
  {
    id: '3',
    name: 'Seeds',
    description: 'A simple rule that creates sparse patterns.',
    rule: { birth: [2], survival: [] },
    author: 'Community',
    votes: 45,
    createdAt: '2024-02-01T00:00:00Z',
    tags: ['simple', 'sparse', 'fast']
  },
  {
    id: '4',
    name: 'Day & Night',
    description: 'A rule with interesting symmetry properties.',
    rule: { birth: [2, 5], survival: [4] },
    author: 'Community',
    votes: 67,
    createdAt: '2024-02-15T00:00:00Z',
    tags: ['symmetry', 'balanced', 'chaotic']
  },
  {
    id: '5',
    name: 'Maze',
    description: 'Creates maze-like patterns that are stable.',
    rule: { birth: [5, 6, 7, 8], survival: [4, 5, 6, 7, 8] },
    author: 'Community',
    votes: 78,
    createdAt: '2024-03-01T00:00:00Z',
    tags: ['maze', 'stable', 'structured']
  }
];

const STORAGE_KEY = 'cellular_automata_marketplace';

// Load rules from localStorage or use sample data
function loadRules(): RuleSet[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load rules from localStorage:', error);
  }
  return [...SAMPLE_RULES];
}

// Save rules to localStorage
function saveRules(rules: RuleSet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (error) {
    console.warn('Failed to save rules to localStorage:', error);
  }
}

// Simulate API delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class MarketplaceAPI {
  private rules: RuleSet[] = loadRules();

  // Get all rules
  async getRules(): Promise<RuleSet[]> {
    await delay(100); // Simulate network delay
    return [...this.rules];
  }

  // Add a new rule
  async addRule(ruleData: Omit<RuleSet, 'id' | 'votes' | 'createdAt'>): Promise<RuleSet> {
    await delay(200);
    
    const newRule: RuleSet = {
      ...ruleData,
      id: Date.now().toString(),
      votes: 0,
      createdAt: new Date().toISOString()
    };
    
    this.rules.unshift(newRule);
    saveRules(this.rules);
    
    return newRule;
  }

  // Vote on a rule
  async voteRule(ruleId: string, vote: 1 | -1): Promise<void> {
    await delay(100);
    
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.votes += vote;
      saveRules(this.rules);
    }
  }

  // Subscribe to a rule (just returns the rule data)
  async subscribeToRule(ruleId: string): Promise<RuleSet> {
    await delay(50);
    
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error('Rule not found');
    }
    
    return rule;
  }

  // Search rules
  async searchRules(query: string): Promise<RuleSet[]> {
    await delay(150);
    
    const lowerQuery = query.toLowerCase();
    return this.rules.filter(rule => 
      rule.name.toLowerCase().includes(lowerQuery) ||
      rule.description.toLowerCase().includes(lowerQuery) ||
      rule.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get rules by tag
  async getRulesByTag(tag: string): Promise<RuleSet[]> {
    await delay(100);
    
    return this.rules.filter(rule => 
      rule.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  // Get popular rules
  async getPopularRules(limit: number = 10): Promise<RuleSet[]> {
    await delay(100);
    
    return this.rules
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }

  // Get recent rules
  async getRecentRules(limit: number = 10): Promise<RuleSet[]> {
    await delay(100);
    
    return this.rules
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Reset to sample data
  async resetToSample(): Promise<void> {
    await delay(100);
    
    this.rules = [...SAMPLE_RULES];
    saveRules(this.rules);
  }
}

// Export singleton instance
export const marketplaceAPI = new MarketplaceAPI(); 