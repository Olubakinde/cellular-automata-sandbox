// Core cellular automata types
export interface CellRule {
  birth: number[];
  survival: number[];
}

export interface CellPosition {
  x: number;
  y: number;
}

export interface GridState {
  width: number;
  height: number;
  cells: Uint8Array;
}

export interface SimulationConfig {
  rule: CellRule;
  speed: number;
  isRunning: boolean;
  zoom: number;
  panX: number;
  panY: number;
}

// Marketplace types
export interface RuleSet {
  id: string;
  name: string;
  description: string;
  rule: CellRule;
  author: string;
  votes: number;
  createdAt: string;
  tags: string[];
}

export interface MarketplaceState {
  rules: RuleSet[];
  loading: boolean;
  error: string | null;
}

// Worker message types
export interface WorkerMessage {
  type: 'SIMULATION_STEP' | 'INIT_GRID' | 'UPDATE_RULE';
  payload: any;
}

export interface SimulationStepMessage extends WorkerMessage {
  type: 'SIMULATION_STEP';
  payload: {
    currentState: Uint8Array;
    width: number;
    height: number;
    rule: CellRule;
  };
}

export interface InitGridMessage extends WorkerMessage {
  type: 'INIT_GRID';
  payload: {
    width: number;
    height: number;
    initialPattern?: CellPosition[];
  };
}

export interface UpdateRuleMessage extends WorkerMessage {
  type: 'UPDATE_RULE';
  payload: {
    rule: CellRule;
  };
}

// UI component props
export interface CanvasProps {
  gridState: GridState;
  config: SimulationConfig;
  onCellClick: (x: number, y: number) => void;
  onCanvasDrag: (deltaX: number, deltaY: number) => void;
  onZoom: (delta: number) => void;
}

export interface ControlsProps {
  config: SimulationConfig;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onRuleChange: (rule: CellRule) => void;
  onZoomChange: (zoom: number) => void;
}

export interface MarketplaceProps {
  rules: RuleSet[];
  onSubscribe: (rule: RuleSet) => void;
  onSubmitRule: (rule: Omit<RuleSet, 'id' | 'votes' | 'createdAt'>) => void;
  onVote: (ruleId: string, vote: 1 | -1) => void;
} 