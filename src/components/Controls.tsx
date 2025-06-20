import React, { useState } from 'react';
import { ControlsProps } from '../types';
import { parseRuleString, formatRuleString, isValidRuleString, exportRuleToJSON, importRuleFromJSON } from '../utils/ruleParser';

export const Controls: React.FC<ControlsProps> = ({
  config,
  onPlayPause,
  onStep,
  onReset,
  onSpeedChange,
  onRuleChange,
  onZoomChange
}) => {
  const [ruleInput, setRuleInput] = useState(formatRuleString(config.rule));
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [importText, setImportText] = useState('');

  const handleRuleInputChange = (value: string) => {
    setRuleInput(value);
    setRuleError(null);
    
    if (isValidRuleString(value)) {
      try {
        const rule = parseRuleString(value);
        onRuleChange(rule);
      } catch (error) {
        setRuleError('Invalid rule format');
      }
    }
  };

  const handleExportRule = () => {
    const json = exportRuleToJSON(config.rule);
    navigator.clipboard.writeText(json);
  };

  const handleImportRule = () => {
    try {
      const { rule } = importRuleFromJSON(importText);
      onRuleChange(rule);
      setRuleInput(formatRuleString(rule));
      setImportText('');
      setShowImportExport(false);
    } catch (error) {
      setRuleError(error instanceof Error ? error.message : 'Import failed');
    }
  };

  const handleZoomIn = () => onZoomChange(config.zoom + 0.5);
  const handleZoomOut = () => onZoomChange(config.zoom - 0.5);
  const handleZoomReset = () => onZoomChange(1);

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Controls</h2>
      
      {/* Playback Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onPlayPause}
          className={`px-4 py-2 rounded font-medium ${
            config.isRunning 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {config.isRunning ? '⏸️ Pause' : '▶️ Play'}
        </button>
        
        <button
          onClick={onStep}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
        >
          ⏭️ Step
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
        >
          🔄 Reset
        </button>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Speed: {config.speed} FPS
        </label>
        <input
          type="range"
          min="1"
          max="400"
          value={config.speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Rule Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Rule (B3/S23 format)
        </label>
        <input
          type="text"
          value={ruleInput}
          onChange={(e) => handleRuleInputChange(e.target.value)}
          className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white ${
            ruleError ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="B3/S23"
        />
        {ruleError && (
          <p className="text-red-400 text-sm">{ruleError}</p>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleZoomOut}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          🔍-
        </button>
        <span className="text-sm text-gray-300 min-w-[60px] text-center">
          {Math.round(config.zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          🔍+
        </button>
        <button
          onClick={handleZoomReset}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          Reset
        </button>
      </div>

      {/* Import/Export */}
      <div className="space-y-2">
        <button
          onClick={() => setShowImportExport(!showImportExport)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showImportExport ? 'Hide' : 'Show'} Import/Export
        </button>
        
        {showImportExport && (
          <div className="space-y-2 p-3 bg-gray-700 rounded">
            <div className="flex space-x-2">
              <button
                onClick={handleExportRule}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                Export to Clipboard
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Import Rule JSON:
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
                rows={4}
                placeholder="Paste rule JSON here..."
              />
              <button
                onClick={handleImportRule}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                Import
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>• Click cells to toggle them on/off</p>
        <p>• Drag to pan around the grid</p>
        <p>• Scroll to zoom in/out</p>
        <p>• Rules format: B[birth]/S[survival] (e.g., B3/S23)</p>
      </div>
    </div>
  );
}; 