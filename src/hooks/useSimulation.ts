import { useState, useEffect, useRef, useCallback } from 'react';
import { CellRule, GridState, SimulationConfig } from '../types';

// Default configuration
const DEFAULT_CONFIG: SimulationConfig = {
  rule: { birth: [3], survival: [2, 3] },
  speed: 100,
  isRunning: false,
  zoom: 10,
  panX: 0,
  panY: 0
};

const DEFAULT_GRID_SIZE = 200;

export function useSimulation() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [gridState, setGridState] = useState<GridState>({
    width: DEFAULT_GRID_SIZE,
    height: DEFAULT_GRID_SIZE,
    cells: new Uint8Array(DEFAULT_GRID_SIZE * DEFAULT_GRID_SIZE)
  });
  
  const workerRef = useRef<Worker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/simulationWorker.ts', import.meta.url),
        { type: 'module' }
      );

      // Handle worker messages
      workerRef.current.onmessage = (event) => {
        const { type, payload } = event.data;
        
        switch (type) {
          case 'SIMULATION_RESULT':
            setGridState(prev => ({
              ...prev,
              cells: payload.newState
            }));
            isProcessingRef.current = false;
            break;
            
          case 'GRID_INITIALIZED':
            setGridState(prev => ({
              ...prev,
              cells: payload.initialState
            }));
            break;
            
          case 'RULE_UPDATED':
            console.log('Rule updated in worker:', payload.rule);
            break;
        }
      };

      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        isProcessingRef.current = false;
      };

      // Initialize grid in worker
      workerRef.current.postMessage({
        type: 'INIT_GRID',
        payload: {
          width: DEFAULT_GRID_SIZE,
          height: DEFAULT_GRID_SIZE,
          initialPattern: [
            // Add a simple glider pattern
            { x: 10, y: 10 },
            { x: 11, y: 10 },
            { x: 12, y: 10 },
            { x: 12, y: 11 },
            { x: 11, y: 12 }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to initialize worker:', error);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Animation loop
  const stepSimulation = useCallback(() => {
    if (!workerRef.current || !config.isRunning || isProcessingRef.current) return;

    const now = performance.now();
    const timeSinceLastStep = now - lastStepTimeRef.current;
    const stepInterval = 1000 / config.speed;

    if (timeSinceLastStep >= stepInterval) {
      try {
        // Create a copy of the current state to avoid detached buffer issues
        const currentStateCopy = new Uint8Array(gridState.cells);
        
        isProcessingRef.current = true;
        workerRef.current.postMessage({
          type: 'SIMULATION_STEP',
          payload: {
            currentState: currentStateCopy,
            width: gridState.width,
            height: gridState.height,
            rule: config.rule
          }
        }, [currentStateCopy.buffer]);
        
        lastStepTimeRef.current = now;
      } catch (error) {
        console.error('Error sending message to worker:', error);
        isProcessingRef.current = false;
      }
    }

    animationFrameRef.current = requestAnimationFrame(stepSimulation);
  }, [config.isRunning, config.speed, config.rule, gridState]);

  // Start/stop animation loop
  useEffect(() => {
    if (config.isRunning) {
      animationFrameRef.current = requestAnimationFrame(stepSimulation);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [config.isRunning, stepSimulation]);

  // Single step function
  const step = useCallback(() => {
    if (!workerRef.current || isProcessingRef.current) return;
    
    try {
      // Create a copy of the current state to avoid detached buffer issues
      const currentStateCopy = new Uint8Array(gridState.cells);
      
      isProcessingRef.current = true;
      workerRef.current.postMessage({
        type: 'SIMULATION_STEP',
        payload: {
          currentState: currentStateCopy,
          width: gridState.width,
          height: gridState.height,
          rule: config.rule
        }
      }, [currentStateCopy.buffer]);
    } catch (error) {
      console.error('Error in step function:', error);
      isProcessingRef.current = false;
    }
  }, [gridState, config.rule]);

  // Reset function
  const reset = useCallback(() => {
    if (!workerRef.current) return;
    
    try {
      workerRef.current.postMessage({
        type: 'INIT_GRID',
        payload: {
          width: gridState.width,
          height: gridState.height
        }
      });
    } catch (error) {
      console.error('Error in reset function:', error);
    }
  }, [gridState.width, gridState.height]);

  // Update rule
  const updateRule = useCallback((rule: CellRule) => {
    setConfig(prev => ({ ...prev, rule }));
    
    if (workerRef.current) {
      try {
        workerRef.current.postMessage({
          type: 'UPDATE_RULE',
          payload: { rule }
        });
      } catch (error) {
        console.error('Error updating rule:', error);
      }
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    setConfig(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  // Update speed
  const updateSpeed = useCallback((speed: number) => {
    setConfig(prev => ({ ...prev, speed }));
  }, []);

  // Update zoom
  const updateZoom = useCallback((zoom: number) => {
    setConfig(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(15, zoom)) }));
  }, []);

  // Update pan
  const updatePan = useCallback((deltaX: number, deltaY: number) => {
    setConfig(prev => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY
    }));
  }, []);

  // Toggle cell at position
  const toggleCell = useCallback((x: number, y: number) => {
    const index = y * gridState.width + x;
    const newCells = new Uint8Array(gridState.cells);
    newCells[index] = newCells[index] === 1 ? 0 : 1;
    
    setGridState(prev => ({
      ...prev,
      cells: newCells
    }));
  }, [gridState.width, gridState.cells]);

  return {
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
  };
} 