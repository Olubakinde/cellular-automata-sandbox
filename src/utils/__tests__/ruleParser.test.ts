import {
  parseRuleString,
  formatRuleString,
  isValidRuleString,
  getRuleDisplayName,
  exportRuleToJSON,
  importRuleFromJSON
} from '../ruleParser';

describe('ruleParser', () => {
  describe('parseRuleString', () => {
    it('should parse valid rule strings', () => {
      expect(parseRuleString('B3/S23')).toEqual({
        birth: [3],
        survival: [2, 3]
      });

      expect(parseRuleString('B36/S23')).toEqual({
        birth: [3, 6],
        survival: [2, 3]
      });

      expect(parseRuleString('B2/S')).toEqual({
        birth: [2],
        survival: []
      });
    });

    it('should handle whitespace', () => {
      expect(parseRuleString(' B3/S23 ')).toEqual({
        birth: [3],
        survival: [2, 3]
      });
    });

    it('should be case insensitive', () => {
      expect(parseRuleString('b3/s23')).toEqual({
        birth: [3],
        survival: [2, 3]
      });
    });

    it('should throw error for invalid format', () => {
      expect(() => parseRuleString('invalid')).toThrow('Invalid rule format');
      expect(() => parseRuleString('B3')).toThrow('Invalid rule format');
      expect(() => parseRuleString('S23')).toThrow('Invalid rule format');
    });
  });

  describe('formatRuleString', () => {
    it('should format rules correctly', () => {
      expect(formatRuleString({ birth: [3], survival: [2, 3] })).toBe('B3/S23');
      expect(formatRuleString({ birth: [3, 6], survival: [2, 3] })).toBe('B36/S23');
      expect(formatRuleString({ birth: [2], survival: [] })).toBe('B2/S');
    });

    it('should sort digits', () => {
      expect(formatRuleString({ birth: [3, 1], survival: [3, 2, 1] })).toBe('B13/S123');
    });
  });

  describe('isValidRuleString', () => {
    it('should return true for valid rules', () => {
      expect(isValidRuleString('B3/S23')).toBe(true);
      expect(isValidRuleString('B36/S23')).toBe(true);
      expect(isValidRuleString('B2/S')).toBe(true);
    });

    it('should return false for invalid rules', () => {
      expect(isValidRuleString('invalid')).toBe(false);
      expect(isValidRuleString('B3')).toBe(false);
      expect(isValidRuleString('S23')).toBe(false);
    });
  });

  describe('getRuleDisplayName', () => {
    it('should return common rule names', () => {
      expect(getRuleDisplayName({ birth: [3], survival: [2, 3] })).toBe("Conway's Game of Life");
      expect(getRuleDisplayName({ birth: [3, 6], survival: [2, 3] })).toBe('HighLife');
    });

    it('should return formatted string for unknown rules', () => {
      expect(getRuleDisplayName({ birth: [1, 2], survival: [3, 4] })).toBe('B12/S34');
    });
  });

  describe('exportRuleToJSON', () => {
    it('should export rule to JSON format', () => {
      const rule = { birth: [3], survival: [2, 3] };
      const json = exportRuleToJSON(rule, 'Test Rule');
      
      const parsed = JSON.parse(json);
      expect(parsed.name).toBe('Test Rule');
      expect(parsed.rule).toEqual(rule);
      expect(parsed.ruleString).toBe('B3/S23');
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should use rule display name if no name provided', () => {
      const rule = { birth: [3], survival: [2, 3] };
      const json = exportRuleToJSON(rule);
      
      const parsed = JSON.parse(json);
      expect(parsed.name).toBe("Conway's Game of Life");
    });
  });

  describe('importRuleFromJSON', () => {
    it('should import rule from JSON format', () => {
      const rule = { birth: [3], survival: [2, 3] };
      const json = exportRuleToJSON(rule, 'Test Rule');
      
      const result = importRuleFromJSON(json);
      expect(result.rule).toEqual(rule);
      expect(result.name).toBe('Test Rule');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importRuleFromJSON('invalid json')).toThrow('Failed to import rule');
    });

    it('should throw error for missing rule data', () => {
      expect(() => importRuleFromJSON('{"name": "test"}')).toThrow('Invalid rule data in JSON');
    });
  });
}); 