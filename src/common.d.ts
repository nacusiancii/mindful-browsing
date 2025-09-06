export interface MindfulBreak {
  id: string;
  label: string;
  enabled: boolean;
}

export interface Settings {
  enabled: boolean;
  pauseDuration: number;
  reflectionDelay: number;
  showStats: boolean;
  gentleReminders: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
}

export interface DefaultState {
  mindfulSites: string[];
  settings: Settings;
  reflectionPrompts: string[];
  mindfulBreaks: MindfulBreak[];
}

export interface ActivityLogItem {
  site: string;
  timestamp: number;
  action: string;
  intention?: string;
  breakActivity?: string;
}

export interface LocalState {
  activityLog?: ActivityLogItem[];
  localSchemaVersion?: number;
}

export interface SyncState extends DefaultState {
  syncSchemaVersion?: number;
}

export interface ExtendedState extends SyncState, LocalState {}

export declare const defaultState: DefaultState;
