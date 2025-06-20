import { CellRule } from '../types';

/**
 * Parses a rule string in the format "B3/S23" (birth/survival notation)
 * @param ruleString - The rule string to parse
 * @returns CellRule object with birth and survival arrays
 */
export function parseRuleString(ruleString: string): CellRule {
  const trimmed = ruleString.trim().toUpperCase();
  const match = trimmed.match(/^B(\d+)\/S(\d+)$/);
  
  if (!match) {
    throw new Error('Invalid rule format. Expected format: B3/S23');
  }
  
  const birthDigits = match[1].split('').map(Number);
  const survivalDigits = match[2].split('').map(Number);
  
  return {
    birth: birthDigits,
    survival: survivalDigits
  };
}

/**
 * Formats a CellRule object into a string representation
 * @param rule - The rule object to format
 * @returns Formatted rule string
 */
export function formatRuleString(rule: CellRule): string {
  const birthStr = rule.birth.sort().join('');
  const survivalStr = rule.survival.sort().join('');
  return `B${birthStr}/S${survivalStr}`;
}

/**
 * Validates a rule string format
 * @param ruleString - The rule string to validate
 * @returns true if valid, false otherwise
 */
export function isValidRuleString(ruleString: string): boolean {
  try {
    parseRuleString(ruleString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the display name for common rules
 * @param rule - The rule object
 * @returns Display name or formatted string
 */
export function getRuleDisplayName(rule: CellRule): string {
  const ruleString = formatRuleString(rule);
  
  // Common rule names
  const commonRules: Record<string, string> = {
    'B3/S23': "Conway's Game of Life",
    'B36/S23': 'HighLife',
    'B3/S1234': 'Replicator',
    'B2/S': 'Seeds',
    'B25/S4': 'Day & Night',
    'B1357/S1357': 'Fredkin',
    'B1/S1': 'Gnarl',
    'B1/S012345678': 'Live Free or Die',
    'B5678/S45678': 'Maze',
    'B3/S012345678': 'Maze with Mice',
    'B3/S12345': 'Mazectric',
    'B2/S0': 'Serviettes',
    'B234/S': 'Walled Cities',
    'B45678/S2345': 'Coral',
    'B45678/S123': 'Anneal',
    'B45678/S012345678': 'Diamoeba',
    'B35678/S5678': 'Amoeba',
    'B378/S012345678': 'Pseudo Life',
    'B378/S235678': '2x2',
    'B36/S125': 'Move',
    'B368/S245': 'Morley',
    'B4678/S35678': 'Dot Life'
  };
  
  return commonRules[ruleString] || ruleString;
}

/**
 * Exports a rule to JSON format
 * @param rule - The rule object
 * @param name - Optional name for the rule
 * @returns JSON string
 */
export function exportRuleToJSON(rule: CellRule, name?: string): string {
  const exportData = {
    name: name || getRuleDisplayName(rule),
    rule: rule,
    ruleString: formatRuleString(rule),
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Imports a rule from JSON format
 * @param jsonString - The JSON string to parse
 * @returns The rule object
 */
export function importRuleFromJSON(jsonString: string): { rule: CellRule; name: string } {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.rule || !data.rule.birth || !data.rule.survival) {
      throw new Error('Invalid rule data in JSON');
    }
    
    return {
      rule: data.rule,
      name: data.name || getRuleDisplayName(data.rule)
    };
  } catch (error) {
    throw new Error(`Failed to import rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 