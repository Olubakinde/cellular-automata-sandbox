import React, { useState } from 'react';
import { MarketplaceProps, RuleSet } from '../types';
import { formatRuleString } from '../utils/ruleParser';

export const Marketplace: React.FC<MarketplaceProps> = ({
  rules,
  onSubscribe,
  onSubmitRule,
  onVote
}) => {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'name' | 'date'>('votes');
  const [searchTerm, setSearchTerm] = useState('');
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    ruleString: '',
    author: '',
    tags: ''
  });

  // Filter and sort rules
  const filteredAndSortedRules = rules
    .filter(rule => 
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const handleSubmitRule = () => {
    try {
      // Parse the rule string to validate it
      const birthMatch = newRule.ruleString.match(/B(\d+)/);
      const survivalMatch = newRule.ruleString.match(/S(\d+)/);
      
      if (!birthMatch || !survivalMatch) {
        throw new Error('Invalid rule format');
      }

      const rule = {
        birth: birthMatch[1].split('').map(Number),
        survival: survivalMatch[1].split('').map(Number)
      };

      const tags = newRule.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      onSubmitRule({
        name: newRule.name,
        description: newRule.description,
        rule,
        author: newRule.author,
        tags
      });

      // Reset form
      setNewRule({
        name: '',
        description: '',
        ruleString: '',
        author: '',
        tags: ''
      });
      setShowSubmitForm(false);
    } catch (error) {
      alert('Invalid rule format. Please use B3/S23 format.');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Rule Marketplace</h2>
        <button
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
        >
          {showSubmitForm ? 'Cancel' : 'Submit Rule'}
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Search rules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'votes' | 'name' | 'date')}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        >
          <option value="votes">Sort by Votes</option>
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {/* Submit Form */}
      {showSubmitForm && (
        <div className="p-4 bg-gray-700 rounded-lg space-y-3">
          <h3 className="text-lg font-semibold text-white">Submit New Rule</h3>
          
          <input
            type="text"
            placeholder="Rule name"
            value={newRule.name}
            onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          />
          
          <textarea
            placeholder="Rule description"
            value={newRule.description}
            onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            rows={3}
          />
          
          <input
            type="text"
            placeholder="Rule (e.g., B3/S23)"
            value={newRule.ruleString}
            onChange={(e) => setNewRule(prev => ({ ...prev, ruleString: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          />
          
          <input
            type="text"
            placeholder="Your name"
            value={newRule.author}
            onChange={(e) => setNewRule(prev => ({ ...prev, author: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          />
          
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={newRule.tags}
            onChange={(e) => setNewRule(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleSubmitRule}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Submit
            </button>
            <button
              onClick={() => setShowSubmitForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAndSortedRules.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No rules found</p>
        ) : (
          filteredAndSortedRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onSubscribe={onSubscribe}
              onVote={onVote}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface RuleCardProps {
  rule: RuleSet;
  onSubscribe: (rule: RuleSet) => void;
  onVote: (ruleId: string, vote: 1 | -1) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onSubscribe, onVote }) => {
  return (
    <div className="bg-gray-700 p-3 rounded-lg space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{rule.name}</h3>
          <p className="text-sm text-gray-300">{rule.description}</p>
          <p className="text-xs text-gray-400">
            by {rule.author} • {new Date(rule.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-400">{rule.votes}</div>
          <div className="text-xs text-gray-400">votes</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">
            {formatRuleString(rule.rule)}
          </span>
          {rule.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onVote(rule.id, 1)}
            className="text-green-400 hover:text-green-300 text-lg"
          >
            ▲
          </button>
          <button
            onClick={() => onVote(rule.id, -1)}
            className="text-red-400 hover:text-red-300 text-lg"
          >
            ▼
          </button>
          <button
            onClick={() => onSubscribe(rule)}
            className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}; 