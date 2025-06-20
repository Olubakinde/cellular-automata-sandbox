import React, { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Controls } from './components/Controls';
import { Marketplace } from './components/Marketplace';
import { useSimulation } from './hooks/useSimulation';
import { useMarketplace } from './hooks/useMarketplace';
import './App.css';

function HowToPlayModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-200">
          <li><b>Draw:</b> Click and drag on the grid to set cells alive.</li>
          <li><b>Erase:</b> (Optional) Use right-click or a modifier key to pan, not erase.</li>
          <li><b>Pan:</b> Right-click and drag, or hold a modifier key and drag.</li>
          <li><b>Zoom:</b> Scroll your mouse wheel over the grid to zoom in/out (10% to 1500%).</li>
          <li><b>Play/Pause:</b> Use the controls to start or stop the simulation.</li>
          <li><b>Step:</b> Advance the simulation by one generation.</li>
          <li><b>Reset:</b> Clear the grid and start over.</li>
          <li><b>Change Rules:</b> Enter custom rules in B3/S23 format (e.g., B36/S23 for HighLife).</li>
          <li><b>Marketplace:</b> Browse, vote, and import community rules.</li>
          <li><b>Import/Export:</b> Save or load rules as JSON.</li>
        </ul>
        <div className="mt-4 text-center text-gray-400 text-sm">
          Tip: Try drawing a glider or exploring the marketplace for cool patterns!
        </div>
      </div>
      <div className="fixed inset-0" onClick={onClose} />
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'marketplace'>('simulation');
  const [showHowTo, setShowHowTo] = useState(false);
  
  const {
    config,
    gridState,
    step,
    reset,
    togglePlayPause,
    updateRule,
    updateSpeed,
    updateZoom,
    updatePan,
    toggleCell
  } = useSimulation();

  const {
    rules,
    loading,
    error,
    subscribeToRule,
    submitRule,
    voteRule,
    clearError
  } = useMarketplace();

  const handleSubscribe = async (rule: any) => {
    try {
      await subscribeToRule(rule);
      updateRule(rule.rule);
      setActiveTab('simulation');
    } catch (error) {
      console.error('Failed to subscribe to rule:', error);
    }
  };

  const handleSubmitRule = async (ruleData: any) => {
    try {
      await submitRule(ruleData);
    } catch (error) {
      console.error('Failed to submit rule:', error);
    }
  };

  const handleVote = async (ruleId: string, vote: 1 | -1) => {
    await voteRule(ruleId, vote);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <HowToPlayModal open={showHowTo} onClose={() => setShowHowTo(false)} />
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-center md:text-left">
              🧬 Cellular Automata Sandbox Explorer
            </h1>
            <p className="text-center md:text-left text-gray-400 mt-2">
              Explore, create, and share cellular automata rules
            </p>
          </div>
          <button
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow"
            onClick={() => setShowHowTo(true)}
          >
            How to Play
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'simulation'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              🎮 Simulation
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              🏪 Marketplace
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto min-h-0">
        {activeTab === 'simulation' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full p-6">
            {/* Canvas Container */}
            <div className="lg:col-span-3 h-full">
              <div className="bg-gray-800 rounded-lg p-2 h-full relative">
                <Canvas
                  gridState={gridState}
                  config={config}
                  onCellClick={toggleCell}
                  onCanvasDrag={updatePan}
                  onZoom={(delta) => updateZoom(config.zoom + delta)}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="lg:col-span-1 overflow-y-auto">
              <Controls
                config={config}
                onPlayPause={togglePlayPause}
                onStep={step}
                onReset={reset}
                onSpeedChange={updateSpeed}
                onRuleChange={updateRule}
                onZoomChange={updateZoom}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <Marketplace
              rules={rules}
              onSubscribe={handleSubscribe}
              onSubmitRule={handleSubmitRule}
              onVote={handleVote}
            />
            
            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-600 text-white rounded-lg">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button
                    onClick={clearError}
                    className="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="mt-4 p-4 bg-blue-600 text-white rounded-lg text-center">
                Loading...
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 flex-shrink-0">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400">
            <p>
              Built with React, TypeScript, and Web Workers • 
              <a 
                href="https://github.com" 
                className="text-blue-400 hover:text-blue-300 ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </p>
            <p className="mt-2 text-sm">
              Click cells to toggle • Drag to pan • Scroll to zoom • 
              Rules format: B[birth]/S[survival]
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
