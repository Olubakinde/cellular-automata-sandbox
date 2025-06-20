import { CellRule, WorkerMessage, SimulationStepMessage, InitGridMessage, UpdateRuleMessage } from '../types';

// Worker context
let currentRule: CellRule = { birth: [3], survival: [2, 3] };

// Type the worker context properly - avoid using 'self' directly
const workerContext = globalThis as unknown as Worker;

/**
 * Counts the number of live neighbors for a given cell position
 * @param cells - The current grid state
 * @param x - X coordinate of the cell
 * @param y - Y coordinate of the cell
 * @param width - Grid width
 * @param height - Grid height
 * @returns Number of live neighbors (0-8)
 */
function countNeighbors(cells: Uint8Array, x: number, y: number, width: number, height: number): number {
  let count = 0;
  
  // Check all 8 neighbors using toroidal boundary conditions
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue; // Skip the cell itself
      
      const nx = (x + dx + width) % width;
      const ny = (y + dy + height) % height;
      const index = ny * width + nx;
      
      if (cells[index] === 1) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * Performs one simulation step using the current rule
 * @param currentState - Current grid state
 * @param width - Grid width
 * @param height - Grid height
 * @param rule - The rule to apply
 * @returns New grid state
 */
function simulationStep(
  currentState: Uint8Array, 
  width: number, 
  height: number, 
  rule: CellRule
): Uint8Array {
  const newState = new Uint8Array(currentState.length);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const currentCell = currentState[index];
      const neighbors = countNeighbors(currentState, x, y, width, height);
      
      let newCell = 0;
      
      if (currentCell === 1) {
        // Survival rule
        if (rule.survival.includes(neighbors)) {
          newCell = 1;
        }
      } else {
        // Birth rule
        if (rule.birth.includes(neighbors)) {
          newCell = 1;
        }
      }
      
      newState[index] = newCell;
    }
  }
  
  return newState;
}

/**
 * Creates an initial grid with optional pattern
 * @param width - Grid width
 * @param height - Grid height
 * @param initialPattern - Optional array of live cell positions
 * @returns Initial grid state
 */
function createInitialGrid(width: number, height: number, initialPattern?: Array<{x: number, y: number}>): Uint8Array {
  const cells = new Uint8Array(width * height);
  
  if (initialPattern) {
    for (const pos of initialPattern) {
      const x = (pos.x + width) % width;
      const y = (pos.y + height) % height;
      const index = y * width + x;
      cells[index] = 1;
    }
  }
  
  return cells;
}

// Handle messages from the main thread
workerContext.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SIMULATION_STEP': {
      const { currentState, width, height, rule } = payload as SimulationStepMessage['payload'];
      const newState = simulationStep(currentState, width, height, rule);
      
      // Transfer the buffer to avoid copying
      workerContext.postMessage({
        type: 'SIMULATION_RESULT',
        payload: { newState }
      }, [newState.buffer]);
      break;
    }
    
    case 'INIT_GRID': {
      const { width, height, initialPattern } = payload as InitGridMessage['payload'];
      const initialState = createInitialGrid(width, height, initialPattern);
      
      workerContext.postMessage({
        type: 'GRID_INITIALIZED',
        payload: { initialState }
      }, [initialState.buffer]);
      break;
    }
    
    case 'UPDATE_RULE': {
      const { rule } = payload as UpdateRuleMessage['payload'];
      currentRule = rule;
      
      workerContext.postMessage({
        type: 'RULE_UPDATED',
        payload: { rule: currentRule }
      });
      break;
    }
    
    default:
      console.warn('Unknown message type:', type);
  }
});

// Export types for TypeScript
export type { CellRule, WorkerMessage }; 